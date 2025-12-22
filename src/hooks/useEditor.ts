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
  saveNow: () => Promise<void>;
}

const DEBOUNCE_MS = 2000;

export function useEditor(chapterId: string): UseEditorReturn {
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");

  const pendingContentRef = useRef<JSONContent | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (pendingContentRef.current) {
        chapterLocalRepository.update(chapterId, {
          content: pendingContentRef.current,
        });
      }
    };
  }, [chapterId]);

  const save = useCallback(
    async (data: UpdateChapterInput) => {
      if (!chapter) return;

      setSaveStatus("saving");
      try {
        const updated = await chapterLocalRepository.update(chapterId, data);
        setChapter(updated);
        setSaveStatus("saved");
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to save chapter")
        );
        setSaveStatus("error");
      }
    },
    [chapter, chapterId]
  );

  const saveNow = useCallback(async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (pendingContentRef.current) {
      await save({ content: pendingContentRef.current });
      pendingContentRef.current = null;
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

  return {
    chapter,
    isLoading,
    error,
    saveStatus,
    updateContent,
    updateTitle,
    saveNow,
  };
}
