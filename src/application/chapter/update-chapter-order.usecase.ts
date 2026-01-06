import { db } from "@/storage/local/db";
import { isGuestProject } from "@/storage/local/guest-check";
import { syncQueue } from "@/sync/sync-queue";

export interface UpdateChapterOrderInput {
  chapterId: string;
  newOrder: number;
}

export interface UpdateChapterOrderOutput {
  success: boolean;
  swapped: boolean;
  swappedWithChapter?: {
    id: string;
    title: string;
    previousOrder: number;
  };
  error?: string;
}

/**
 * 회차 번호 변경 UseCase
 *
 * 비즈니스 규칙:
 * - 같은 번호를 가진 다른 회차가 있으면 스위칭 (두 회차의 order 교환)
 * - 빈 번호로 이동 시 단순 변경
 * - 동일한 번호로 변경 시 no-op
 *
 * @see ai-context/domain/rules.json#CHAPTER_ORDER
 */
export async function updateChapterOrderUseCase(
  input: UpdateChapterOrderInput
): Promise<UpdateChapterOrderOutput> {
  const { chapterId, newOrder } = input;

  // 1. 유효성 검증: order는 양의 정수
  if (newOrder < 1 || !Number.isInteger(newOrder)) {
    return {
      success: false,
      swapped: false,
      error: "회차 번호는 1 이상의 정수여야 합니다",
    };
  }

  // 2. 챕터 존재 여부 확인
  const chapter = await db.chapters.get(chapterId);
  if (!chapter) {
    return {
      success: false,
      swapped: false,
      error: `Chapter not found: ${chapterId}`,
    };
  }

  // 3. 동일한 번호면 no-op
  if (chapter.order === newOrder) {
    return {
      success: true,
      swapped: false,
    };
  }

  const projectId = chapter.projectId;
  const now = new Date();
  const isGuest = await isGuestProject(projectId);

  // 4. 같은 order를 가진 다른 챕터 확인
  const conflictingChapter = await db.chapters
    .where("[projectId+order]")
    .equals([projectId, newOrder])
    .first();

  // 5. 트랜잭션으로 스위칭 또는 단순 변경
  await db.transaction("rw", db.chapters, db.projects, async () => {
    if (conflictingChapter && conflictingChapter.id !== chapterId) {
      // 스위칭: 충돌하는 챕터는 현재 챕터의 order로
      await db.chapters.update(conflictingChapter.id, {
        order: chapter.order,
        updatedAt: now,
        syncStatus: isGuest ? "synced" : "pending",
      });
    }

    // 현재 챕터 order 변경
    await db.chapters.update(chapterId, {
      order: newOrder,
      updatedAt: now,
      syncStatus: isGuest ? "synced" : "pending",
    });

    // 프로젝트 updatedAt 갱신
    await db.projects.update(projectId, { updatedAt: now });
  });

  // 6. 서버 동기화를 위해 syncQueue에 등록 (게스트가 아닌 경우만)
  if (!isGuest) {
    // 현재 챕터 업데이트 등록
    await syncQueue.enqueue({
      entityType: "chapter",
      entityId: chapterId,
      operation: "update",
      payload: { order: newOrder },
    });

    // 충돌하는 챕터가 있으면 해당 챕터도 업데이트 등록
    if (conflictingChapter && conflictingChapter.id !== chapterId) {
      await syncQueue.enqueue({
        entityType: "chapter",
        entityId: conflictingChapter.id,
        operation: "update",
        payload: { order: chapter.order },
      });
    }
  }

  if (conflictingChapter && conflictingChapter.id !== chapterId) {
    return {
      success: true,
      swapped: true,
      swappedWithChapter: {
        id: conflictingChapter.id,
        title: conflictingChapter.title,
        previousOrder: conflictingChapter.order,
      },
    };
  }

  return {
    success: true,
    swapped: false,
  };
}
