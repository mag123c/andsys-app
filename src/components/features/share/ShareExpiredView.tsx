"use client";

import { Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ShareExpiredView() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="flex flex-col items-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Clock className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold">링크 만료</h1>
          <p className="text-sm text-muted-foreground">
            이 공유 링크는 만료되었거나 삭제되었습니다.
          </p>
          <p className="text-sm text-muted-foreground">
            작성자에게 새 링크를 요청하세요.
          </p>
        </div>

        <div className="border-t pt-6">
          <p className="text-sm text-muted-foreground mb-3">
            4ndSYS - 웹소설 작가를 위한 무료 글쓰기 플랫폼
          </p>
          <Link href="/">
            <Button>4ndSYS 시작하기</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
