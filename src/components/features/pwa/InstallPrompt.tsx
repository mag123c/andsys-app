"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { isPromptDismissed, setPromptDismissed } from "@/lib/pwa-storage";

export function InstallPrompt() {
  const { canInstall, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // 24시간 만료 정책으로 dismiss 상태 확인
    if (isPromptDismissed()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 초기화 시 1회성 실행
      setDismissed(true);
    }
    setInitialized(true);
  }, []);

  const handleInstall = async () => {
    await install();
  };

  const handleDismiss = () => {
    setDismissed(true);
    setPromptDismissed(); // 24시간 타임스탬프 저장
  };

  if (!initialized || !canInstall || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-card text-card-foreground border border-border rounded-lg shadow-paper-lg p-4 z-50">
      <div className="flex items-start gap-3">
        <Download className="h-5 w-5 mt-0.5 text-accent" />
        <div className="flex-1">
          <p className="font-sans text-sm font-medium">앱으로 설치하기</p>
          <p className="font-sans text-sm text-muted-foreground mt-1">
            홈 화면에 추가하여 더 빠르게 접속하세요
          </p>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={handleInstall}>
              설치
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss}>
              오늘 하루 보지 않기
            </Button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
