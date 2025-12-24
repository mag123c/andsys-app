"use client";

import { Clock, Plus, Minus, Edit3 } from "lucide-react";
import type { Version } from "@/repositories/types";
import { cn } from "@/lib/utils";

interface VersionListItemProps {
  version: Version;
  isSelected: boolean;
  isFirst: boolean;
  onClick: () => void;
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;

  return date.toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDiffSummary(version: Version): {
  added: number;
  removed: number;
  changed: number;
} {
  const diff = version.diff;
  if (!diff) return { added: 0, removed: 0, changed: 0 };

  let added = 0;
  let removed = 0;
  let changed = 0;

  // Line diff 통계
  if (diff.lines) {
    diff.lines.forEach((line) => {
      if (line.type === "added") added++;
      if (line.type === "removed") removed++;
    });
  }

  // Field diff 통계
  if (diff.fields) {
    changed = diff.fields.length;
  }

  return { added, removed, changed };
}

export function VersionListItem({
  version,
  isSelected,
  isFirst,
  onClick,
}: VersionListItemProps) {
  const { added, removed, changed } = getDiffSummary(version);
  const hasChanges = added > 0 || removed > 0 || changed > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left px-3 py-2 rounded-md transition-colors",
        "hover:bg-accent focus:outline-none focus:ring-1 focus:ring-ring",
        isSelected && "bg-accent"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-sm truncate">
            {formatDate(version.createdAt)}
          </span>
          {isFirst && (
            <span className="text-xs text-muted-foreground">(최신)</span>
          )}
        </div>
      </div>

      {hasChanges && (
        <div className="flex items-center gap-2 mt-1 ml-5">
          {added > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-green-600 dark:text-green-400">
              <Plus className="h-3 w-3" />
              {added}
            </span>
          )}
          {removed > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-red-600 dark:text-red-400">
              <Minus className="h-3 w-3" />
              {removed}
            </span>
          )}
          {changed > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-amber-600 dark:text-amber-400">
              <Edit3 className="h-3 w-3" />
              {changed}개 필드
            </span>
          )}
        </div>
      )}
    </button>
  );
}
