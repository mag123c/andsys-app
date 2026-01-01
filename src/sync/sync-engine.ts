import { db } from "@/storage/local/db";
import { createClient } from "@/storage/remote/client";
import { projectRemoteRepository } from "@/storage/remote/project.remote";
import { chapterRemoteRepository } from "@/storage/remote/chapter.remote";
import { synopsisRemoteRepository } from "@/storage/remote/synopsis.remote";
import { characterRemoteRepository } from "@/storage/remote/character.remote";
import { relationshipRemoteRepository } from "@/storage/remote/relationship.remote";
import {
  isBase64Image,
  uploadProjectCover,
  uploadCharacterImage,
} from "@/storage/remote/storage";
import { syncQueue, type EntityType, type SyncOperation } from "./sync-queue";
import type { Project, Chapter, Synopsis, Character, Relationship } from "@/repositories/types";

export type SyncStatus = "idle" | "syncing" | "error";

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: string[];
}

export interface SyncEventPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: Record<string, unknown> | null;
  old_record: Record<string, unknown> | null;
}

/**
 * 동기화 엔진
 * - 로컬 pending 항목을 서버로 동기화
 * - 충돌 해결 (latest-wins, pending 상태 보존)
 * - Supabase Realtime으로 실시간 동기화
 * - 서버 삭제 항목 로컬 삭제
 */
export class SyncEngine {
  private _status: SyncStatus = "idle";
  private _isSyncing = false;
  private _pendingCount = 0;
  private _lastError: string | null = null;
  private listeners: Set<() => void> = new Set();

  get status(): SyncStatus {
    return this._status;
  }

  get pendingCount(): number {
    return this._pendingCount;
  }

  get lastError(): string | null {
    return this._lastError;
  }

  /**
   * 상태 변경 구독
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  private setStatus(status: SyncStatus, error?: string): void {
    this._status = status;
    if (error) {
      this._lastError = error;
    } else if (status === "idle") {
      this._lastError = null;
    }
    this.notifyListeners();
  }

  /**
   * pending 항목 수 업데이트
   */
  async updatePendingCount(): Promise<void> {
    const queueCount = await syncQueue.count();
    const pendingProjects = await db.projects.where("syncStatus").equals("pending").count();
    const pendingChapters = await db.chapters.where("syncStatus").equals("pending").count();
    const pendingSynopses = await db.synopses.where("syncStatus").equals("pending").count();
    const pendingCharacters = await db.characters.where("syncStatus").equals("pending").count();
    const pendingRelationships = await db.relationships.where("syncStatus").equals("pending").count();

    this._pendingCount = queueCount + pendingProjects + pendingChapters + pendingSynopses + pendingCharacters + pendingRelationships;
    this.notifyListeners();
  }

  /**
   * 모든 pending 항목 동기화
   */
  async syncAll(): Promise<SyncResult> {
    if (this._isSyncing) {
      return { success: true, synced: 0, failed: 0, errors: [] };
    }

    // 인증 상태 확인
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return { success: true, synced: 0, failed: 0, errors: [] };
    }

    this._isSyncing = true;
    this.setStatus("syncing");

    const result: SyncResult = {
      success: true,
      synced: 0,
      failed: 0,
      errors: [],
    };

    try {
      // 1. 큐에 있는 항목들 처리
      await this.processQueue(result);

      // 2. pending 상태인 로컬 항목들 동기화 (종속성 순서 보장)
      const syncedProjectIds = await this.syncPendingProjects(result);
      await this.syncPendingDependents(result, syncedProjectIds);

      await this.updatePendingCount();
      this.setStatus(result.failed > 0 ? "error" : "idle", result.errors[0]);
    } catch (error) {
      result.success = false;
      const errorMsg = error instanceof Error ? error.message : String(error);
      result.errors.push(errorMsg);
      this.setStatus("error", errorMsg);
    } finally {
      this._isSyncing = false;
    }

    return result;
  }

  /**
   * pending 종속 항목 동기화 (프로젝트 동기화 성공 후)
   */
  private async syncPendingDependents(result: SyncResult, syncedProjectIds: Set<string>): Promise<void> {
    // 동기화된 프로젝트 또는 이미 synced 상태 프로젝트의 종속 항목만 처리
    const validProjectIds = new Set<string>();

    // syncedProjectIds에 있는 것들 추가
    syncedProjectIds.forEach(id => validProjectIds.add(id));

    // 이미 synced 상태인 프로젝트도 추가
    const syncedProjects = await db.projects
      .where("syncStatus")
      .equals("synced")
      .toArray();
    syncedProjects.forEach(p => validProjectIds.add(p.id));

    await this.syncPendingChapters(result, validProjectIds);
    await this.syncPendingSynopses(result, validProjectIds);
    await this.syncPendingCharacters(result, validProjectIds);
    await this.syncPendingRelationships(result, validProjectIds);
  }

  /**
   * 큐 항목 순차 처리
   */
  private async processQueue(result: SyncResult): Promise<void> {
    const items = await syncQueue.getAll();

    for (const item of items) {
      try {
        await this.processQueueItem(
          item.entityType as EntityType,
          item.entityId,
          item.operation as SyncOperation,
          item.payload
        );
        await syncQueue.complete(item.id!);
        result.synced++;
      } catch (error) {
        await syncQueue.fail(item.id!);
        result.failed++;
        result.errors.push(
          `${item.entityType}/${item.entityId}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  }

  /**
   * 단일 큐 항목 처리
   */
  private async processQueueItem(
    entityType: EntityType,
    entityId: string,
    operation: SyncOperation,
    payload: unknown
  ): Promise<void> {
    switch (entityType) {
      case "project":
        await this.syncProjectItem(entityId, operation, payload);
        break;
      case "chapter":
        await this.syncChapterItem(entityId, operation, payload);
        break;
      case "synopsis":
        await this.syncSynopsisItem(entityId, operation, payload);
        break;
      case "character":
        await this.syncCharacterItem(entityId, operation, payload);
        break;
      case "relationship":
        await this.syncRelationshipItem(entityId, operation, payload);
        break;
    }
  }

  /**
   * 프로젝트 항목 동기화
   */
  private async syncProjectItem(
    id: string,
    operation: SyncOperation,
    payload: unknown
  ): Promise<void> {
    const data = payload as {
      title?: string;
      description?: string | null;
      genre?: string | null;
      status?: string;
      userId?: string;
    };

    switch (operation) {
      case "create":
        if (data.userId) {
          await projectRemoteRepository.create(
            { title: data.title!, description: data.description, genre: data.genre },
            { userId: data.userId }
          );
        }
        break;
      case "update":
        await projectRemoteRepository.update(id, {
          title: data.title,
          description: data.description,
          genre: data.genre,
          status: data.status as Project["status"],
        });
        break;
      case "delete":
        await projectRemoteRepository.delete(id);
        break;
    }

    // 로컬 syncStatus 업데이트
    await db.projects.update(id, {
      syncStatus: "synced",
      lastSyncedAt: new Date(),
    });
  }

  /**
   * 챕터 항목 동기화
   */
  private async syncChapterItem(
    id: string,
    operation: SyncOperation,
    payload: unknown
  ): Promise<void> {
    const data = payload as {
      projectId?: string;
      title?: string;
      content?: unknown;
      status?: string;
    };

    switch (operation) {
      case "create":
        await chapterRemoteRepository.create({
          projectId: data.projectId!,
          title: data.title!,
          content: data.content as Chapter["content"],
        });
        break;
      case "update":
        await chapterRemoteRepository.update(id, {
          title: data.title,
          content: data.content as Chapter["content"],
          status: data.status as Chapter["status"],
        });
        break;
      case "delete":
        await chapterRemoteRepository.delete(id);
        break;
    }

    // 로컬 syncStatus 업데이트
    if (operation !== "delete") {
      await db.chapters.update(id, {
        syncStatus: "synced",
        lastSyncedAt: new Date(),
      });
    }
  }

  /**
   * 시놉시스 항목 동기화
   */
  private async syncSynopsisItem(
    id: string,
    operation: SyncOperation,
    payload: unknown
  ): Promise<void> {
    const data = payload as {
      projectId?: string;
      content?: unknown;
    };

    switch (operation) {
      case "create":
        await synopsisRemoteRepository.create({
          projectId: data.projectId!,
          content: data.content as Synopsis["content"],
        });
        break;
      case "update":
        await synopsisRemoteRepository.update(id, {
          content: data.content as Synopsis["content"],
        });
        break;
      case "delete":
        await synopsisRemoteRepository.delete(id);
        break;
    }

    if (operation !== "delete") {
      await db.synopses.update(id, {
        syncStatus: "synced",
        lastSyncedAt: new Date(),
      });
    }
  }

  /**
   * 캐릭터 항목 동기화
   */
  private async syncCharacterItem(
    id: string,
    operation: SyncOperation,
    payload: unknown
  ): Promise<void> {
    const data = payload as Partial<Character> & { projectId?: string };

    switch (operation) {
      case "create":
        await characterRemoteRepository.create({
          projectId: data.projectId!,
          name: data.name!,
          nickname: data.nickname,
          age: data.age,
          gender: data.gender,
          race: data.race,
          imageUrl: data.imageUrl,
          height: data.height,
          weight: data.weight,
          appearance: data.appearance,
          mbti: data.mbti,
          personality: data.personality,
          education: data.education,
          occupation: data.occupation,
          affiliation: data.affiliation,
          background: data.background,
          customFields: data.customFields,
        });
        break;
      case "update":
        await characterRemoteRepository.update(id, {
          name: data.name,
          nickname: data.nickname,
          age: data.age,
          gender: data.gender,
          race: data.race,
          imageUrl: data.imageUrl,
          height: data.height,
          weight: data.weight,
          appearance: data.appearance,
          mbti: data.mbti,
          personality: data.personality,
          education: data.education,
          occupation: data.occupation,
          affiliation: data.affiliation,
          background: data.background,
          customFields: data.customFields,
        });
        break;
      case "delete":
        await characterRemoteRepository.delete(id);
        break;
    }

    if (operation !== "delete") {
      await db.characters.update(id, {
        syncStatus: "synced",
        lastSyncedAt: new Date(),
      });
    }
  }

  /**
   * 관계 항목 동기화
   */
  private async syncRelationshipItem(
    id: string,
    operation: SyncOperation,
    payload: unknown
  ): Promise<void> {
    const data = payload as Partial<Relationship> & {
      projectId?: string;
      fromCharacterId?: string;
      toCharacterId?: string;
    };

    switch (operation) {
      case "create":
        await relationshipRemoteRepository.create({
          projectId: data.projectId!,
          fromCharacterId: data.fromCharacterId!,
          toCharacterId: data.toCharacterId!,
          type: data.type!,
          bidirectional: data.bidirectional!,
          description: data.description,
        });
        break;
      case "update":
        await relationshipRemoteRepository.update(id, {
          type: data.type,
          description: data.description,
          bidirectional: data.bidirectional,
        });
        break;
      case "delete":
        await relationshipRemoteRepository.delete(id);
        break;
    }

    if (operation !== "delete") {
      await db.relationships.update(id, {
        syncStatus: "synced",
        lastSyncedAt: new Date(),
      });
    }
  }

  /**
   * pending 상태의 프로젝트 동기화
   * @returns 동기화 성공한 프로젝트 ID 집합
   */
  private async syncPendingProjects(result: SyncResult): Promise<Set<string>> {
    const supabase = createClient();
    const syncedProjectIds = new Set<string>();

    const pendingProjects = await db.projects
      .where("syncStatus")
      .equals("pending")
      .toArray();

    for (const local of pendingProjects) {
      // 게스트 프로젝트는 동기화하지 않음
      if (!local.userId) continue;

      try {
        // 이미지 업로드 (Base64 → Storage)
        let coverImageUrl = local.coverImageUrl;
        if (isBase64Image(local.coverImageBase64)) {
          coverImageUrl = await uploadProjectCover(
            local.userId,
            local.id,
            local.coverImageBase64!
          );
          // 로컬 coverImageUrl도 업데이트
          await db.projects.update(local.id, { coverImageUrl });
        }

        // 서버에 존재하는지 확인
        const remote = await projectRemoteRepository.getById(local.id);

        if (!remote) {
          // 서버에 없으면 로컬 ID로 생성 (upsert)
          const { error } = await supabase.from("projects").upsert({
            id: local.id,
            user_id: local.userId,
            title: local.title,
            description: local.description,
            genre: local.genre,
            cover_image_url: coverImageUrl,
            status: local.status,
            created_at: local.createdAt.toISOString(),
            updated_at: local.updatedAt.toISOString(),
          });
          if (error) throw new Error(error.message);
        } else {
          // 충돌 해결: latest-wins (UTC 비교)
          const localTime = local.updatedAt.getTime();
          const remoteTime = remote.updatedAt.getTime();

          if (localTime > remoteTime) {
            await projectRemoteRepository.update(local.id, {
              title: local.title,
              description: local.description,
              genre: local.genre,
              coverImageUrl,
              status: local.status,
            });
          }
        }

        // 동기화 완료 표시
        await db.projects.update(local.id, {
          syncStatus: "synced",
          lastSyncedAt: new Date(),
        });
        syncedProjectIds.add(local.id);
        result.synced++;
      } catch (error) {
        result.failed++;
        result.errors.push(
          `project/${local.id}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    return syncedProjectIds;
  }

  /**
   * pending 상태의 챕터 동기화
   */
  private async syncPendingChapters(result: SyncResult, validProjectIds: Set<string>): Promise<void> {
    const supabase = createClient();
    const pendingChapters = await db.chapters
      .where("syncStatus")
      .equals("pending")
      .toArray();

    for (const local of pendingChapters) {
      // 프로젝트가 동기화 가능한지 확인
      if (!validProjectIds.has(local.projectId)) continue;

      try {
        const remote = await chapterRemoteRepository.getById(local.id);

        if (!remote) {
          const { error } = await supabase.from("chapters").upsert({
            id: local.id,
            project_id: local.projectId,
            title: local.title,
            content: local.content,
            content_text: local.contentText,
            word_count: local.wordCount,
            order: local.order,
            status: local.status,
            created_at: local.createdAt.toISOString(),
            updated_at: local.updatedAt.toISOString(),
          });
          if (error) throw new Error(error.message);
        } else {
          const localTime = local.updatedAt.getTime();
          const remoteTime = remote.updatedAt.getTime();

          if (localTime > remoteTime) {
            await chapterRemoteRepository.update(local.id, {
              title: local.title,
              content: local.content,
              status: local.status,
            });
          }
        }

        await db.chapters.update(local.id, {
          syncStatus: "synced",
          lastSyncedAt: new Date(),
        });
        result.synced++;
      } catch (error) {
        result.failed++;
        result.errors.push(
          `chapter/${local.id}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  }

  /**
   * pending 상태의 시놉시스 동기화
   */
  private async syncPendingSynopses(result: SyncResult, validProjectIds: Set<string>): Promise<void> {
    const supabase = createClient();
    const pendingSynopses = await db.synopses
      .where("syncStatus")
      .equals("pending")
      .toArray();

    for (const local of pendingSynopses) {
      if (!validProjectIds.has(local.projectId)) continue;

      try {
        const remote = await synopsisRemoteRepository.getById(local.id);

        if (!remote) {
          const { error } = await supabase.from("synopses").upsert({
            id: local.id,
            project_id: local.projectId,
            content: local.content,
            plain_text: local.plainText,
            word_count: local.wordCount,
            created_at: local.createdAt.toISOString(),
            updated_at: local.updatedAt.toISOString(),
          });
          if (error) throw new Error(error.message);
        } else {
          const localTime = local.updatedAt.getTime();
          const remoteTime = remote.updatedAt.getTime();

          if (localTime > remoteTime) {
            await synopsisRemoteRepository.update(local.id, {
              content: local.content,
            });
          }
        }

        await db.synopses.update(local.id, {
          syncStatus: "synced",
          lastSyncedAt: new Date(),
        });
        result.synced++;
      } catch (error) {
        result.failed++;
        result.errors.push(
          `synopsis/${local.id}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  }

  /**
   * pending 상태의 캐릭터 동기화
   */
  private async syncPendingCharacters(result: SyncResult, validProjectIds: Set<string>): Promise<void> {
    const supabase = createClient();
    const pendingCharacters = await db.characters
      .where("syncStatus")
      .equals("pending")
      .toArray();

    for (const local of pendingCharacters) {
      if (!validProjectIds.has(local.projectId)) continue;

      try {
        // 프로젝트에서 userId 가져오기
        const project = await db.projects.get(local.projectId);
        if (!project?.userId) continue;

        // 이미지 업로드 (Base64 → Storage)
        let imageUrl = local.imageUrl;
        if (isBase64Image(local.imageBase64)) {
          imageUrl = await uploadCharacterImage(
            project.userId,
            local.id,
            local.imageBase64!
          );
          // 로컬 imageUrl도 업데이트
          await db.characters.update(local.id, { imageUrl });
        }

        const remote = await characterRemoteRepository.getById(local.id);

        if (!remote) {
          const { error } = await supabase.from("characters").upsert({
            id: local.id,
            project_id: local.projectId,
            name: local.name,
            nickname: local.nickname,
            age: local.age,
            gender: local.gender,
            race: local.race,
            image_url: imageUrl,
            order: local.order,
            height: local.height,
            weight: local.weight,
            appearance: local.appearance,
            mbti: local.mbti,
            personality: local.personality,
            education: local.education,
            occupation: local.occupation,
            affiliation: local.affiliation,
            background: local.background,
            custom_fields: local.customFields,
            created_at: local.createdAt.toISOString(),
            updated_at: local.updatedAt.toISOString(),
          });
          if (error) throw new Error(error.message);
        } else {
          const localTime = local.updatedAt.getTime();
          const remoteTime = remote.updatedAt.getTime();

          if (localTime > remoteTime) {
            await characterRemoteRepository.update(local.id, {
              name: local.name,
              nickname: local.nickname,
              age: local.age,
              gender: local.gender,
              race: local.race,
              imageUrl,
              height: local.height,
              weight: local.weight,
              appearance: local.appearance,
              mbti: local.mbti,
              personality: local.personality,
              education: local.education,
              occupation: local.occupation,
              affiliation: local.affiliation,
              background: local.background,
              customFields: local.customFields,
            });
          }
        }

        await db.characters.update(local.id, {
          syncStatus: "synced",
          lastSyncedAt: new Date(),
        });
        result.synced++;
      } catch (error) {
        result.failed++;
        result.errors.push(
          `character/${local.id}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  }

  /**
   * pending 상태의 관계 동기화
   */
  private async syncPendingRelationships(result: SyncResult, validProjectIds: Set<string>): Promise<void> {
    const supabase = createClient();
    const pendingRelationships = await db.relationships
      .where("syncStatus")
      .equals("pending")
      .toArray();

    for (const local of pendingRelationships) {
      if (!validProjectIds.has(local.projectId)) continue;

      try {
        const remote = await relationshipRemoteRepository.getById(local.id);

        if (!remote) {
          const { error } = await supabase.from("relationships").upsert({
            id: local.id,
            project_id: local.projectId,
            from_character_id: local.fromCharacterId,
            to_character_id: local.toCharacterId,
            type: local.type,
            description: local.description,
            bidirectional: local.bidirectional,
            created_at: local.createdAt.toISOString(),
            updated_at: local.updatedAt.toISOString(),
          });
          if (error) throw new Error(error.message);
        } else {
          const localTime = local.updatedAt.getTime();
          const remoteTime = remote.updatedAt.getTime();

          if (localTime > remoteTime) {
            await relationshipRemoteRepository.update(local.id, {
              type: local.type,
              description: local.description,
              bidirectional: local.bidirectional,
            });
          }
        }

        await db.relationships.update(local.id, {
          syncStatus: "synced",
          lastSyncedAt: new Date(),
        });
        result.synced++;
      } catch (error) {
        result.failed++;
        result.errors.push(
          `relationship/${local.id}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  }

  /**
   * 서버 → 로컬 동기화 (pull)
   * 회원 로그인 시 서버 데이터를 로컬로 가져오기
   * pending 상태인 로컬 데이터는 보존 (충돌 방지)
   * 서버에서 삭제된 데이터는 로컬에서도 삭제
   */
  async pullFromServer(userId: string): Promise<void> {
    this.setStatus("syncing");

    try {
      // 서버에서 프로젝트 가져오기
      const remoteProjects = await projectRemoteRepository.getByUserId(userId);
      const remoteProjectIds = new Set(remoteProjects.map(p => p.id));

      // === 서버 삭제 항목 로컬에서 삭제 ===
      // synced 상태인 로컬 항목 중 서버에 없는 것들 삭제
      await this.deleteLocalOrphans(userId, remoteProjectIds, remoteProjects);

      // === 서버 데이터 로컬로 가져오기 ===
      for (const remote of remoteProjects) {
        const local = await db.projects.get(remote.id);

        if (!local) {
          // 로컬에 없으면 추가
          await db.projects.add({
            ...remote,
            coverImageBase64: null,
            syncStatus: "synced",
            lastSyncedAt: new Date(),
          });
        } else if (local.syncStatus !== "pending") {
          const localTime = local.updatedAt.getTime();
          const remoteTime = remote.updatedAt.getTime();

          if (remoteTime > localTime) {
            // pending이 아니고 서버가 더 최신이면 업데이트
            await db.projects.update(remote.id, {
              ...remote,
              coverImageBase64: local.coverImageBase64,
              syncStatus: "synced",
              lastSyncedAt: new Date(),
            });
          }
        }
        // pending 상태면 로컬 변경 보존 (덮어쓰지 않음)

        // 해당 프로젝트의 종속 데이터도 동기화
        await this.pullProjectDependents(remote.id);
      }

      await this.updatePendingCount();
      this.setStatus("idle");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.setStatus("error", errorMsg);
      throw error;
    }
  }

  /**
   * 로컬에만 있고 서버에 없는 synced 항목 삭제
   */
  private async deleteLocalOrphans(
    userId: string,
    remoteProjectIds: Set<string>,
    remoteProjects: Project[]
  ): Promise<void> {
    // 서버에 없는 synced 상태 프로젝트 삭제
    const localProjects = await db.projects
      .where("userId")
      .equals(userId)
      .filter(p => p.syncStatus === "synced")
      .toArray();

    for (const local of localProjects) {
      if (!remoteProjectIds.has(local.id)) {
        // 프로젝트 삭제 전 종속 데이터 삭제
        await db.chapters.where("projectId").equals(local.id).delete();
        await db.synopses.where("projectId").equals(local.id).delete();
        await db.characters.where("projectId").equals(local.id).delete();
        await db.relationships.where("projectId").equals(local.id).delete();
        await db.projects.delete(local.id);
      }
    }

    // 각 프로젝트 내 종속 데이터의 고아 항목 삭제
    for (const remote of remoteProjects) {
      await this.deleteProjectOrphans(remote.id);
    }
  }

  /**
   * 프로젝트 내 종속 데이터 고아 항목 삭제
   */
  private async deleteProjectOrphans(projectId: string): Promise<void> {
    // 서버 데이터 가져오기
    const remoteChapters = await chapterRemoteRepository.getByProjectId(projectId);
    const remoteSynopsis = await synopsisRemoteRepository.getByProjectId(projectId);
    const remoteCharacters = await characterRemoteRepository.getByProjectId(projectId);
    const remoteRelationships = await relationshipRemoteRepository.getByProjectId(projectId);

    const remoteChapterIds = new Set(remoteChapters.map(c => c.id));
    const remoteSynopsisId = remoteSynopsis?.id;
    const remoteCharacterIds = new Set(remoteCharacters.map(c => c.id));
    const remoteRelationshipIds = new Set(remoteRelationships.map(r => r.id));

    // 로컬 synced 항목 중 서버에 없는 것 삭제
    const localChapters = await db.chapters
      .where("projectId")
      .equals(projectId)
      .filter(c => c.syncStatus === "synced")
      .toArray();

    for (const local of localChapters) {
      if (!remoteChapterIds.has(local.id)) {
        await db.chapters.delete(local.id);
      }
    }

    if (remoteSynopsisId) {
      const localSynopses = await db.synopses
        .where("projectId")
        .equals(projectId)
        .filter(s => s.syncStatus === "synced")
        .toArray();

      for (const local of localSynopses) {
        if (local.id !== remoteSynopsisId) {
          await db.synopses.delete(local.id);
        }
      }
    }

    const localCharacters = await db.characters
      .where("projectId")
      .equals(projectId)
      .filter(c => c.syncStatus === "synced")
      .toArray();

    for (const local of localCharacters) {
      if (!remoteCharacterIds.has(local.id)) {
        await db.characters.delete(local.id);
      }
    }

    const localRelationships = await db.relationships
      .where("projectId")
      .equals(projectId)
      .filter(r => r.syncStatus === "synced")
      .toArray();

    for (const local of localRelationships) {
      if (!remoteRelationshipIds.has(local.id)) {
        await db.relationships.delete(local.id);
      }
    }
  }

  /**
   * 프로젝트 종속 데이터 pull
   */
  private async pullProjectDependents(projectId: string): Promise<void> {
    // 챕터 가져오기
    const remoteChapters = await chapterRemoteRepository.getByProjectId(projectId);
    for (const remoteChapter of remoteChapters) {
      const localChapter = await db.chapters.get(remoteChapter.id);

      if (!localChapter) {
        await db.chapters.add({
          ...remoteChapter,
          syncStatus: "synced",
          lastSyncedAt: new Date(),
        });
      } else if (localChapter.syncStatus !== "pending") {
        const localTime = localChapter.updatedAt.getTime();
        const remoteTime = remoteChapter.updatedAt.getTime();

        if (remoteTime > localTime) {
          await db.chapters.update(remoteChapter.id, {
            ...remoteChapter,
            syncStatus: "synced",
            lastSyncedAt: new Date(),
          });
        }
      }
    }

    // 시놉시스 가져오기
    const remoteSynopsis = await synopsisRemoteRepository.getByProjectId(projectId);
    if (remoteSynopsis) {
      const localSynopsis = await db.synopses.get(remoteSynopsis.id);

      if (!localSynopsis) {
        await db.synopses.add({
          ...remoteSynopsis,
          syncStatus: "synced",
          lastSyncedAt: new Date(),
        });
      } else if (localSynopsis.syncStatus !== "pending") {
        const localTime = localSynopsis.updatedAt.getTime();
        const remoteTime = remoteSynopsis.updatedAt.getTime();

        if (remoteTime > localTime) {
          await db.synopses.update(remoteSynopsis.id, {
            ...remoteSynopsis,
            syncStatus: "synced",
            lastSyncedAt: new Date(),
          });
        }
      }
    }

    // 캐릭터 가져오기
    const remoteCharacters = await characterRemoteRepository.getByProjectId(projectId);
    for (const remoteCharacter of remoteCharacters) {
      const localCharacter = await db.characters.get(remoteCharacter.id);

      if (!localCharacter) {
        await db.characters.add({
          ...remoteCharacter,
          imageBase64: null,
          syncStatus: "synced",
          lastSyncedAt: new Date(),
        });
      } else if (localCharacter.syncStatus !== "pending") {
        const localTime = localCharacter.updatedAt.getTime();
        const remoteTime = remoteCharacter.updatedAt.getTime();

        if (remoteTime > localTime) {
          await db.characters.update(remoteCharacter.id, {
            ...remoteCharacter,
            imageBase64: localCharacter.imageBase64,
            syncStatus: "synced",
            lastSyncedAt: new Date(),
          });
        }
      }
    }

    // 관계 가져오기
    const remoteRelationships = await relationshipRemoteRepository.getByProjectId(projectId);
    for (const remoteRelationship of remoteRelationships) {
      const localRelationship = await db.relationships.get(remoteRelationship.id);

      if (!localRelationship) {
        await db.relationships.add({
          ...remoteRelationship,
          syncStatus: "synced",
          lastSyncedAt: new Date(),
        });
      } else if (localRelationship.syncStatus !== "pending") {
        const localTime = localRelationship.updatedAt.getTime();
        const remoteTime = remoteRelationship.updatedAt.getTime();

        if (remoteTime > localTime) {
          await db.relationships.update(remoteRelationship.id, {
            ...remoteRelationship,
            syncStatus: "synced",
            lastSyncedAt: new Date(),
          });
        }
      }
    }
  }

  /**
   * Realtime 이벤트 처리 (단일 변경)
   */
  async handleRealtimeEvent(payload: SyncEventPayload): Promise<void> {
    const { type, table, record, old_record } = payload;

    try {
      switch (table) {
        case "projects":
          await this.handleProjectEvent(type, record, old_record);
          break;
        case "chapters":
          await this.handleChapterEvent(type, record, old_record);
          break;
        case "synopses":
          await this.handleSynopsisEvent(type, record, old_record);
          break;
        case "characters":
          await this.handleCharacterEvent(type, record, old_record);
          break;
        case "relationships":
          await this.handleRelationshipEvent(type, record, old_record);
          break;
      }
    } catch (error) {
      console.error(`Realtime sync error for ${table}:`, error);
    }
  }

  private async handleProjectEvent(
    type: SyncEventPayload["type"],
    record: Record<string, unknown> | null,
    old_record: Record<string, unknown> | null
  ): Promise<void> {
    if (type === "DELETE" && old_record) {
      const id = old_record.id as string;
      const local = await db.projects.get(id);
      if (local && local.syncStatus === "synced") {
        // 종속 데이터 삭제
        await db.chapters.where("projectId").equals(id).delete();
        await db.synopses.where("projectId").equals(id).delete();
        await db.characters.where("projectId").equals(id).delete();
        await db.relationships.where("projectId").equals(id).delete();
        await db.projects.delete(id);
      }
      return;
    }

    if (!record) return;

    // status가 deleted인 경우도 삭제 처리
    if (record.status === "deleted") {
      const id = record.id as string;
      const local = await db.projects.get(id);
      if (local && local.syncStatus === "synced") {
        await db.chapters.where("projectId").equals(id).delete();
        await db.synopses.where("projectId").equals(id).delete();
        await db.characters.where("projectId").equals(id).delete();
        await db.relationships.where("projectId").equals(id).delete();
        await db.projects.delete(id);
      }
      return;
    }

    const id = record.id as string;
    const local = await db.projects.get(id);

    if (type === "INSERT" || !local) {
      await db.projects.put({
        id,
        userId: record.user_id as string | null,
        guestId: record.guest_id as string | null,
        title: record.title as string,
        description: record.description as string | null,
        genre: record.genre as string | null,
        coverImageUrl: record.cover_image_url as string | null,
        coverImageBase64: null,
        status: record.status as "active" | "archived" | "deleted",
        deletedAt: record.deleted_at ? new Date(record.deleted_at as string) : null,
        createdAt: new Date(record.created_at as string),
        updatedAt: new Date(record.updated_at as string),
        syncStatus: "synced",
        lastSyncedAt: new Date(),
      });
    } else if (local.syncStatus !== "pending") {
      const localTime = local.updatedAt.getTime();
      const remoteTime = new Date(record.updated_at as string).getTime();

      if (remoteTime > localTime) {
        await db.projects.update(id, {
          title: record.title as string,
          description: record.description as string | null,
          genre: record.genre as string | null,
          coverImageUrl: record.cover_image_url as string | null,
          status: record.status as "active" | "archived" | "deleted",
          updatedAt: new Date(record.updated_at as string),
          syncStatus: "synced",
          lastSyncedAt: new Date(),
        });
      }
    }
  }

  private async handleChapterEvent(
    type: SyncEventPayload["type"],
    record: Record<string, unknown> | null,
    old_record: Record<string, unknown> | null
  ): Promise<void> {
    if (type === "DELETE" && old_record) {
      const id = old_record.id as string;
      const local = await db.chapters.get(id);
      if (local && local.syncStatus === "synced") {
        await db.chapters.delete(id);
      }
      return;
    }

    if (!record) return;

    const id = record.id as string;
    const local = await db.chapters.get(id);

    if (type === "INSERT" || !local) {
      await db.chapters.put({
        id,
        projectId: record.project_id as string,
        title: record.title as string,
        content: record.content as Chapter["content"],
        contentText: record.content_text as string | null,
        wordCount: record.word_count as number,
        order: record.order as number,
        status: record.status as "draft" | "published",
        createdAt: new Date(record.created_at as string),
        updatedAt: new Date(record.updated_at as string),
        syncStatus: "synced",
        lastSyncedAt: new Date(),
      });
    } else if (local.syncStatus !== "pending") {
      const localTime = local.updatedAt.getTime();
      const remoteTime = new Date(record.updated_at as string).getTime();

      if (remoteTime > localTime) {
        await db.chapters.update(id, {
          title: record.title as string,
          content: record.content as Chapter["content"],
          contentText: record.content_text as string | null,
          wordCount: record.word_count as number,
          order: record.order as number,
          status: record.status as "draft" | "published",
          updatedAt: new Date(record.updated_at as string),
          syncStatus: "synced",
          lastSyncedAt: new Date(),
        });
      }
    }
  }

  private async handleSynopsisEvent(
    type: SyncEventPayload["type"],
    record: Record<string, unknown> | null,
    old_record: Record<string, unknown> | null
  ): Promise<void> {
    if (type === "DELETE" && old_record) {
      const id = old_record.id as string;
      const local = await db.synopses.get(id);
      if (local && local.syncStatus === "synced") {
        await db.synopses.delete(id);
      }
      return;
    }

    if (!record) return;

    const id = record.id as string;
    const local = await db.synopses.get(id);

    if (type === "INSERT" || !local) {
      await db.synopses.put({
        id,
        projectId: record.project_id as string,
        content: record.content as Synopsis["content"],
        plainText: record.plain_text as string | null,
        wordCount: record.word_count as number,
        createdAt: new Date(record.created_at as string),
        updatedAt: new Date(record.updated_at as string),
        syncStatus: "synced",
        lastSyncedAt: new Date(),
      });
    } else if (local.syncStatus !== "pending") {
      const localTime = local.updatedAt.getTime();
      const remoteTime = new Date(record.updated_at as string).getTime();

      if (remoteTime > localTime) {
        await db.synopses.update(id, {
          content: record.content as Synopsis["content"],
          plainText: record.plain_text as string | null,
          wordCount: record.word_count as number,
          updatedAt: new Date(record.updated_at as string),
          syncStatus: "synced",
          lastSyncedAt: new Date(),
        });
      }
    }
  }

  private async handleCharacterEvent(
    type: SyncEventPayload["type"],
    record: Record<string, unknown> | null,
    old_record: Record<string, unknown> | null
  ): Promise<void> {
    if (type === "DELETE" && old_record) {
      const id = old_record.id as string;
      const local = await db.characters.get(id);
      if (local && local.syncStatus === "synced") {
        // 관련 관계도 삭제
        await db.relationships
          .where("fromCharacterId")
          .equals(id)
          .or("toCharacterId")
          .equals(id)
          .delete();
        await db.characters.delete(id);
      }
      return;
    }

    if (!record) return;

    const id = record.id as string;
    const local = await db.characters.get(id);

    if (type === "INSERT" || !local) {
      await db.characters.put({
        id,
        projectId: record.project_id as string,
        name: record.name as string,
        nickname: record.nickname as string | null,
        age: record.age as number | null,
        gender: record.gender as string | null,
        race: record.race as string | null,
        imageUrl: record.image_url as string | null,
        imageBase64: null,
        order: record.order as number,
        height: record.height as number | null,
        weight: record.weight as number | null,
        appearance: record.appearance as string | null,
        mbti: record.mbti as string | null,
        personality: record.personality as string | null,
        education: record.education as string | null,
        occupation: record.occupation as string | null,
        affiliation: record.affiliation as string | null,
        background: record.background as string | null,
        customFields: (record.custom_fields as Character["customFields"]) ?? [],
        createdAt: new Date(record.created_at as string),
        updatedAt: new Date(record.updated_at as string),
        syncStatus: "synced",
        lastSyncedAt: new Date(),
      });
    } else if (local.syncStatus !== "pending") {
      const localTime = local.updatedAt.getTime();
      const remoteTime = new Date(record.updated_at as string).getTime();

      if (remoteTime > localTime) {
        await db.characters.update(id, {
          name: record.name as string,
          nickname: record.nickname as string | null,
          age: record.age as number | null,
          gender: record.gender as string | null,
          race: record.race as string | null,
          imageUrl: record.image_url as string | null,
          order: record.order as number,
          height: record.height as number | null,
          weight: record.weight as number | null,
          appearance: record.appearance as string | null,
          mbti: record.mbti as string | null,
          personality: record.personality as string | null,
          education: record.education as string | null,
          occupation: record.occupation as string | null,
          affiliation: record.affiliation as string | null,
          background: record.background as string | null,
          customFields: (record.custom_fields as Character["customFields"]) ?? [],
          updatedAt: new Date(record.updated_at as string),
          syncStatus: "synced",
          lastSyncedAt: new Date(),
        });
      }
    }
  }

  private async handleRelationshipEvent(
    type: SyncEventPayload["type"],
    record: Record<string, unknown> | null,
    old_record: Record<string, unknown> | null
  ): Promise<void> {
    if (type === "DELETE" && old_record) {
      const id = old_record.id as string;
      const local = await db.relationships.get(id);
      if (local && local.syncStatus === "synced") {
        await db.relationships.delete(id);
      }
      return;
    }

    if (!record) return;

    const id = record.id as string;
    const local = await db.relationships.get(id);

    if (type === "INSERT" || !local) {
      await db.relationships.put({
        id,
        projectId: record.project_id as string,
        fromCharacterId: record.from_character_id as string,
        toCharacterId: record.to_character_id as string,
        type: record.type as Relationship["type"],
        description: record.description as string | null,
        bidirectional: record.bidirectional as boolean,
        createdAt: new Date(record.created_at as string),
        updatedAt: new Date(record.updated_at as string),
        syncStatus: "synced",
        lastSyncedAt: new Date(),
      });
    } else if (local.syncStatus !== "pending") {
      const localTime = local.updatedAt.getTime();
      const remoteTime = new Date(record.updated_at as string).getTime();

      if (remoteTime > localTime) {
        await db.relationships.update(id, {
          type: record.type as Relationship["type"],
          description: record.description as string | null,
          bidirectional: record.bidirectional as boolean,
          updatedAt: new Date(record.updated_at as string),
          syncStatus: "synced",
          lastSyncedAt: new Date(),
        });
      }
    }
  }
}

export const syncEngine = new SyncEngine();
