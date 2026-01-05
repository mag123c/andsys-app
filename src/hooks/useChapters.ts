"use client";

import { useCallback, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import type {
  Chapter,
  UpdateChapterInput,
} from "@/repositories/types";
import { chapterLocalRepository } from "@/storage/local/chapter.local";
import { db } from "@/storage/local/db";
import {
  createChapterUseCase,
  deleteChapterUseCase,
  reorderChaptersUseCase,
  updateChapterOrderUseCase,
} from "@/application/chapter";

interface CreateChapterData {
  title: string;
  content?: Chapter["content"];
  plot?: string | null;
}

interface UpdateChapterOrderResult {
  swapped: boolean;
  swappedWithChapter?: {
    id: string;
    title: string;
    previousOrder: number;
  };
}

interface UseChaptersReturn {
  chapters: Chapter[];
  isLoading: boolean;
  error: Error | null;
  createChapter: (data: CreateChapterData) => Promise<Chapter>;
  updateChapter: (id: string, data: UpdateChapterInput) => Promise<Chapter>;
  updateChapterOrder: (id: string, newOrder: number) => Promise<UpdateChapterOrderResult>;
  deleteChapter: (id: string) => Promise<void>;
  reorderChapters: (chapterIds: string[]) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useChapters(projectId: string): UseChaptersReturn {
  const [error, setError] = useState<Error | null>(null);

  // useLiveQuery: IndexedDB 변경 시 자동으로 re-render
  // 기본값을 undefined로 설정해서 로딩 상태 정확히 추적
  const chapters = useLiveQuery(
    async () => {
      try {
        setError(null);
        const localChapters = await db.chapters
          .where("projectId")
          .equals(projectId)
          .sortBy("order");

        // LocalChapter를 Chapter 타입으로 변환
        return localChapters.map((ch) => ({
          id: ch.id,
          projectId: ch.projectId,
          title: ch.title,
          content: ch.content,
          contentText: ch.contentText,
          wordCount: ch.wordCount,
          order: ch.order,
          status: ch.status,
          plot: ch.plot,
          fontFamily: ch.fontFamily,
          createdAt: ch.createdAt,
          updatedAt: ch.updatedAt,
        }));
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch chapters"));
        return [];
      }
    },
    [projectId]
    // 기본값 없음 → 로딩 중 undefined 반환
  );

  const isLoading = chapters === undefined;

  const createChapter = useCallback(
    async (data: CreateChapterData): Promise<Chapter> => {
      // UseCase로 챕터 생성 (유효성 검증 포함)
      const result = await createChapterUseCase({
        projectId,
        title: data.title,
        content: data.content,
        plot: data.plot,
      });

      if (!result.success || !result.chapter) {
        throw new Error(result.error || "Failed to create chapter");
      }

      // useLiveQuery가 자동으로 업데이트하므로 setState 불필요
      return result.chapter;
    },
    [projectId]
  );

  const updateChapter = useCallback(
    async (id: string, data: UpdateChapterInput): Promise<Chapter> => {
      const updated = await chapterLocalRepository.update(id, data);
      // useLiveQuery가 자동으로 업데이트하므로 setState 불필요
      return updated;
    },
    []
  );

  const updateChapterOrder = useCallback(
    async (id: string, newOrder: number): Promise<UpdateChapterOrderResult> => {
      const result = await updateChapterOrderUseCase({
        chapterId: id,
        newOrder,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to update chapter order");
      }

      return {
        swapped: result.swapped,
        swappedWithChapter: result.swappedWithChapter,
      };
    },
    []
  );

  const deleteChapter = useCallback(async (id: string): Promise<void> => {
    // UseCase로 챕터 삭제 (다른 챕터 order는 유지, 빈 번호 허용)
    const result = await deleteChapterUseCase({ chapterId: id });

    if (!result.success) {
      throw new Error(result.error || "Failed to delete chapter");
    }

    // useLiveQuery가 자동으로 업데이트하므로 setState 불필요
  }, []);

  const reorderChapters = useCallback(
    async (chapterIds: string[]): Promise<void> => {
      // UseCase로 순서 변경 (유효성 검증 포함)
      const result = await reorderChaptersUseCase({
        projectId,
        chapterIds,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to reorder chapters");
      }

      // useLiveQuery가 자동으로 업데이트하므로 setState 불필요
    },
    [projectId]
  );

  // refetch는 useLiveQuery에서는 불필요하지만 인터페이스 호환성 유지
  const refetch = useCallback(async () => {
    // useLiveQuery가 자동으로 데이터를 동기화하므로 no-op
  }, []);

  return {
    chapters: chapters ?? [],
    isLoading,
    error,
    createChapter,
    updateChapter,
    updateChapterOrder,
    deleteChapter,
    reorderChapters,
    refetch,
  };
}
