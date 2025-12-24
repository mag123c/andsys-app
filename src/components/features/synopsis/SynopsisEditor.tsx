"use client";

import { useSynopsis } from "@/hooks/useSynopsis";
import { Editor } from "@/components/features/editor/Editor";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SynopsisEditorProps {
  projectId: string;
  className?: string;
}

export function SynopsisEditor({ projectId, className }: SynopsisEditorProps) {
  const { synopsis, isLoading, error, saveStatus, updateContent } =
    useSynopsis(projectId);

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("text-destructive", className)}>
        오류가 발생했습니다: {error.message}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">시놉시스</h2>
        <SaveStatusIndicator status={saveStatus} />
      </div>
      <div className="flex-1 border rounded-lg overflow-hidden">
        <Editor
          initialContent={synopsis?.content}
          onUpdate={updateContent}
          className="h-full"
        />
      </div>
    </div>
  );
}

function SaveStatusIndicator({
  status,
}: {
  status: "saved" | "saving" | "unsaved" | "error";
}) {
  const statusConfig = {
    saved: { text: "저장됨", className: "text-muted-foreground" },
    saving: { text: "저장 중...", className: "text-muted-foreground" },
    unsaved: { text: "저장 안 됨", className: "text-yellow-600" },
    error: { text: "저장 실패", className: "text-destructive" },
  };

  const config = statusConfig[status];

  return <span className={cn("text-sm", config.className)}>{config.text}</span>;
}
