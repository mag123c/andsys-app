"use client";

import { useState } from "react";
import { History, RotateCcw } from "lucide-react";
import type { Version, VersionEntityType } from "@/repositories/types";
import { useVersionHistory } from "@/hooks/useVersionHistory";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VersionListItem } from "./VersionListItem";
import { DiffView } from "./DiffView";
import { RestoreVersionDialog } from "./RestoreVersionDialog";

interface VersionHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: VersionEntityType;
  entityId: string | null;
  entityName?: string;
  onRestore: (snapshot: Record<string, unknown>) => Promise<void>;
}

export function VersionHistoryModal({
  open,
  onOpenChange,
  entityType,
  entityId,
  entityName,
  onRestore,
}: VersionHistoryModalProps) {
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
    onOpenChange(false);
  };

  const entityLabel = entityType === "synopsis" ? "시놉시스" : "캐릭터";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-muted-foreground" />
              {entityName ? `${entityName} 히스토리` : `${entityLabel} 히스토리`}
            </DialogTitle>
          </DialogHeader>

          {!entityId ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              {entityLabel}를 선택해주세요
            </div>
          ) : (
            <div className="flex-1 flex overflow-hidden">
              {/* Version List - 좌측 */}
              <div className="w-64 border-r flex flex-col bg-muted/30">
                <div className="px-4 py-3 border-b bg-background">
                  <span className="text-sm font-medium">
                    {versions.length}개 버전
                  </span>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-3 space-y-2">
                    {isLoading ? (
                      <div className="text-sm text-muted-foreground text-center py-8">
                        로딩 중...
                      </div>
                    ) : versions.length === 0 ? (
                      <div className="text-sm text-muted-foreground text-center py-8">
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

              {/* Diff View - 우측 */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {selectedVersion ? (
                  <>
                    <div className="flex items-center justify-between px-6 py-3 border-b bg-background shrink-0">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {selectedVersion.createdAt.toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {selectedVersion.createdAt.toLocaleTimeString("ko-KR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {versions[0]?.id !== selectedVersion.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestoreClick(selectedVersion)}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          이 버전으로 복원
                        </Button>
                      )}
                    </div>
                    <ScrollArea className="flex-1">
                      <div className="p-6">
                        <DiffView version={selectedVersion} />
                      </div>
                    </ScrollArea>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <History className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">버전을 선택하여</p>
                      <p className="text-sm">변경사항을 확인하세요</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <RestoreVersionDialog
        open={restoreDialogOpen}
        onOpenChange={setRestoreDialogOpen}
        version={versionToRestore}
        onRestore={handleRestore}
      />
    </>
  );
}
