"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { JSONContent } from "@tiptap/core";
import type { Synopsis, UpdateSynopsisInput } from "@/repositories/types";
import { synopsisLocalRepository } from "@/storage/local/synopsis.local";

export type SaveStatus = "saved" | "saving" | "unsaved" | "error";

interface UseSynopsisReturn {
  synopsis: Synopsis | null;
  isLoading: boolean;
  error: Error | null;
  saveStatus: SaveStatus;
  updateContent: (content: JSONContent) => void;
  saveNow: () => Promise<void>;
}

const DEBOUNCE_MS = 2000;

export function useSynopsis(projectId: string): UseSynopsisReturn {
  const [synopsis, setSynopsis] = useState<Synopsis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");

  const pendingContentRef = useRef<JSONContent | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const synopsisIdRef = useRef<string | null>(null);

  const fetchOrCreateSynopsis = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let result = await synopsisLocalRepository.getByProjectId(projectId);

      if (!result) {
        result = await synopsisLocalRepository.create({ projectId });
      }

      setSynopsis(result);
      synopsisIdRef.current = result.id;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch synopsis")
      );
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchOrCreateSynopsis();
  }, [fetchOrCreateSynopsis]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (pendingContentRef.current && synopsisIdRef.current) {
        synopsisLocalRepository.update(synopsisIdRef.current, {
          content: pendingContentRef.current,
        });
      }
    };
  }, [projectId]);

  const save = useCallback(
    async (data: UpdateSynopsisInput) => {
      if (!synopsis) return;

      setSaveStatus("saving");
      try {
        const updated = await synopsisLocalRepository.update(synopsis.id, data);
        setSynopsis(updated);
        setSaveStatus("saved");
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to save synopsis")
        );
        setSaveStatus("error");
      }
    },
    [synopsis]
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

  return {
    synopsis,
    isLoading,
    error,
    saveStatus,
    updateContent,
    saveNow,
  };
}
