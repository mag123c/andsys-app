import { db } from "@/storage/local/db";
import { chapterLocalRepository } from "@/storage/local/chapter.local";

export interface ReorderChaptersInput {
  projectId: string;
  chapterIds: string[];
}

export interface ReorderChaptersOutput {
  success: boolean;
  reorderedCount: number;
  error?: string;
}

/**
 * 챕터 순서 변경 UseCase
 *
 * 비즈니스 규칙:
 * - 모든 chapterIds가 해당 프로젝트에 속하는지 검증
 * - 누락된 챕터가 없는지 검증
 * - 트랜잭션으로 원자성 보장
 *
 * @see ai-context/domain/entities.json#Chapter
 */
export async function reorderChaptersUseCase(
  input: ReorderChaptersInput
): Promise<ReorderChaptersOutput> {
  const { projectId, chapterIds } = input;

  // 1. 프로젝트 존재 여부 검증
  const project = await db.projects.get(projectId);
  if (!project) {
    return {
      success: false,
      reorderedCount: 0,
      error: `Project not found: ${projectId}`,
    };
  }

  // 2. 중복 ID 검증
  const uniqueIds = new Set(chapterIds);
  if (uniqueIds.size !== chapterIds.length) {
    return {
      success: false,
      reorderedCount: 0,
      error: "Duplicate chapter IDs in reorder list",
    };
  }

  // 3. 현재 프로젝트의 모든 챕터 조회
  const existingChapters = await db.chapters
    .where("projectId")
    .equals(projectId)
    .toArray();

  const existingIds = new Set(existingChapters.map((c) => c.id));

  // 4. 모든 chapterIds가 해당 프로젝트에 속하는지 검증
  const invalidIds = chapterIds.filter((id) => !existingIds.has(id));
  if (invalidIds.length > 0) {
    return {
      success: false,
      reorderedCount: 0,
      error: `Invalid chapter IDs: ${invalidIds.join(", ")}`,
    };
  }

  // 5. 누락된 챕터가 없는지 검증
  const missingIds = existingChapters
    .map((c) => c.id)
    .filter((id) => !chapterIds.includes(id));
  if (missingIds.length > 0) {
    return {
      success: false,
      reorderedCount: 0,
      error: `Missing chapter IDs in reorder list: ${missingIds.join(", ")}`,
    };
  }

  // 6. 순서 변경 실행
  await chapterLocalRepository.reorder(projectId, chapterIds);

  return {
    success: true,
    reorderedCount: chapterIds.length,
  };
}
