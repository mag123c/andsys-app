import { db } from "@/storage/local/db";
import { createClient } from "@/storage/remote/client";
import { projectRemoteRepository } from "@/storage/remote/project.remote";
import { chapterRemoteRepository } from "@/storage/remote/chapter.remote";
import { syncQueue, type EntityType, type SyncOperation } from "./sync-queue";
import type { Project, Chapter } from "@/repositories/types";

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
 * - 충돌 해결 (latest-wins)
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
    if (entityType === "project") {
      await this.syncProjectItem(entityId, operation, payload);
    } else if (entityType === "chapter") {
      await this.syncChapterItem(entityId, operation, payload);
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
   * 서버 → 로컬 동기화 (pull)
   * 회원 로그인 시 서버 데이터를 로컬로 가져오기
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
            syncStatus: "synced",
            lastSyncedAt: new Date(),
          });
        } else if (remote.updatedAt > local.updatedAt) {
          // 서버가 더 최신이면 업데이트
          await db.projects.update(remote.id, {
            ...remote,
            syncStatus: "synced",
            lastSyncedAt: new Date(),
          });
        }

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
          } else if (remoteChapter.updatedAt > localChapter.updatedAt) {
            await db.chapters.update(remoteChapter.id, {
              ...remoteChapter,
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
