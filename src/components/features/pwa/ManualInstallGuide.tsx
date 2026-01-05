"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Share, MoreVertical, PlusSquare } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { isPromptDismissed, setPromptDismissed } from "@/lib/pwa-storage";

export function ManualInstallGuide() {
  const { needsManualGuide, isIOSSafari, isMacOSSafari, isFirefox, isPwaMode } =
    usePWAInstall();
  const [open, setOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // PWA 모드면 표시 불필요
    if (isPwaMode) return;
    // 수동 안내 필요 없으면 표시 불필요
    if (!needsManualGuide) return;
    // 이미 dismiss된 상태면 표시 불필요
    if (isPromptDismissed()) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 시 1회성 초기화
    setOpen(true);
    setInitialized(true);
  }, [needsManualGuide, isPwaMode]);

  const handleDismiss = () => {
    setOpen(false);
    setPromptDismissed(); // 24시간 타임스탬프 저장
  };

  if (!initialized || !needsManualGuide) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>앱으로 설치하기</DialogTitle>
          <DialogDescription>
            홈 화면에 추가하여 더 빠르게 접속하세요
          </DialogDescription>
        </DialogHeader>

        {isIOSSafari && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Share className="h-6 w-6 text-primary shrink-0" />
              <div>
                <p className="font-medium">1. 공유 버튼 탭</p>
                <p className="text-sm text-muted-foreground">
                  화면 하단의 공유 아이콘을 탭하세요
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <PlusSquare className="h-6 w-6 text-primary shrink-0" />
              <div>
                <p className="font-medium">2. 홈 화면에 추가</p>
                <p className="text-sm text-muted-foreground">
                  &quot;홈 화면에 추가&quot;를 선택하세요
                </p>
              </div>
            </div>
          </div>
        )}

        {isMacOSSafari && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              macOS Safari에서는 PWA 설치가 지원되지 않습니다. Chrome 또는
              Edge에서 접속해주세요.
            </p>
          </div>
        )}

        {isFirefox && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <MoreVertical className="h-6 w-6 text-primary shrink-0" />
              <div>
                <p className="font-medium">1. 브라우저 메뉴 열기</p>
                <p className="text-sm text-muted-foreground">
                  주소창 옆 메뉴 아이콘을 클릭하세요
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <PlusSquare className="h-6 w-6 text-primary shrink-0" />
              <div>
                <p className="font-medium">2. 바로가기 추가</p>
                <p className="text-sm text-muted-foreground">
                  &quot;바로가기 만들기&quot;를 선택하세요
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              * Chrome 또는 Edge에서 접속하시면 더 나은 앱 경험을 제공받을 수
              있습니다.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" onClick={handleDismiss}>
            오늘 하루 보지 않기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
