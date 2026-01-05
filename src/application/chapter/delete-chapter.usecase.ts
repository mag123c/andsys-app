import { db } from "@/storage/local/db";
import { isGuestProject } from "@/storage/local/guest-check";
import { syncQueue } from "@/sync/sync-queue";

export interface DeleteChapterUseCaseInput {
  chapterId: string;
}

export interface DeleteChapterUseCaseOutput {
  success: boolean;
  error?: string;
}

/**
 * 챕터 삭제 UseCase
 *
 * 비즈니스 규칙:
 * - 해당 챕터만 삭제, 다른 챕터의 order는 유지 (빈 번호 허용)
 * - 사용자가 회차 번호를 직접 편집하거나 드래그로 재정렬 가능
 */
export async function deleteChapterUseCase(
  input: DeleteChapterUseCaseInput
): Promise<DeleteChapterUseCaseOutput> {
  const { chapterId } = input;

  // 1. 챕터 존재 여부 확인
  const chapter = await db.chapters.get(chapterId);
  if (!chapter) {
    return {
      success: false,
      error: `Chapter not found: ${chapterId}`,
    };
  }

  const projectId = chapter.projectId;
  const now = new Date();
  const isGuest = await isGuestProject(projectId);

  // 2. 트랜잭션 내에서 챕터 삭제 (재정렬 없음)
  await db.transaction("rw", db.chapters, db.projects, async () => {
    // 챕터 삭제
    await db.chapters.delete(chapterId);

    // 프로젝트 updatedAt 갱신
    await db.projects.update(projectId, { updatedAt: now });
  });

  // 3. 서버 동기화를 위해 syncQueue에 delete 작업 등록 (게스트가 아닌 경우만)
  if (!isGuest) {
    await syncQueue.enqueue({
      entityType: "chapter",
      entityId: chapterId,
      operation: "delete",
      payload: null,
    });
  }

  return { success: true };
}
