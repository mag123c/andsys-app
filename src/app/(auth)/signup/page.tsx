import type { Metadata } from "next";
import Link from "next/link";
import { SocialLoginButtons } from "@/components/features/auth";
import { Cloud, Shield, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "회원가입 - 4ndSYS",
  description: "4ndSYS에 가입하세요",
};

const benefits = [
  { icon: Cloud, text: "클라우드 자동 백업" },
  { icon: Zap, text: "모든 기기에서 동기화" },
  { icon: Shield, text: "데이터 안전하게 보호" },
];

export default function SignupPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="font-serif text-2xl font-medium tracking-tight">
          회원가입
        </h1>
        <p className="font-sans text-sm text-muted-foreground">
          무료로 가입하고 클라우드 동기화를 시작하세요
        </p>
      </div>

      {/* Benefits */}
      <div className="flex justify-center gap-4">
        {benefits.map((benefit) => (
          <div
            key={benefit.text}
            className="flex flex-col items-center gap-1.5 text-center"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
              <benefit.icon className="h-4 w-4 text-accent" />
            </div>
            <span className="font-sans text-[10px] text-muted-foreground leading-tight max-w-[60px]">
              {benefit.text}
            </span>
          </div>
        ))}
      </div>

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

      {/* Login Link */}
      <p className="text-center font-sans text-sm text-muted-foreground">
        이미 계정이 있으신가요?{" "}
        <Link
          href="/login"
          className="text-accent font-medium hover:text-foreground transition-colors"
        >
          로그인
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
