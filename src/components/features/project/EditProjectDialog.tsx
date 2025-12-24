"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Project, UpdateProjectInput } from "@/repositories/types";
import { processCoverImage } from "@/lib/image-utils";
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
import { CoverImageUpload } from "./CoverImageUpload";

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
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(
    project.coverImageUrl
  );

  // 다이얼로그가 열릴 때 현재 소설 값으로 초기화
  useEffect(() => {
    if (open) {
      setTitle(project.title);
      setDescription(project.description ?? "");
      setGenre(project.genre ?? "");
      setCoverImageUrl(project.coverImageUrl);
    }
  }, [open, project]);

  const handleCoverUpload = async (file: File) => {
    try {
      const base64 = await processCoverImage(file);
      setCoverImageUrl(base64);
    } catch {
      toast.error("이미지 처리에 실패했습니다.");
    }
  };

  const handleCoverRemove = async () => {
    setCoverImageUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    setIsLoading(true);
    try {
      await onUpdate({
        title: title.trim(),
        description: description.trim() || null,
        genre: genre.trim() || null,
        coverImageUrl,
      });
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges =
    title.trim() !== project.title ||
    (description.trim() || null) !== project.description ||
    (genre.trim() || null) !== project.genre ||
    coverImageUrl !== project.coverImageUrl;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>소설 설정</DialogTitle>
            <DialogDescription>
              소설 정보를 수정합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex gap-4">
              <div className="shrink-0">
                <Label className="text-sm mb-2 block">표지</Label>
                <CoverImageUpload
                  imageUrl={coverImageUrl}
                  onUpload={handleCoverUpload}
                  onRemove={handleCoverRemove}
                  disabled={isLoading}
                />
              </div>
              <div className="flex-1 space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-title">제목 *</Label>
                  <Input
                    id="edit-title"
                    placeholder="소설 제목을 입력하세요"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isLoading}
                    autoFocus
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
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">설명</Label>
              <Input
                id="edit-description"
                placeholder="소설 설명 (선택)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
