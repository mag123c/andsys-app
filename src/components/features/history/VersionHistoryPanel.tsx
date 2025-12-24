"use client";

import { useState } from "react";
import { History, RotateCcw, X } from "lucide-react";
import type { Version, VersionEntityType } from "@/repositories/types";
import { useVersionHistory } from "@/hooks/useVersionHistory";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { VersionListItem } from "./VersionListItem";
import { DiffView } from "./DiffView";
import { RestoreVersionDialog } from "./RestoreVersionDialog";

interface VersionHistoryPanelProps {
  entityType: VersionEntityType;
  entityId: string | null;
  entityName?: string;
  onRestore: (snapshot: Record<string, unknown>) => Promise<void>;
  onClose?: () => void;
  className?: string;
}

export function VersionHistoryPanel({
  entityType,
  entityId,
  entityName,
  onRestore,
  onClose,
  className,
}: VersionHistoryPanelProps) {
  const { versions, isLoading, selectedVersion, selectVersion, refresh } =
    useVersionHistory(entityType, entityId);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [versionToRestore, setVersionToRestore] = useState<Version | null>(null);

  const handleRestoreClick = (version: Version) => {
    setVersionToRestore(version);
    setRestoreDialogOpen(true);
  };

  const handleRestore = async (version: Version) => {
    await onRestore(version.snapshot);
    await refresh();
  };

  const entityLabel = entityType === "synopsis" ? "시놉시스" : "캐릭터";

  if (!entityId) {
    return (
      <div className={cn("flex flex-col h-full bg-background", className)}>
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">버전 히스토리</span>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          {entityLabel}를 선택해주세요
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2 min-w-0">
          <History className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-medium text-sm truncate">
            {entityName ? `${entityName} 히스토리` : "버전 히스토리"}
          </span>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Version List */}
        <div className="w-44 border-r flex flex-col">
          <div className="p-2 border-b">
            <span className="text-xs text-muted-foreground">
              {versions.length}개 버전
            </span>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {isLoading ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  로딩 중...
                </div>
              ) : versions.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  버전 기록이 없습니다
                </div>
              ) : (
                versions.map((version, idx) => (
                  <VersionListItem
                    key={version.id}
                    version={version}
                    isSelected={selectedVersion?.id === version.id}
                    isFirst={idx === 0}
                    onClick={() => selectVersion(version)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Diff View */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedVersion ? (
            <>
              <div className="flex items-center justify-between p-2 border-b">
                <span className="text-xs text-muted-foreground">
                  {selectedVersion.createdAt.toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {versions[0]?.id !== selectedVersion.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleRestoreClick(selectedVersion)}
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    이 버전으로 복원
                  </Button>
                )}
              </div>
              <ScrollArea className="flex-1">
                <div className="p-3">
                  <DiffView version={selectedVersion} />
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              버전을 선택하여 변경사항을 확인하세요
            </div>
          )}
        </div>
      </div>

      <RestoreVersionDialog
        open={restoreDialogOpen}
        onOpenChange={setRestoreDialogOpen}
        version={versionToRestore}
        onRestore={handleRestore}
      />
    </div>
  );
}
