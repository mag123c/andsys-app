"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/storage/local/db";

interface UserStats {
  totalProjects: number;
  totalChapters: number;
  totalWords: number;
}

/**
 * 사용자 통계 훅
 * useLiveQuery로 IndexedDB에서 실시간 집계
 */
export function useUserStats(): UserStats {
  const stats = useLiveQuery(async () => {
    const [projectCount, chapters] = await Promise.all([
      db.projects.count(),
      db.chapters.toArray(),
    ]);

    const totalWords = chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0);

    return {
      totalProjects: projectCount,
      totalChapters: chapters.length,
      totalWords,
    };
  }, []);

  return stats ?? { totalProjects: 0, totalChapters: 0, totalWords: 0 };
}
