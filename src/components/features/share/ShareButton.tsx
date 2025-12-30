"use client";

import { useState, useEffect, useCallback } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ShareDialog } from "./ShareDialog";
import type { Chapter, Project, SharedChapterListItem } from "@/repositories/types";

interface ShareButtonProps {
  project: Project;
  chapter: Chapter;
  disabled?: boolean;
}

export function ShareButton({ project, chapter, disabled }: ShareButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeShare, setActiveShare] = useState<SharedChapterListItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActiveShare = useCallback(async () => {
    try {
      const res = await fetch(`/api/share/chapters?chapterId=${chapter.id}`);
      const json = await res.json();
      if (json.success && json.data.length > 0) {
        // 첫 번째 활성 링크 사용
        const item = json.data[0];
        setActiveShare({
          ...item,
          expiresAt: item.expiresAt ? new Date(item.expiresAt) : null,
          createdAt: new Date(item.createdAt),
        });
      } else {
        setActiveShare(null);
      }
    } catch {
      setActiveShare(null);
    } finally {
      setIsLoading(false);
    }
  }, [chapter.id]);

  useEffect(() => {
    fetchActiveShare();
  }, [fetchActiveShare]);

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    // 다이얼로그 닫힐 때 상태 갱신
    if (!open) {
      fetchActiveShare();
    }
  };

  const isSharing = !!activeShare;

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isSharing ? "default" : "ghost"}
            size="sm"
            onClick={() => setDialogOpen(true)}
            disabled={disabled || isLoading}
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">
              {isSharing ? "공유중" : "공유"}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isSharing
            ? "공유 링크가 활성화되어 있습니다"
            : "이 회차를 공유 링크로 공유합니다"}
        </TooltipContent>
      </Tooltip>

      <ShareDialog
        open={dialogOpen}
        onOpenChange={handleDialogChange}
        project={project}
        chapter={chapter}
        activeShare={activeShare}
        onShareDeleted={() => setActiveShare(null)}
      />
    </>
  );
}
