"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  Chapter,
  CreateChapterInput,
  UpdateChapterInput,
} from "@/repositories/types";
import { chapterLocalRepository } from "@/storage/local/chapter.local";

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
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchChapters = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await chapterLocalRepository.getByProjectId(projectId);
      setChapters(result);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch chapters")
      );
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  const createChapter = useCallback(
    async (data: Omit<CreateChapterInput, "projectId">): Promise<Chapter> => {
      const chapter = await chapterLocalRepository.create({
        ...data,
        projectId,
      });
      setChapters((prev) => [...prev, chapter]);
      return chapter;
    },
    [projectId]
  );

  const updateChapter = useCallback(
    async (id: string, data: UpdateChapterInput): Promise<Chapter> => {
      const updated = await chapterLocalRepository.update(id, data);
      setChapters((prev) =>
        prev.map((ch) => (ch.id === id ? updated : ch))
      );
      return updated;
    },
    []
  );

  const deleteChapter = useCallback(async (id: string): Promise<void> => {
    await chapterLocalRepository.delete(id);
    setChapters((prev) => prev.filter((ch) => ch.id !== id));
  }, []);

  const reorderChapters = useCallback(
    async (chapterIds: string[]): Promise<void> => {
      await chapterLocalRepository.reorder(projectId, chapterIds);
      setChapters((prev) => {
        const chapterMap = new Map(prev.map((ch) => [ch.id, ch]));
        return chapterIds
          .map((id, index) => {
            const chapter = chapterMap.get(id);
            return chapter ? { ...chapter, order: index + 1 } : null;
          })
          .filter((ch): ch is Chapter => ch !== null);
      });
    },
    [projectId]
  );

  return {
    chapters,
    isLoading,
    error,
    createChapter,
    updateChapter,
    deleteChapter,
    reorderChapters,
    refetch: fetchChapters,
  };
}
