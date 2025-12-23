"use client";

import { useEffect, useCallback, useSyncExternalStore } from "react";
import { syncEngine, type SyncStatus } from "@/sync/sync-engine";
import { useOnline } from "./useOnline";
import { useAuth } from "@/components/providers/AuthProvider";

interface UseSyncEngineReturn {
  status: SyncStatus;
  isOnline: boolean;
  syncNow: () => Promise<void>;
}

/**
 * 동기화 엔진 훅
 * - 온라인 복귀 시 자동 동기화
 * - 회원만 동기화 (게스트는 로컬만)
 */
export function useSyncEngine(): UseSyncEngineReturn {
  const isOnline = useOnline();
  const { auth } = useAuth();

  // syncEngine 상태 구독
  const status = useSyncExternalStore(
    (callback) => syncEngine.subscribe(callback),
    () => syncEngine.status,
    () => "idle" as SyncStatus
  );

  // 수동 동기화
  const syncNow = useCallback(async () => {
    if (!isOnline) return;
    if (auth.status !== "authenticated") return;

    await syncEngine.syncAll();
  }, [isOnline, auth.status]);

  // 온라인 복귀 시 자동 동기화
  useEffect(() => {
    if (!isOnline) return;
    if (auth.status !== "authenticated") return;

    // 약간의 딜레이 후 동기화 (네트워크 안정화 대기)
    const timer = setTimeout(() => {
      syncEngine.syncAll().catch(console.error);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isOnline, auth.status]);

  // 로그인 시 서버 데이터 pull
  const userId = auth.status === "authenticated" ? auth.user.id : null;
  useEffect(() => {
    if (!userId) return;
    if (!isOnline) return;

    syncEngine.pullFromServer(userId).catch(console.error);
  }, [userId, isOnline]);

  return {
    status,
    isOnline,
    syncNow,
  };
}
