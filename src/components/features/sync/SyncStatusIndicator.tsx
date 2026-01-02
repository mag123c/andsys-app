"use client";

import { useEffect, useRef } from "react";
import { Cloud, CloudOff, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useSyncEngine } from "@/hooks/useSyncEngine";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

/**
 * 동기화 상태 인디케이터 (클라우드 환경 전용)
 *
 * - 클라우드 환경(브라우저)에서만 표시
 * - 로컬 환경(PWA)에서는 PWASyncButton 사용
 *
 * 상태:
 * - 동기화 중: 회전 아이콘
 * - pending 있음: 클라우드 + 숫자 뱃지
 * - 에러: 빨간색 경고
 * - 오프라인: 연결 끊김 아이콘
 * - 정상: 표시 안함
 */
export function SyncStatusIndicator() {
  const { auth } = useAuth();
  const { status, isOnline, pendingCount, lastError, isPwaMode, syncNow } = useSyncEngine();
  const prevStatusRef = useRef(status);
  const prevPendingRef = useRef(pendingCount);
  const isAuthenticated = auth.status === "authenticated";

  // 상태 변화에 따른 토스트 알림 (Hook은 조건부 return 전에 호출)
  useEffect(() => {
    if (!isAuthenticated) return;

    // 동기화 완료 시 (syncing → idle, pending 감소)
    if (
      prevStatusRef.current === "syncing" &&
      status === "idle" &&
      prevPendingRef.current > 0 &&
      pendingCount === 0
    ) {
      toast.success("동기화 완료", {
        description: "모든 변경사항이 저장되었습니다",
        duration: 2000,
      });
    }

    // 에러 발생 시
    if (status === "error" && lastError && prevStatusRef.current !== "error") {
      toast.error("동기화 실패", {
        description: lastError,
        action: {
          label: "재시도",
          onClick: () => syncNow(),
        },
      });
    }

    prevStatusRef.current = status;
    prevPendingRef.current = pendingCount;
  }, [isAuthenticated, status, pendingCount, lastError, syncNow]);

  // 로컬 환경(PWA)에서는 PWASyncButton 사용
  if (isPwaMode) {
    return null;
  }

  // 게스트는 동기화 표시 안함
  if (!isAuthenticated) {
    return null;
  }

  // 오프라인
  if (!isOnline) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center text-muted-foreground">
              <CloudOff className="h-4 w-4" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>오프라인 - 변경사항은 로컬에 저장됩니다</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // 동기화 중
  if (status === "syncing") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center text-blue-500">
              <RefreshCw className="h-4 w-4 animate-spin" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>동기화 중...</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // 에러
  if (status === "error") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => syncNow()}
            >
              <AlertCircle className="h-4 w-4" />
              <span className="sr-only">동기화 오류</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">동기화 오류</p>
            <p className="text-xs text-muted-foreground">{lastError}</p>
            <p className="text-xs mt-1">클릭하여 재시도</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // pending 있음
  if (pendingCount > 0) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 relative"
              onClick={() => syncNow()}
            >
              <Cloud className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                {pendingCount > 9 ? "9+" : pendingCount}
              </span>
              <span className="sr-only">동기화 대기 중</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{pendingCount}개 항목 동기화 대기 중</p>
            <p className="text-xs text-muted-foreground">클릭하여 지금 동기화</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // 정상 상태 - 표시 안함
  return null;
}
