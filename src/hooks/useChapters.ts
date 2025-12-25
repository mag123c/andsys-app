"use client";

import { useCallback, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import type {
  Chapter,
  CreateChapterInput,
  UpdateChapterInput,
} from "@/repositories/types";
import { chapterLocalRepository } from "@/storage/local/chapter.local";
import { db } from "@/storage/local/db";

interface UseChaptersReturn {
  chapters: Chapter[];
  isLoading: boolean;
  error: Error | null;
  createChapter: (data: Omit<CreateChapterInput, "projectId">) => Promise<Chapter>;
  updateChapter: (id: string, data: UpdateChapterInput) => Promise<Chapter>;
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
    async (data: Omit<CreateChapterInput, "projectId">): Promise<Chapter> => {
      const chapter = await chapterLocalRepository.create({
        ...data,
        projectId,
      });
      // useLiveQuery가 자동으로 업데이트하므로 setState 불필요
      return chapter;
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

  const deleteChapter = useCallback(async (id: string): Promise<void> => {
    await chapterLocalRepository.delete(id);
    // useLiveQuery가 자동으로 업데이트하므로 setState 불필요
  }, []);

  const reorderChapters = useCallback(
    async (chapterIds: string[]): Promise<void> => {
      await chapterLocalRepository.reorder(projectId, chapterIds);
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
    deleteChapter,
    reorderChapters,
    refetch,
  };
}
