"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { JSONContent } from "@tiptap/core";
import type { Chapter, UpdateChapterInput } from "@/repositories/types";
import { chapterLocalRepository } from "@/storage/local/chapter.local";

export type SaveStatus = "saved" | "saving" | "unsaved" | "error";

interface UseEditorReturn {
  chapter: Chapter | null;
  isLoading: boolean;
  error: Error | null;
  saveStatus: SaveStatus;
  updateContent: (content: JSONContent) => void;
  updateTitle: (title: string) => Promise<void>;
  updatePlot: (plot: string | null) => void;
  updateFontFamily: (fontFamily: string | null) => Promise<void>;
  saveNow: () => Promise<void>;
}

const DEBOUNCE_MS = 500;

export function useEditor(chapterId: string): UseEditorReturn {
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");

  const pendingContentRef = useRef<JSONContent | null>(null);
  const pendingPlotRef = useRef<string | null | undefined>(undefined);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const plotDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);
  const chapterIdRef = useRef(chapterId);

  // chapterId가 변경될 때마다 ref 업데이트
  useEffect(() => {
    chapterIdRef.current = chapterId;
  }, [chapterId]);

  const fetchChapter = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await chapterLocalRepository.getById(chapterId);
      setChapter(result);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch chapter")
      );
    } finally {
      setIsLoading(false);
    }
  }, [chapterId]);

  useEffect(() => {
    fetchChapter();
  }, [fetchChapter]);

  // 동기적 저장 (페이지 이탈 시 사용)
  const saveSync = useCallback(() => {
    const hasPendingContent = pendingContentRef.current !== null;
    const hasPendingPlot = pendingPlotRef.current !== undefined;

    if ((hasPendingContent || hasPendingPlot) && !isSavingRef.current) {
      isSavingRef.current = true;
      // fire-and-forget이지만, IndexedDB는 동기적으로 작업을 시작함
      const updateData: UpdateChapterInput = {};
      if (hasPendingContent) {
        updateData.content = pendingContentRef.current!;
      }
      if (hasPendingPlot) {
        updateData.plot = pendingPlotRef.current!;
      }

      chapterLocalRepository
        .update(chapterIdRef.current, updateData)
        .catch(console.error)
        .finally(() => {
          isSavingRef.current = false;
        });
      pendingContentRef.current = null;
      pendingPlotRef.current = undefined;
    }
  }, []);

  // beforeunload 및 visibilitychange 이벤트 핸들러
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (pendingContentRef.current || pendingPlotRef.current !== undefined) {
        saveSync();
        // 브라우저에 저장 중임을 알림
        e.preventDefault();
        e.returnValue = "";
      }
    };

    const handleVisibilityChange = () => {
      // 탭이 백그라운드로 갈 때 저장
      if (document.visibilityState === "hidden" && (pendingContentRef.current || pendingPlotRef.current !== undefined)) {
        saveSync();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [saveSync]);

  // 컴포넌트 언마운트 시 저장
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (plotDebounceTimerRef.current) {
        clearTimeout(plotDebounceTimerRef.current);
      }
      // 언마운트 시 동기적 저장 시도
      saveSync();
    };
  }, [saveSync]);

  const save = useCallback(
    async (data: UpdateChapterInput) => {
      if (!chapter) return;

      setSaveStatus("saving");
      isSavingRef.current = true;
      try {
        const updated = await chapterLocalRepository.update(chapterId, data);
        setChapter(updated);
        setSaveStatus("saved");
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to save chapter")
        );
        setSaveStatus("error");
      } finally {
        isSavingRef.current = false;
      }
    },
    [chapter, chapterId]
  );

  const saveNow = useCallback(async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (plotDebounceTimerRef.current) {
      clearTimeout(plotDebounceTimerRef.current);
      plotDebounceTimerRef.current = null;
    }

    const updateData: UpdateChapterInput = {};
    if (pendingContentRef.current) {
      updateData.content = pendingContentRef.current;
      pendingContentRef.current = null;
    }
    if (pendingPlotRef.current !== undefined) {
      updateData.plot = pendingPlotRef.current;
      pendingPlotRef.current = undefined;
    }

    if (Object.keys(updateData).length > 0) {
      await save(updateData);
    }
  }, [save]);

  const updateContent = useCallback(
    (content: JSONContent) => {
      pendingContentRef.current = content;
      setSaveStatus("unsaved");

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(async () => {
        if (pendingContentRef.current) {
          await save({ content: pendingContentRef.current });
          pendingContentRef.current = null;
        }
      }, DEBOUNCE_MS);
    },
    [save]
  );

  const updateTitle = useCallback(
    async (title: string) => {
      await save({ title });
    },
    [save]
  );

  const updatePlot = useCallback(
    (plot: string | null) => {
      pendingPlotRef.current = plot;
      setSaveStatus("unsaved");

      if (plotDebounceTimerRef.current) {
        clearTimeout(plotDebounceTimerRef.current);
      }

      plotDebounceTimerRef.current = setTimeout(async () => {
        if (pendingPlotRef.current !== undefined) {
          await save({ plot: pendingPlotRef.current });
          pendingPlotRef.current = undefined;
        }
      }, DEBOUNCE_MS);
    },
    [save]
  );

  const updateFontFamily = useCallback(
    async (fontFamily: string | null) => {
      await save({ fontFamily });
    },
    [save]
  );

  return {
    chapter,
    isLoading,
    error,
    saveStatus,
    updateContent,
    updateTitle,
    updatePlot,
    updateFontFamily,
    saveNow,
  };
}
