"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import type { Project, UpdateProjectInput } from "@/repositories/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditProjectDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (data: UpdateProjectInput) => Promise<void>;
}

export function EditProjectDialog({
  project,
  open,
  onOpenChange,
  onUpdate,
}: EditProjectDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description ?? "");
  const [genre, setGenre] = useState(project.genre ?? "");

  // 다이얼로그가 열릴 때 현재 프로젝트 값으로 초기화
  useEffect(() => {
    if (open) {
      setTitle(project.title);
      setDescription(project.description ?? "");
      setGenre(project.genre ?? "");
    }
  }, [open, project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    setIsLoading(true);
    try {
      await onUpdate({
        title: title.trim(),
        description: description.trim() || null,
        genre: genre.trim() || null,
      });
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges =
    title.trim() !== project.title ||
    (description.trim() || null) !== project.description ||
    (genre.trim() || null) !== project.genre;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>프로젝트 설정</DialogTitle>
            <DialogDescription>
              프로젝트 정보를 수정합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">제목 *</Label>
              <Input
                id="edit-title"
                placeholder="프로젝트 제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">설명</Label>
              <Input
                id="edit-description"
                placeholder="프로젝트 설명 (선택)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-genre">장르</Label>
              <Input
                id="edit-genre"
                placeholder="예: 판타지, 로맨스, SF (선택)"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !title.trim() || !hasChanges}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              저장
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
