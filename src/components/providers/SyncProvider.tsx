"use client";

import { useSyncEngine } from "@/hooks/useSyncEngine";

interface SyncProviderProps {
  children: React.ReactNode;
}

/**
 * 동기화 엔진 Provider
 * - 온라인 복귀 시 자동 동기화
 * - 로그인 시 서버 데이터 pull
 * - AuthProvider 하위에 위치해야 함
 */
export function SyncProvider({ children }: SyncProviderProps) {
  // 훅을 마운트하여 동기화 이벤트 구독 활성화
  useSyncEngine();

  return <>{children}</>;
}
