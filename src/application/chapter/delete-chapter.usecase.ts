import { db } from "@/storage/local/db";
import { isGuestProject } from "@/storage/local/guest-check";

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
 * - 챕터 삭제 후 남은 챕터들의 order를 자동으로 재정렬
 * - order는 1부터 연속적으로 유지
 * - 트랜잭션 내에서 삭제와 재정렬을 원자적으로 처리
 *
 * @see ai-context/domain/rules.json#CHAPTER_REORDER_ON_DELETE
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

  // 2. 트랜잭션 내에서 삭제 + 재정렬
  await db.transaction("rw", db.chapters, db.projects, async () => {
    // 2-1. 챕터 삭제
    await db.chapters.delete(chapterId);

    // 2-2. 남은 챕터들 조회 (order 오름차순)
    const remainingChapters = await db.chapters
      .where("projectId")
      .equals(projectId)
      .sortBy("order");

    // 2-3. order 재정렬 (1부터 연속)
    for (let i = 0; i < remainingChapters.length; i++) {
      const newOrder = i + 1;
      if (remainingChapters[i].order !== newOrder) {
        await db.chapters.update(remainingChapters[i].id, {
          order: newOrder,
          updatedAt: now,
          syncStatus: isGuest ? "synced" : "pending",
        });
      }
    }

    // 2-4. 프로젝트 updatedAt 갱신
    await db.projects.update(projectId, { updatedAt: now });
  });

  return { success: true };
}
