"use client";

import { useState } from "react";
import { Link2, Copy, Check, Loader2, Lock, Eye, Clock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EXPIRATION_OPTIONS, formatTimeRemaining } from "@/lib/share";
import type { ShareExpiration, SharedChapterListItem } from "@/repositories/types";
import type { Chapter, Project } from "@/repositories/types";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  chapter: Chapter;
  activeShare?: SharedChapterListItem | null;
  onShareDeleted?: () => void;
}

type ViewMode = "manage" | "create" | "result";

export function ShareDialog({
  open,
  onOpenChange,
  project,
  chapter,
  activeShare,
  onShareDeleted,
}: ShareDialogProps) {
  const [expiresIn, setExpiresIn] = useState<ShareExpiration>("24h");
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("manage");

  // 실제 표시할 모드 결정
  const currentMode: ViewMode = shareUrl
    ? "result"
    : viewMode === "create" || !activeShare
      ? "create"
      : "manage";

  const handleCreate = async () => {
    if (usePassword && password.length < 4) {
      toast.error("비밀번호는 최소 4자 이상이어야 합니다");
      return;
    }

    setIsLoading(true);

    try {
      // 기존 공유가 있으면 먼저 삭제
      if (activeShare) {
        await fetch(`/api/share/chapters/${activeShare.id}`, {
          method: "DELETE",
        });
      }

      const response = await fetch("/api/share/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterId: chapter.id,
          expiresIn,
          password: usePassword ? password : undefined,
          projectId: project.id,
          projectTitle: project.title,
          chapterTitle: chapter.title,
          chapterNumber: chapter.order + 1,
          content: chapter.content,
          characterCount: chapter.wordCount,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setShareUrl(result.data.shareUrl);
        await navigator.clipboard.writeText(result.data.shareUrl);
        setCopied(true);
        toast.success("링크가 생성되어 클립보드에 복사되었습니다");
      } else {
        toast.error("링크 생성에 실패했습니다");
      }
    } catch {
      toast.error("링크 생성 중 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!activeShare) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/share/chapters/${activeShare.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("링크가 비활성화되었습니다");
        onShareDeleted?.();
        handleClose();
      } else {
        toast.error("링크 비활성화에 실패했습니다");
      }
    } catch {
      toast.error("링크 비활성화 중 오류가 발생했습니다");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("클립보드에 복사되었습니다");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("복사에 실패했습니다");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // 상태 초기화
    setTimeout(() => {
      setShareUrl(null);
      setCopied(false);
      setExpiresIn("24h");
      setUsePassword(false);
      setPassword("");
      setViewMode("manage");
    }, 200);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              미리보기 링크
            </DialogTitle>
            <DialogDescription>
              {currentMode === "manage"
                ? "이 회차의 미리보기 링크가 활성화되어 있습니다."
                : "베타리더나 편집자에게 이 회차만 보여줄 수 있어요."}
              <br />
              {currentMode === "manage"
                ? "링크를 복사하거나 관리할 수 있습니다."
                : "링크를 받은 사람은 내용을 볼 수 있지만 편집할 수 없습니다."}
            </DialogDescription>
          </DialogHeader>

          {/* 관리 모드: 기존 공유 링크 표시 */}
          {currentMode === "manage" && activeShare && (
            <div className="space-y-4 py-4">
              {/* URL */}
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <Input
                  value={activeShare.shareUrl}
                  readOnly
                  className="bg-transparent border-0 p-0 h-auto focus-visible:ring-0 text-sm"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(activeShare.shareUrl)}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* 상태 정보 */}
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    {activeShare.expiresAt
                      ? formatTimeRemaining(activeShare.expiresAt)
                      : "만료 없음"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>조회수: {activeShare.viewCount}회</span>
                </div>
                {activeShare.hasPassword && (
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    <span>비밀번호 설정됨</span>
                  </div>
                )}
              </div>

              {/* 액션 버튼 */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex-1"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  링크 비활성화
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setViewMode("create")}
                  className="flex-1"
                >
                  새 링크 생성
                </Button>
              </div>
            </div>
          )}

          {/* 생성 모드: 새 공유 링크 생성 폼 */}
          {currentMode === "create" && (
            <div className="space-y-4 py-4">
              {activeShare && (
                <p className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400 p-3 rounded-md">
                  새 링크를 생성하면 기존 링크는 자동으로 비활성화됩니다.
                </p>
              )}

              <div className="space-y-2">
                <Label htmlFor="expires">만료 시간</Label>
                <Select
                  value={expiresIn}
                  onValueChange={(v) => setExpiresIn(v as ShareExpiration)}
                >
                  <SelectTrigger id="expires">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPIRATION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="usePassword"
                    checked={usePassword}
                    onCheckedChange={(checked) => setUsePassword(!!checked)}
                  />
                  <Label
                    htmlFor="usePassword"
                    className="text-sm font-normal cursor-pointer"
                  >
                    비밀번호로 보호
                  </Label>
                </div>

                {usePassword && (
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="비밀번호 (4~20자)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      maxLength={20}
                      className="pl-9"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {activeShare && (
                  <Button
                    variant="outline"
                    onClick={() => setViewMode("manage")}
                    className="flex-1"
                  >
                    취소
                  </Button>
                )}
                <Button
                  onClick={handleCreate}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      생성 중...
                    </>
                  ) : (
                    "링크 생성하기"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* 결과 모드: 생성된 링크 표시 */}
          {currentMode === "result" && shareUrl && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <Input
                  value={shareUrl}
                  readOnly
                  className="bg-transparent border-0 p-0 h-auto focus-visible:ring-0"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(shareUrl)}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                {expiresIn === "never"
                  ? "이 링크는 만료되지 않습니다."
                  : `${EXPIRATION_OPTIONS.find((o) => o.value === expiresIn)?.label} 후 자동으로 만료됩니다.`}
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleCopy(shareUrl)}
                  className="flex-1"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  링크 복사
                </Button>
                <Button onClick={handleClose} className="flex-1">
                  완료
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>링크를 비활성화하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              링크가 비활성화되어 더 이상 접근할 수 없게 됩니다.
              <br />
              이미 링크를 받은 사람도 내용을 볼 수 없게 됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  비활성화 중...
                </>
              ) : (
                "링크 비활성화"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
