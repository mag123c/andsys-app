"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, MoreVertical, Trash2, GripVertical } from "lucide-react";
import type { Chapter } from "@/repositories/types";
import { formatWordCount, formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

interface ChapterCardProps {
  chapter: Chapter;
  projectId: string;
  onDelete: (id: string) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function ChapterCard({
  chapter,
  projectId,
  onDelete,
  dragHandleProps,
}: ChapterCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
          href={`/projects/${projectId}/chapters/${chapter.id}`}
          className="flex flex-1 items-center gap-3 min-w-0"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-secondary">
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate group-hover:text-primary transition-colors">
              {chapter.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatWordCount(chapter.wordCount)}</span>
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
            <AlertDialogTitle>챕터 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{chapter.title}&quot; 챕터를 삭제하시겠습니까?
              <br />
              삭제된 챕터는 복구할 수 없습니다.
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
    </>
  );
}
