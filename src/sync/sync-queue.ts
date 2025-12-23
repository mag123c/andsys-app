import { db, type SyncQueueItem } from "@/storage/local/db";

const MAX_ATTEMPTS = 5;

export type SyncOperation = "create" | "update" | "delete";
export type EntityType = "project" | "chapter";

interface EnqueueParams {
  entityType: EntityType;
  entityId: string;
  operation: SyncOperation;
  payload: unknown;
}

/**
 * 동기화 대기열 관리
 * - 오프라인 시 변경사항을 큐에 저장
 * - 온라인 복귀 시 순차 처리
 */
export class SyncQueue {
  /**
   * 큐에 항목 추가 (중복 방지)
   */
  async enqueue(params: EnqueueParams): Promise<void> {
    const { entityType, entityId, operation, payload } = params;

    // 같은 엔티티의 기존 항목 확인
    const existing = await db.syncQueue
      .where({ entityType, entityId })
      .first();

    if (existing) {
      // create + delete = 동기화 불필요 (큐에서 제거)
      if (existing.operation === "create" && operation === "delete") {
        await db.syncQueue.delete(existing.id!);
        return;
      }

      // 기존 항목 업데이트 (최신 operation과 payload로)
      await db.syncQueue.update(existing.id!, {
        operation: this.mergeOperations(existing.operation, operation),
        payload,
        lastAttemptAt: null,
        attempts: 0,
      });
    } else {
      // 새 항목 추가
      await db.syncQueue.add({
        entityType,
        entityId,
        operation,
        payload,
        attempts: 0,
        lastAttemptAt: null,
        createdAt: new Date(),
      });
    }
  }

  /**
   * 처리할 다음 항목 가져오기
   */
  async dequeue(): Promise<SyncQueueItem | null> {
    const items = await db.syncQueue
      .orderBy("createdAt")
      .filter((item) => item.attempts < MAX_ATTEMPTS)
      .limit(1)
      .toArray();

    return items[0] ?? null;
  }

  /**
   * 큐의 모든 pending 항목 가져오기
   */
  async getAll(): Promise<SyncQueueItem[]> {
    return db.syncQueue
      .orderBy("createdAt")
      .filter((item) => item.attempts < MAX_ATTEMPTS)
      .toArray();
  }

  /**
   * 항목 처리 완료 (큐에서 제거)
   */
  async complete(id: number): Promise<void> {
    await db.syncQueue.delete(id);
  }

  /**
   * 항목 처리 실패 (재시도 카운트 증가)
   */
  async fail(id: number): Promise<void> {
    const item = await db.syncQueue.get(id);
    if (!item) return;

    await db.syncQueue.update(id, {
      attempts: item.attempts + 1,
      lastAttemptAt: new Date(),
    });
  }

  /**
   * 특정 엔티티의 큐 항목 제거
   */
  async removeByEntity(entityType: EntityType, entityId: string): Promise<void> {
    await db.syncQueue
      .where({ entityType, entityId })
      .delete();
  }

  /**
   * 큐 비우기 (전체 삭제)
   */
  async clear(): Promise<void> {
    await db.syncQueue.clear();
  }

  /**
   * 큐 항목 수
   */
  async count(): Promise<number> {
    return db.syncQueue.count();
  }

  /**
   * 연산 병합 로직
   * create + update = create (새 payload로)
   * create + delete = 제거 (아예 큐에서 삭제)
   * update + update = update (새 payload로)
   * update + delete = delete
   */
  private mergeOperations(
    existing: SyncOperation,
    incoming: SyncOperation
  ): SyncOperation {
    if (existing === "create" && incoming === "delete") {
      // create 후 delete면 아예 동기화 불필요
      // 이 경우는 enqueue에서 별도 처리 필요
      return "delete";
    }

    if (existing === "create") {
      // create 상태 유지 (payload만 업데이트)
      return "create";
    }

    // 나머지는 incoming 우선
    return incoming;
  }
}

export const syncQueue = new SyncQueue();
