import type { Metadata } from "next";
import Link from "next/link";
import { SocialLoginButtons } from "@/components/features/auth";

export const metadata: Metadata = {
  title: "로그인 - 4ndSYS",
  description: "4ndSYS에 로그인하세요",
};

interface LoginPageProps {
  searchParams: Promise<{ error?: string; message?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, message } = await searchParams;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="font-serif text-2xl font-medium tracking-tight">
          로그인
        </h1>
        <p className="font-sans text-sm text-muted-foreground">
          계정에 로그인하여 글쓰기를 시작하세요
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-center space-y-1">
          <p className="font-sans text-sm text-destructive">
            로그인 중 오류가 발생했습니다. 다시 시도해주세요.
          </p>
          {message && (
            <p className="font-sans text-xs text-destructive/70">{message}</p>
          )}
        </div>
      )}

      {/* Social Login Buttons */}
      <SocialLoginButtons />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-card px-2 text-muted-foreground">또는</span>
        </div>
      </div>

      {/* Sign Up Link */}
      <p className="text-center font-sans text-sm text-muted-foreground">
        계정이 없으신가요?{" "}
        <Link
          href="/signup"
          className="text-accent font-medium hover:text-foreground transition-colors"
        >
          회원가입
        </Link>
      </p>

      {/* Terms */}
      <p className="text-center font-sans text-xs text-muted-foreground/80 leading-relaxed">
        계속 진행하면{" "}
        <Link href="/terms" className="text-accent hover:underline">
          이용약관
        </Link>
        {" "}및{" "}
        <Link href="/privacy" className="text-accent hover:underline">
          개인정보처리방침
        </Link>
        에 동의하는 것으로 간주됩니다.
      </p>
    </div>
  );
}
