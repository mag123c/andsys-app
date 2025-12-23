import type { Metadata } from "next";
import { LoginForm } from "@/components/features/auth";

export const metadata: Metadata = {
  title: "로그인 - Andsys",
  description: "Andsys에 로그인하세요",
};

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">로그인</h1>
        <p className="text-muted-foreground">
          계정에 로그인하여 글쓰기를 시작하세요
        </p>
      </div>

      <LoginForm />
    </div>
  );
}
