"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/storage/local/db";
import { deleteAccount } from "@/app/(dashboard)/settings/actions";

const CONFIRM_TEXT = "회원탈퇴";

export function DeleteAccountDialog() {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const isConfirmed = confirmText === CONFIRM_TEXT;

  const handleDelete = async () => {
    if (!isConfirmed) return;

    setIsDeleting(true);
    try {
      // 서버에서 계정 삭제
      const result = await deleteAccount();

      if (!result.success) {
        toast.error(result.error || "계정 삭제에 실패했습니다.");
        return;
      }

      // 로컬 IndexedDB 데이터 삭제
      await db.delete();

      toast.success("계정이 삭제되었습니다.");
      // 전체 페이지 리로드로 DB 인스턴스 재생성
      window.location.href = "/";
    } catch {
      toast.error("계정 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
      setOpen(false);
      setConfirmText("");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isDeleting) {
      setOpen(newOpen);
      if (!newOpen) {
        setConfirmText("");
      }
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-1.5 h-4 w-4" />
          회원 탈퇴
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>정말 탈퇴하시겠습니까?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span className="block">
              계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
            </span>
            <span className="block text-destructive font-medium">
              삭제되는 데이터: 프로필, 소설, 회차, 시놉시스, 캐릭터, 관계도
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <Label htmlFor="confirm-text" className="text-sm text-muted-foreground">
            확인을 위해 <span className="font-bold text-foreground">{CONFIRM_TEXT}</span>를 입력해주세요
          </Label>
          <Input
            id="confirm-text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={CONFIRM_TEXT}
            className="mt-2"
            disabled={isDeleting}
            autoComplete="off"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                삭제 중...
              </>
            ) : (
              "탈퇴하기"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
