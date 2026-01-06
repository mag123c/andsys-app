"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { MoreVertical, Trash2, GripVertical, Pencil, AlertTriangle } from "lucide-react";
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

interface UpdateOrderResult {
  swapped: boolean;
  swappedWithChapter?: {
    id: string;
    title: string;
    previousOrder: number;
  };
}

interface ChapterCardProps {
  chapter: Chapter;
  projectId: string;
  chapters: Chapter[];
  onDelete: (id: string) => void;
  onUpdate?: (data: UpdateChapterInput) => Promise<void>;
  onUpdateOrder?: (newOrder: number) => Promise<UpdateOrderResult>;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function ChapterCard({
  chapter,
  projectId,
  chapters,
  onDelete,
  onUpdate,
  onUpdateOrder,
  dragHandleProps,
}: ChapterCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editTitle, setEditTitle] = useState(chapter.title);
  const [editOrder, setEditOrder] = useState(chapter.order);
  const [isUpdating, setIsUpdating] = useState(false);

  // 다이얼로그 열릴 때 현재 값으로 초기화
  useEffect(() => {
    if (showEditDialog) {
      setEditTitle(chapter.title);
      setEditOrder(chapter.order);
    }
  }, [showEditDialog, chapter.title, chapter.order]);

  // 충돌하는 챕터 찾기
  const conflictChapter = useMemo(() => {
    if (editOrder === chapter.order) return null;
    return chapters.find((ch) => ch.id !== chapter.id && ch.order === editOrder);
  }, [chapters, chapter.id, chapter.order, editOrder]);

  const hasOrderChanged = editOrder !== chapter.order;
  const hasTitleChanged = editTitle.trim() !== chapter.title;
  const hasChanges = hasOrderChanged || hasTitleChanged;

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges) return;

    setIsUpdating(true);
    try {
      // 회차 번호 변경
      if (hasOrderChanged && onUpdateOrder) {
        await onUpdateOrder(editOrder);
      }

      // 제목 변경
      if (hasTitleChanged && onUpdate) {
        await onUpdate({ title: editTitle.trim() });
      }

      setShowEditDialog(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenEditDialog = () => {
    setEditTitle(chapter.title);
    setEditOrder(chapter.order);
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
            {(onUpdate || onUpdateOrder) && (
              <>
                <DropdownMenuItem onClick={handleOpenEditDialog}>
                  <Pencil className="mr-2 h-4 w-4" />
                  수정
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
              <DialogTitle>회차 수정</DialogTitle>
              <DialogDescription>
                회차의 번호와 제목을 수정합니다.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              {onUpdateOrder && (
                <div className="grid gap-2">
                  <Label htmlFor="chapter-order">회차 번호</Label>
                  <Input
                    id="chapter-order"
                    type="number"
                    min={1}
                    value={editOrder}
                    onChange={(e) => setEditOrder(Math.max(1, parseInt(e.target.value) || 1))}
                    disabled={isUpdating}
                  />
                  {conflictChapter && (
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>
                        {conflictChapter.order}화 &quot;{conflictChapter.title}&quot;와 위치가 교환됩니다
                      </span>
                    </div>
                  )}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="chapter-title">제목</Label>
                <Input
                  id="chapter-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  disabled={isUpdating}
                  autoFocus={!onUpdateOrder}
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
                disabled={isUpdating || !editTitle.trim() || !hasChanges}
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
