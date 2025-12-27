"use client";

import { useState, useMemo } from "react";
import { BookOpen, X } from "lucide-react";
import type { Chapter } from "@/repositories/types";
import { cn } from "@/lib/utils";
import { formatEpisodeNumber, formatCharacterCount } from "@/lib/format";
import { extractText } from "@/lib/content-utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RightSidebarChaptersProps {
  chapters: Chapter[];
  currentChapterId: string;
  className?: string;
}

export function RightSidebarChapters({
  chapters,
  currentChapterId,
  className,
}: RightSidebarChaptersProps) {
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  // 현재 편집 중인 회차를 제외한 목록 (order 기준 정렬)
  const otherChapters = useMemo(() => {
    return chapters
      .filter((ch) => ch.id !== currentChapterId)
      .sort((a, b) => a.order - b.order);
  }, [chapters, currentChapterId]);

  // 선택된 회차 내용 텍스트 추출
  const selectedContent = useMemo(() => {
    if (!selectedChapter) return "";
    return extractText(selectedChapter.content);
  }, [selectedChapter]);

  if (otherChapters.length === 0) {
    return (
      <div className={cn("p-4", className)}>
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">다른 회차</span>
        </div>
        <p className="text-xs text-muted-foreground text-center py-4">
          참조할 다른 회차가 없습니다
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Header */}
      <div className="p-3 border-b">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            다른 회차 ({otherChapters.length})
          </span>
        </div>
      </div>

      {/* Selected Chapter Preview */}
      {selectedChapter && (
        <div className="flex-1 flex flex-col min-h-0 border-b">
          <div className="flex items-center justify-between p-2 border-b bg-muted/30">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-medium shrink-0">
                {formatEpisodeNumber(selectedChapter.order)}
              </span>
              <span className="text-xs truncate">{selectedChapter.title}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={() => setSelectedChapter(null)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <ScrollArea className="flex-1 p-3">
            <div className="text-sm whitespace-pre-wrap leading-relaxed">
              {selectedContent || (
                <span className="text-muted-foreground">내용이 없습니다</span>
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Chapter List */}
      <div className={cn("overflow-y-auto", selectedChapter ? "max-h-40" : "flex-1")}>
        <ul className="p-2 space-y-1">
          {otherChapters.map((chapter) => (
            <li key={chapter.id}>
              <button
                type="button"
                onClick={() =>
                  setSelectedChapter(
                    selectedChapter?.id === chapter.id ? null : chapter
                  )
                }
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-sm",
                  "hover:bg-accent transition-colors",
                  selectedChapter?.id === chapter.id &&
                    "bg-accent text-accent-foreground"
                )}
              >
                <span className="text-xs text-muted-foreground shrink-0 w-10">
                  {formatEpisodeNumber(chapter.order)}
                </span>
                <span className="truncate flex-1">{chapter.title}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatCharacterCount(chapter.wordCount)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
