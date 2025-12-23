import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/features/auth";

export const metadata: Metadata = {
  title: "비밀번호 재설정 - Andsys",
  description: "새 비밀번호를 설정하세요",
};

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">비밀번호 재설정</h1>
        <p className="text-muted-foreground">
          새로운 비밀번호를 입력해주세요
        </p>
      </div>

      <ResetPasswordForm />
    </div>
  );
}
