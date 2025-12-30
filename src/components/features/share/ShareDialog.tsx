"use client";

import { useState } from "react";
import { Link2, Copy, Check, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { EXPIRATION_OPTIONS } from "@/lib/share";
import type { ShareExpiration } from "@/repositories/types";
import type { Chapter, Project } from "@/repositories/types";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  chapter: Chapter;
}

export function ShareDialog({
  open,
  onOpenChange,
  project,
  chapter,
}: ShareDialogProps) {
  const [expiresIn, setExpiresIn] = useState<ShareExpiration>("24h");
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (usePassword && password.length < 4) {
      toast.error("비밀번호는 최소 4자 이상이어야 합니다");
      return;
    }

    setIsLoading(true);

    try {
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

  const handleCopy = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
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
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            회차 공유
          </DialogTitle>
          <DialogDescription>
            이 회차를 다른 사람과 공유합니다.
            <br />
            링크를 받은 사람은 내용을 볼 수 있지만 편집할 수 없습니다.
          </DialogDescription>
        </DialogHeader>

        {!shareUrl ? (
          <div className="space-y-4 py-4">
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

            <Button
              onClick={handleCreate}
              disabled={isLoading}
              className="w-full"
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
        ) : (
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
                onClick={handleCopy}
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
              <Button variant="outline" onClick={handleCopy} className="flex-1">
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
  );
}
