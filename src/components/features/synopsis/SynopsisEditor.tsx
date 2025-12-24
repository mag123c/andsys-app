"use client";

import { useState, useCallback } from "react";
import { History } from "lucide-react";
import type { JSONContent } from "@tiptap/core";
import { useSynopsis } from "@/hooks/useSynopsis";
import { Editor } from "@/components/features/editor/Editor";
import { VersionHistoryModal } from "@/components/features/history";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SynopsisEditorProps {
  projectId: string;
  className?: string;
}

export function SynopsisEditor({ projectId, className }: SynopsisEditorProps) {
  const { synopsis, isLoading, error, saveStatus, updateContent } =
    useSynopsis(projectId);
  const [showHistory, setShowHistory] = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  const handleRestore = useCallback(
    async (snapshot: Record<string, unknown>) => {
      const content = snapshot.content as JSONContent;
      if (content) {
        updateContent(content);
        // Force editor re-render with restored content
        setEditorKey((prev) => prev + 1);
      }
    },
    [updateContent]
  );

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
    <>
      <div className={cn("flex flex-col h-full", className)}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">시놉시스</h2>
          <div className="flex items-center gap-2">
            <SaveStatusIndicator status={saveStatus} />
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              onClick={() => setShowHistory(true)}
            >
              <History className="h-4 w-4 mr-1" />
              히스토리
            </Button>
          </div>
        </div>
        <div className="flex-1 border rounded-lg overflow-hidden">
          <Editor
            key={editorKey}
            initialContent={synopsis?.content}
            onUpdate={updateContent}
            className="h-full"
          />
        </div>
      </div>

      <VersionHistoryModal
        open={showHistory}
        onOpenChange={setShowHistory}
        entityType="synopsis"
        entityId={synopsis?.id || null}
        entityName="시놉시스"
        onRestore={handleRestore}
      />
    </>
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
