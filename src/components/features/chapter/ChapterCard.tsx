"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreVertical, Trash2, GripVertical, Pencil } from "lucide-react";
import type { Chapter, UpdateChapterInput } from "@/repositories/types";
import { formatCharacterCount, formatDateTime, formatEpisodeNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface ChapterCardProps {
  chapter: Chapter;
  projectId: string;
  onDelete: (id: string) => void;
  onUpdate?: (data: UpdateChapterInput) => Promise<void>;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function ChapterCard({
  chapter,
  projectId,
  onDelete,
  onUpdate,
  dragHandleProps,
}: ChapterCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editTitle, setEditTitle] = useState(chapter.title);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !onUpdate) return;

    setIsUpdating(true);
    try {
      await onUpdate({ title: editTitle.trim() });
      setShowEditDialog(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenEditDialog = () => {
    setEditTitle(chapter.title);
    setShowEditDialog(true);
  };

  return (
    <>
      <div className="group flex items-center gap-2 rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50">
        {dragHandleProps && (
          <div
            {...dragHandleProps}
            className="cursor-grab text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical className="h-4 w-4" />
          </div>
        )}

        <Link
          href={`/novels/${projectId}/chapters/${chapter.id}`}
          className="flex flex-1 items-center gap-3 min-w-0"
        >
          <div className="flex h-8 shrink-0 items-center justify-center rounded bg-secondary px-2">
            <span className="text-xs font-medium text-muted-foreground">
              {formatEpisodeNumber(chapter.order)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate group-hover:text-primary transition-colors">
              {chapter.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatCharacterCount(chapter.wordCount)}</span>
              <span>·</span>
              <span>{formatDateTime(chapter.updatedAt)}</span>
              {chapter.status === "draft" && (
                <>
                  <span>·</span>
                  <span className="text-yellow-600">초안</span>
                </>
              )}
            </div>
          </div>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">메뉴 열기</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onUpdate && (
              <>
                <DropdownMenuItem onClick={handleOpenEditDialog}>
                  <Pencil className="mr-2 h-4 w-4" />
                  제목 수정
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>회차 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{chapter.title}&quot; 회차를 삭제하시겠습니까?
              <br />
              삭제된 회차는 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => onDelete(chapter.id)}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>회차 제목 수정</DialogTitle>
              <DialogDescription>
                회차의 제목을 수정합니다.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="grid gap-2">
                <Label htmlFor="chapter-title">제목</Label>
                <Input
                  id="chapter-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  disabled={isUpdating}
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowEditDialog(false)}
                disabled={isUpdating}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isUpdating || !editTitle.trim() || editTitle.trim() === chapter.title}
              >
                저장
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
