"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

const STORAGE_KEY = "pwa-prompt-dismissed";

export function InstallPrompt() {
  const { canInstall, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // localStorage 확인 (시크릿 모드 등에서 실패 가능)
    try {
      if (localStorage.getItem(STORAGE_KEY)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- 초기화 시 1회성 실행
        setDismissed(true);
      }
    } catch {
      // localStorage 접근 불가 시 무시
    }
    setInitialized(true);
  }, []);

  const handleInstall = async () => {
    await install();
  };

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // localStorage 접근 불가 시 무시 (세션 동안만 dismissed 유지)
    }
  };

  if (!initialized || !canInstall || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-background border rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start gap-3">
        <Download className="h-5 w-5 mt-0.5 text-primary" />
        <div className="flex-1">
          <p className="font-medium">앱으로 설치하기</p>
          <p className="text-sm text-muted-foreground">
            홈 화면에 추가하여 더 빠르게 접속하세요
          </p>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={handleInstall}>
              설치
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss}>
              나중에
            </Button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
