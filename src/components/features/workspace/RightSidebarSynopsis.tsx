"use client";

import { FileText } from "lucide-react";
import type { Synopsis } from "@/repositories/types";
import { cn } from "@/lib/utils";
import { formatCharacterCount } from "@/lib/format";

interface RightSidebarSynopsisProps {
  synopsis: Synopsis | null;
  isLoading: boolean;
  className?: string;
}

export function RightSidebarSynopsis({
  synopsis,
  isLoading,
  className,
}: RightSidebarSynopsisProps) {
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

  const hasContent = synopsis?.plainText && synopsis.plainText.trim().length > 0;

  return (
    <div className={cn("p-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">시놉시스</span>
        </div>
        {hasContent && (
          <span className="text-xs text-muted-foreground">
            {formatCharacterCount(synopsis.wordCount)}
          </span>
        )}
      </div>

      {/* Content */}
      {hasContent ? (
        <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap line-clamp-[20]">
          {synopsis.plainText}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-4">
          시놉시스가 없습니다
        </p>
      )}
    </div>
  );
}
