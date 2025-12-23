"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 에러 로깅 (프로덕션에서는 에러 추적 서비스로 전송)
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">문제가 발생했습니다</h1>
          <p className="mt-2 text-muted-foreground">
            페이지를 불러오는 중 오류가 발생했습니다.
            <br />
            잠시 후 다시 시도해주세요.
          </p>
        </div>
      </div>
      <Button onClick={reset} variant="outline">
        <RotateCcw className="mr-2 h-4 w-4" />
        다시 시도
      </Button>
    </main>
  );
}
