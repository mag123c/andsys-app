"use client";

import { useState } from "react";
import { Copy, Trash2, Lock, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatTimeRemaining, isExpired } from "@/lib/share";
import type { SharedChapterListItem } from "@/repositories/types";

interface ShareLinkCardProps {
  item: SharedChapterListItem;
  onDelete: (id: string) => Promise<void>;
}

export function ShareLinkCard({ item, onDelete }: ShareLinkCardProps) {
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const expired = isExpired(item.expiresAt);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(item.shareUrl);
      setCopied(true);
      toast.success("클립보드에 복사되었습니다");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("복사에 실패했습니다");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(item.id);
      toast.success("공유 링크가 삭제되었습니다");
    } catch {
      toast.error("삭제에 실패했습니다");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`rounded-lg border p-4 ${
        expired || !item.isActive ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium truncate">
              {item.chapterNumber}화: {item.chapterTitle}
            </h3>
            {item.hasPassword && (
              <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate mb-2">
            {item.projectTitle}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>
              {expired || !item.isActive
                ? "만료됨"
                : formatTimeRemaining(item.expiresAt)}
            </span>
            <span>조회 {item.viewCount}회</span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {!expired && item.isActive && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                asChild
              >
                <a href={item.shareUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>공유 링크 삭제</AlertDialogTitle>
                <AlertDialogDescription>
                  이 공유 링크를 삭제하시겠습니까? 삭제 후에는 더 이상 이 링크로
                  접근할 수 없습니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  삭제
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
