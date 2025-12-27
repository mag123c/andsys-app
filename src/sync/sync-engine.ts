import { db } from "@/storage/local/db";
import { createClient } from "@/storage/remote/client";
import { projectRemoteRepository } from "@/storage/remote/project.remote";
import { chapterRemoteRepository } from "@/storage/remote/chapter.remote";
import { synopsisRemoteRepository } from "@/storage/remote/synopsis.remote";
import { characterRemoteRepository } from "@/storage/remote/character.remote";
import { relationshipRemoteRepository } from "@/storage/remote/relationship.remote";
import { syncQueue, type EntityType, type SyncOperation } from "./sync-queue";
import type { Project, Chapter, Synopsis, Character, Relationship } from "@/repositories/types";

export type SyncStatus = "idle" | "syncing" | "error";

interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: string[];
}

/**
 * 동기화 엔진
 * - 로컬 pending 항목을 서버로 동기화
 * - 충돌 해결 (latest-wins, pending 상태 보존)
 * - 온라인 복귀 시 자동 동기화
 */
export class SyncEngine {
  private _status: SyncStatus = "idle";
  private _isSyncing = false;
  private listeners: Set<() => void> = new Set();

  get status(): SyncStatus {
    return this._status;
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

  private setStatus(status: SyncStatus): void {
    this._status = status;
    this.notifyListeners();
  }

  /**
   * 모든 pending 항목 동기화
   */
  async syncAll(): Promise<SyncResult> {
    if (this._isSyncing) {
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

      // 2. pending 상태인 로컬 항목들 동기화
      await this.syncPendingProjects(result);
      await this.syncPendingChapters(result);
      await this.syncPendingSynopses(result);
      await this.syncPendingCharacters(result);
      await this.syncPendingRelationships(result);

      this.setStatus(result.failed > 0 ? "error" : "idle");
    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : String(error));
      this.setStatus("error");
    } finally {
      this._isSyncing = false;
    }

    return result;
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
   */
  private async syncPendingProjects(result: SyncResult): Promise<void> {
    const supabase = createClient();
    const pendingProjects = await db.projects
      .where("syncStatus")
      .equals("pending")
      .toArray();

    for (const local of pendingProjects) {
      // 게스트 프로젝트는 동기화하지 않음
      if (!local.userId) continue;

      try {
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
            status: local.status,
            created_at: local.createdAt.toISOString(),
            updated_at: local.updatedAt.toISOString(),
          });
          if (error) throw new Error(error.message);
        } else {
          // 충돌 해결: latest-wins
          if (local.updatedAt > remote.updatedAt) {
            await projectRemoteRepository.update(local.id, {
              title: local.title,
              description: local.description,
              genre: local.genre,
              status: local.status,
            });
          }
        }

        // 동기화 완료 표시
        await db.projects.update(local.id, {
          syncStatus: "synced",
          lastSyncedAt: new Date(),
        });
        result.synced++;
      } catch (error) {
        result.failed++;
        result.errors.push(
          `project/${local.id}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  }

  /**
   * pending 상태의 챕터 동기화
   */
  private async syncPendingChapters(result: SyncResult): Promise<void> {
    const supabase = createClient();
    const pendingChapters = await db.chapters
      .where("syncStatus")
      .equals("pending")
      .toArray();

    for (const local of pendingChapters) {
      // 프로젝트가 게스트 소유인지 확인
      const project = await db.projects.get(local.projectId);
      if (!project?.userId) continue;

      try {
        // 서버에 존재하는지 확인
        const remote = await chapterRemoteRepository.getById(local.id);

        if (!remote) {
          // 서버에 없으면 로컬 ID로 생성 (upsert)
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
          // 충돌 해결: latest-wins
          if (local.updatedAt > remote.updatedAt) {
            await chapterRemoteRepository.update(local.id, {
              title: local.title,
              content: local.content,
              status: local.status,
            });
          }
        }

        // 동기화 완료 표시
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
  private async syncPendingSynopses(result: SyncResult): Promise<void> {
    const supabase = createClient();
    const pendingSynopses = await db.synopses
      .where("syncStatus")
      .equals("pending")
      .toArray();

    for (const local of pendingSynopses) {
      const project = await db.projects.get(local.projectId);
      if (!project?.userId) continue;

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
          if (local.updatedAt > remote.updatedAt) {
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
  private async syncPendingCharacters(result: SyncResult): Promise<void> {
    const supabase = createClient();
    const pendingCharacters = await db.characters
      .where("syncStatus")
      .equals("pending")
      .toArray();

    for (const local of pendingCharacters) {
      const project = await db.projects.get(local.projectId);
      if (!project?.userId) continue;

      try {
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
            image_url: local.imageUrl,
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
          if (local.updatedAt > remote.updatedAt) {
            await characterRemoteRepository.update(local.id, {
              name: local.name,
              nickname: local.nickname,
              age: local.age,
              gender: local.gender,
              race: local.race,
              imageUrl: local.imageUrl,
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
  private async syncPendingRelationships(result: SyncResult): Promise<void> {
    const supabase = createClient();
    const pendingRelationships = await db.relationships
      .where("syncStatus")
      .equals("pending")
      .toArray();

    for (const local of pendingRelationships) {
      const project = await db.projects.get(local.projectId);
      if (!project?.userId) continue;

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
          if (local.updatedAt > remote.updatedAt) {
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
   */
  async pullFromServer(userId: string): Promise<void> {
    this.setStatus("syncing");

    try {
      // 서버에서 프로젝트 가져오기
      const remoteProjects = await projectRemoteRepository.getByUserId(userId);

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
        } else if (local.syncStatus !== "pending" && remote.updatedAt > local.updatedAt) {
          // pending이 아니고 서버가 더 최신이면 업데이트
          await db.projects.update(remote.id, {
            ...remote,
            coverImageBase64: local.coverImageBase64,
            syncStatus: "synced",
            lastSyncedAt: new Date(),
          });
        }
        // pending 상태면 로컬 변경 보존 (덮어쓰지 않음)

        // 해당 프로젝트의 챕터도 가져오기
        const remoteChapters = await chapterRemoteRepository.getByProjectId(remote.id);
        for (const remoteChapter of remoteChapters) {
          const localChapter = await db.chapters.get(remoteChapter.id);

          if (!localChapter) {
            await db.chapters.add({
              ...remoteChapter,
              syncStatus: "synced",
              lastSyncedAt: new Date(),
            });
          } else if (localChapter.syncStatus !== "pending" && remoteChapter.updatedAt > localChapter.updatedAt) {
            await db.chapters.update(remoteChapter.id, {
              ...remoteChapter,
              syncStatus: "synced",
              lastSyncedAt: new Date(),
            });
          }
        }

        // 시놉시스 가져오기
        const remoteSynopsis = await synopsisRemoteRepository.getByProjectId(remote.id);
        if (remoteSynopsis) {
          const localSynopsis = await db.synopses.get(remoteSynopsis.id);

          if (!localSynopsis) {
            await db.synopses.add({
              ...remoteSynopsis,
              syncStatus: "synced",
              lastSyncedAt: new Date(),
            });
          } else if (localSynopsis.syncStatus !== "pending" && remoteSynopsis.updatedAt > localSynopsis.updatedAt) {
            await db.synopses.update(remoteSynopsis.id, {
              ...remoteSynopsis,
              syncStatus: "synced",
              lastSyncedAt: new Date(),
            });
          }
        }

        // 캐릭터 가져오기
        const remoteCharacters = await characterRemoteRepository.getByProjectId(remote.id);
        for (const remoteCharacter of remoteCharacters) {
          const localCharacter = await db.characters.get(remoteCharacter.id);

          if (!localCharacter) {
            await db.characters.add({
              ...remoteCharacter,
              imageBase64: null,
              syncStatus: "synced",
              lastSyncedAt: new Date(),
            });
          } else if (localCharacter.syncStatus !== "pending" && remoteCharacter.updatedAt > localCharacter.updatedAt) {
            await db.characters.update(remoteCharacter.id, {
              ...remoteCharacter,
              imageBase64: localCharacter.imageBase64,
              syncStatus: "synced",
              lastSyncedAt: new Date(),
            });
          }
        }

        // 관계 가져오기
        const remoteRelationships = await relationshipRemoteRepository.getByProjectId(remote.id);
        for (const remoteRelationship of remoteRelationships) {
          const localRelationship = await db.relationships.get(remoteRelationship.id);

          if (!localRelationship) {
            await db.relationships.add({
              ...remoteRelationship,
              syncStatus: "synced",
              lastSyncedAt: new Date(),
            });
          } else if (localRelationship.syncStatus !== "pending" && remoteRelationship.updatedAt > localRelationship.updatedAt) {
            await db.relationships.update(remoteRelationship.id, {
              ...remoteRelationship,
              syncStatus: "synced",
              lastSyncedAt: new Date(),
            });
          }
        }
      }

      this.setStatus("idle");
    } catch (error) {
      this.setStatus("error");
      throw error;
    }
  }
}

export const syncEngine = new SyncEngine();
