"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import type { Version } from "@/repositories/types";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface RestoreVersionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  version: Version | null;
  onRestore: (version: Version) => Promise<void>;
}

function formatDateTime(date: Date): string {
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RestoreVersionDialog({
  open,
  onOpenChange,
  version,
  onRestore,
}: RestoreVersionDialogProps) {
  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestore = async () => {
    if (!version) return;

    setIsRestoring(true);
    try {
      await onRestore(version);
      onOpenChange(false);
    } finally {
      setIsRestoring(false);
    }
  };

  if (!version) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            버전 복원
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              <strong>{formatDateTime(version.createdAt)}</strong> 버전으로
              복원하시겠습니까?
            </p>
            <p className="text-amber-600 dark:text-amber-400">
              현재 내용이 선택한 버전으로 대체됩니다. 이 작업은 새 버전으로
              기록됩니다.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isRestoring}
          >
            취소
          </Button>
          <Button onClick={handleRestore} disabled={isRestoring}>
            {isRestoring ? "복원 중..." : "복원"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
