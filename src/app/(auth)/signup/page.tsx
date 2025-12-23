import type { Metadata } from "next";
import { SignupForm } from "@/components/features/auth";

export const metadata: Metadata = {
  title: "회원가입 - Andsys",
  description: "Andsys에 가입하세요",
};

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">회원가입</h1>
        <p className="text-muted-foreground">
          무료로 가입하고 클라우드 동기화를 시작하세요
        </p>
      </div>

      <SignupForm />
    </div>
  );
}
