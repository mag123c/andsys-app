import type { Chapter, CreateChapterInput } from "@/repositories/types";
import { chapterLocalRepository } from "@/storage/local/chapter.local";
import { db } from "@/storage/local/db";

export interface CreateChapterUseCaseInput {
  projectId: string;
  title: string;
  content?: Chapter["content"];
  plot?: string | null;
}

export interface CreateChapterUseCaseOutput {
  success: boolean;
  chapter: Chapter | null;
  error?: string;
}

/**
 * 챕터 생성 UseCase
 *
 * 비즈니스 규칙:
 * - 프로젝트 존재 여부 검증
 * - order 자동 계산 (기존 챕터들의 max order + 1)
 * - 게스트/회원 구분하여 syncStatus 설정
 *
 * @see ai-context/domain/entities.json#Chapter
 */
export async function createChapterUseCase(
  input: CreateChapterUseCaseInput
): Promise<CreateChapterUseCaseOutput> {
  const { projectId, title, content, plot } = input;

  // 1. 프로젝트 존재 여부 검증
  const project = await db.projects.get(projectId);
  if (!project) {
    return {
      success: false,
      chapter: null,
      error: `Project not found: ${projectId}`,
    };
  }

  // 2. 삭제된 프로젝트에는 챕터 생성 불가
  if (project.status === "deleted") {
    return {
      success: false,
      chapter: null,
      error: "Cannot create chapter in deleted project",
    };
  }

  // 3. 챕터 생성 (order 계산은 repository에서 처리)
  const createInput: CreateChapterInput = {
    projectId,
    title,
    content,
    plot,
  };

  const chapter = await chapterLocalRepository.create(createInput);

  return {
    success: true,
    chapter,
  };
}
