"use client";

import { Check, Cloud, CloudOff, Loader2 } from "lucide-react";
import type { SaveStatus as SaveStatusType } from "@/hooks/useEditor";
import { cn } from "@/lib/utils";

interface SaveStatusProps {
  status: SaveStatusType;
  className?: string;
}

const statusConfig = {
  saved: {
    icon: Check,
    text: "저장됨",
    className: "text-muted-foreground",
  },
  saving: {
    icon: Loader2,
    text: "저장 중...",
    className: "text-muted-foreground",
  },
  unsaved: {
    icon: Cloud,
    text: "저장 대기",
    className: "text-yellow-600 dark:text-yellow-500",
  },
  error: {
    icon: CloudOff,
    text: "저장 실패",
    className: "text-destructive",
  },
} as const;

export function SaveStatus({ status, className }: SaveStatusProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-sm",
        config.className,
        className
      )}
    >
      <Icon
        className={cn("h-4 w-4", status === "saving" && "animate-spin")}
      />
      <span>{config.text}</span>
    </div>
  );
}
