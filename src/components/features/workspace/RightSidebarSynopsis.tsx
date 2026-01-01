"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FileText, Check, Loader2 } from "lucide-react";
import type { Synopsis } from "@/repositories/types";
import { cn } from "@/lib/utils";
import { formatCharacterCount } from "@/lib/format";
import { Textarea } from "@/components/ui/textarea";

const DEBOUNCE_MS = 500;

type SaveStatus = "saved" | "saving" | "unsaved";

interface RightSidebarSynopsisProps {
  synopsis: Synopsis | null;
  isLoading: boolean;
  onContentChange?: (plainText: string) => Promise<void>;
  className?: string;
}

export function RightSidebarSynopsis({
  synopsis,
  isLoading,
  onContentChange,
  className,
}: RightSidebarSynopsisProps) {
  const [draftText, setDraftText] = useState(synopsis?.plainText ?? "");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingTextRef = useRef<string | null>(null);

  // synopsis 변경 시 draftText 동기화
  useEffect(() => {
    setDraftText(synopsis?.plainText ?? "");
    setSaveStatus("saved");
  }, [synopsis?.id, synopsis?.plainText]);

  const save = useCallback(async (text: string) => {
    if (!onContentChange) return;
    setSaveStatus("saving");
    try {
      await onContentChange(text);
      setSaveStatus("saved");
    } catch {
      setSaveStatus("saved"); // 에러 시에도 UI 복구
    }
  }, [onContentChange]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setDraftText(text);
    pendingTextRef.current = text;
    setSaveStatus("unsaved");

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (pendingTextRef.current !== null) {
        save(pendingTextRef.current);
        pendingTextRef.current = null;
      }
    }, DEBOUNCE_MS);
  }, [save]);

  // 언마운트 시 저장
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (pendingTextRef.current !== null && onContentChange) {
        onContentChange(pendingTextRef.current).catch(() => {});
      }
    };
  }, [onContentChange]);

  if (isLoading) {
    return (
      <div className={cn("p-4", className)}>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">시놉시스</span>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded animate-pulse" />
          <div className="h-3 bg-muted rounded animate-pulse w-4/5" />
          <div className="h-3 bg-muted rounded animate-pulse w-3/5" />
        </div>
      </div>
    );
  }

  const wordCount = draftText.trim().length;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">시놉시스</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {formatCharacterCount(wordCount)}
          </span>
          {saveStatus === "saving" && (
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          )}
          {saveStatus === "saved" && wordCount > 0 && (
            <Check className="h-3 w-3 text-green-500" />
          )}
        </div>
      </div>

      {/* Editable Content */}
      <div className="flex-1 p-3 min-h-0">
        <Textarea
          value={draftText}
          onChange={handleChange}
          placeholder="이 소설의 전체 줄거리를 작성하세요..."
          className="h-full min-h-[200px] resize-none text-sm leading-relaxed"
          disabled={!onContentChange}
        />
      </div>
    </div>
  );
}
