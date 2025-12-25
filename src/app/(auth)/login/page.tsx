import type { Metadata } from "next";
import Link from "next/link";
import { SocialLoginButtons } from "@/components/features/auth";

export const metadata: Metadata = {
  title: "로그인 - Andsys",
  description: "Andsys에 로그인하세요",
};

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">로그인</h1>
        <p className="text-muted-foreground">
          계정에 로그인하여 글쓰기를 시작하세요
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">
          로그인 중 오류가 발생했습니다. 다시 시도해주세요.
        </div>
      )}

      <SocialLoginButtons />

      <p className="text-center text-sm text-muted-foreground">
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
