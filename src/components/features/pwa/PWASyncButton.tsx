"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Cloud, CloudOff, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSyncEngine } from "@/hooks/useSyncEngine";
import { useAuth } from "@/components/providers/AuthProvider";

/**
 * PWA 환경 전용 수동 동기화 버튼
 *
 * - 로컬 환경(PWA)에서만 표시
 * - 수동으로 동기화 트리거
 * - 비회원은 동기화 시 로그인 페이지로 이동
 */
export function PWASyncButton() {
  const router = useRouter();
  const { auth } = useAuth();
  const { status, isOnline, pendingCount, lastError, isPwaMode, syncNow } =
    useSyncEngine();
  const [isSyncing, setIsSyncing] = useState(false);

  // 로컬 환경(PWA)에서만 표시
  if (!isPwaMode) return null;

  const isAuthenticated = auth.status === "authenticated";
  const isSyncInProgress = status === "syncing" || isSyncing;
  const hasError = status === "error";

  const handleSync = async () => {
    // 비회원이면 로그인 페이지로 이동
    if (!isAuthenticated) {
      toast.info("동기화를 위해 로그인이 필요합니다", {
        action: {
          label: "로그인",
          onClick: () => router.push("/login"),
        },
      });
      router.push("/login");
      return;
    }

    // 오프라인이면 동기화 불가
    if (!isOnline) {
      toast.error("오프라인 상태에서는 동기화할 수 없습니다");
      return;
    }

    setIsSyncing(true);
    try {
      const result = await syncNow();
      if (result.success && result.synced > 0) {
        toast.success(`${result.synced}개 항목 동기화 완료`);
      } else if (result.failed > 0) {
        toast.error(`동기화 실패: ${result.failed}개 항목`);
      } else if (result.synced === 0 && pendingCount === 0) {
        toast.info("동기화할 항목이 없습니다");
      }
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("동기화 중 오류가 발생했습니다");
    } finally {
      setIsSyncing(false);
    }
  };

  // 오프라인 상태
  if (!isOnline) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              disabled
            >
              <CloudOff className="h-4 w-4" />
              <span className="sr-only">오프라인</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>오프라인 상태</p>
            <p className="text-xs text-muted-foreground">
              인터넷 연결 후 동기화 가능
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // 동기화 중
  if (isSyncInProgress) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
              <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
              <span className="sr-only">동기화 중</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>동기화 중...</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // 에러 상태
  if (hasError) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={handleSync}
            >
              <AlertCircle className="h-4 w-4" />
              <span className="sr-only">동기화 오류</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">동기화 오류</p>
            {lastError && (
              <p className="text-xs text-muted-foreground">{lastError}</p>
            )}
            <p className="text-xs mt-1">클릭하여 재시도</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // 정상 상태 (동기화 버튼 표시)
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 relative"
            onClick={handleSync}
          >
            <Cloud className="h-4 w-4" />
            {pendingCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                {pendingCount > 9 ? "9+" : pendingCount}
              </span>
            )}
            <span className="sr-only">동기화</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {!isAuthenticated ? (
            <>
              <p>동기화하려면 로그인 필요</p>
              <p className="text-xs text-muted-foreground">
                클릭하여 로그인 페이지로 이동
              </p>
            </>
          ) : pendingCount > 0 ? (
            <>
              <p>{pendingCount}개 항목 동기화 대기 중</p>
              <p className="text-xs text-muted-foreground">
                클릭하여 서버와 동기화
              </p>
            </>
          ) : (
            <>
              <p>서버와 동기화</p>
              <p className="text-xs text-muted-foreground">
                클릭하여 최신 데이터 가져오기
              </p>
            </>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
