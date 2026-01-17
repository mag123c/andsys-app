"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Feather, Loader2 } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { auth } = useAuth();

  const isLoading = auth.status === "loading";
  const isAuthenticated = auth.status === "authenticated";

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/novels");
    }
  }, [isLoading, isAuthenticated, router]);

  // 로딩 중이거나 로그인 상태면 로딩 표시
  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-paper">
            <Feather className="h-6 w-6 text-primary-foreground" />
          </div>
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary transition-shadow group-hover:shadow-md">
              <Feather className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <span className="font-serif text-lg font-medium tracking-tight">4ndSYS</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Card Container */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-paper">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-4 bg-background">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <Link href="/novels">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              게스트로 시작하기
            </Button>
          </Link>
        </div>
      </footer>
    </div>
  );
}
