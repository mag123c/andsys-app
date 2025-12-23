import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/features/auth";

export const metadata: Metadata = {
  title: "비밀번호 찾기 - Andsys",
  description: "비밀번호 재설정 이메일을 받으세요",
};

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">비밀번호 찾기</h1>
        <p className="text-muted-foreground">
          가입한 이메일 주소를 입력하시면
          <br />
          비밀번호 재설정 링크를 보내드립니다
        </p>
      </div>

      <ForgotPasswordForm />
    </div>
  );
}
