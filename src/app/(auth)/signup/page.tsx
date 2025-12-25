import type { Metadata } from "next";
import Link from "next/link";
import { SocialLoginButtons } from "@/components/features/auth";

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

      <SocialLoginButtons />

      <p className="text-center text-sm text-muted-foreground">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-primary hover:underline">
          로그인
        </Link>
      </p>

      <p className="text-center text-xs text-muted-foreground">
        계속 진행하면{" "}
        <Link href="/terms" className="text-primary hover:underline">
          이용약관
        </Link>
        {" "}및{" "}
        <Link href="/privacy" className="text-primary hover:underline">
          개인정보처리방침
        </Link>
        에 동의하는 것으로 간주됩니다.
      </p>
    </div>
  );
}
