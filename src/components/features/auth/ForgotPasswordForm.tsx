"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/providers/AuthProvider";
import { toast } from "sonner";

export function ForgotPasswordForm() {
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email) {
      toast.error("이메일을 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPassword(email);

      if (!result.success) {
        toast.error(result.error || "이메일 발송에 실패했습니다.");
        return;
      }

      setEmailSent(true);
      toast.success("비밀번호 재설정 이메일을 발송했습니다.");
    } catch {
      toast.error("오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  if (emailSent) {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-lg bg-muted p-4">
          <p className="text-sm">
            <strong>{email}</strong>로 비밀번호 재설정 링크를 발송했습니다.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            이메일이 도착하지 않으면 스팸 폴더를 확인해주세요.
          </p>
        </div>

        <Link href="/login">
          <Button variant="outline" className="w-full">
            로그인으로 돌아가기
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          autoComplete="email"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "발송 중..." : "재설정 이메일 받기"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline">
          로그인으로 돌아가기
        </Link>
      </p>
    </form>
  );
}
