"use client";

import { useEffect, useCallback, useSyncExternalStore, useRef } from "react";
import { liveQuery } from "dexie";
import { toast } from "sonner";
import { syncEngine, type SyncStatus, type SyncResult, type SyncEventPayload } from "@/sync/sync-engine";
import { useRealOnline } from "./useOnline";
import { useAuth } from "@/components/providers/AuthProvider";
import { usePWAMode } from "./usePWAMode";
import { createClient } from "@/storage/remote/client";
import { db } from "@/storage/local/db";
import type { RealtimeChannel } from "@supabase/supabase-js";

const SYNC_DEBOUNCE_MS = 2000; // 2초 debounce

/**
 * 동기화 실행 및 에러 피드백
 */
async function syncWithFeedback(): Promise<void> {
  try {
    const result = await syncEngine.syncAll();
    if (result.failed > 0) {
      toast.error(`동기화 실패: ${result.failed}개 항목`);
    }
  } catch (error) {
    toast.error("동기화 중 오류가 발생했습니다");
    console.error("Sync error:", error);
  }
}

interface UseSyncEngineReturn {
  status: SyncStatus;
  isOnline: boolean;
  pendingCount: number;
  lastError: string | null;
  isPwaMode: boolean;
  syncNow: () => Promise<SyncResult>;
}

/**
 * 동기화 엔진 훅
 *
 * 환경별 동기화 정책:
 * - 로컬 환경 (PWA): 수동 동기화만 (버튼 클릭)
 * - 클라우드 환경 (브라우저): 자동 동기화 (회원만, debounce 2초)
 *
 * 공통:
 * - 회원만 동기화 (게스트는 로컬만)
 * - Supabase Realtime 구독으로 실시간 동기화
 */
export function useSyncEngine(): UseSyncEngineReturn {
  const { isOnline } = useRealOnline();
  const { auth } = useAuth();
  const isPwaMode = usePWAMode();
  const channelRef = useRef<RealtimeChannel | null>(null);

  // syncEngine 상태 구독
  const status = useSyncExternalStore(
    (callback) => syncEngine.subscribe(callback),
    () => syncEngine.status,
    () => "idle" as SyncStatus
  );

  const pendingCount = useSyncExternalStore(
    (callback) => syncEngine.subscribe(callback),
    () => syncEngine.pendingCount,
    () => 0
  );

  const lastError = useSyncExternalStore(
    (callback) => syncEngine.subscribe(callback),
    () => syncEngine.lastError,
    () => null
  );

  // 수동 동기화
  const syncNow = useCallback(async () => {
    if (!isOnline) {
      return { success: false, synced: 0, failed: 0, errors: ["오프라인 상태입니다"] };
    }
    if (auth.status !== "authenticated") {
      return { success: true, synced: 0, failed: 0, errors: [] };
    }

    return syncEngine.syncAll();
  }, [isOnline, auth.status]);

  // 온라인 복귀 시 자동 동기화 (클라우드 환경에서만)
  useEffect(() => {
    // 로컬 환경(PWA)에서는 자동 동기화 비활성화
    if (isPwaMode) return;
    if (!isOnline) return;
    if (auth.status !== "authenticated") return;

    // 약간의 딜레이 후 동기화 (네트워크 안정화 대기)
    const timer = setTimeout(() => {
      syncWithFeedback();
    }, 1000);

    return () => clearTimeout(timer);
  }, [isOnline, auth.status, isPwaMode]);

  // pending 항목 변경 감지 + debounce 자동 동기화 (클라우드 환경에서만)
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    // 로컬 환경(PWA)에서는 자동 동기화 비활성화
    if (isPwaMode) return;
    if (!isOnline) return;
    if (auth.status !== "authenticated") return;

    // IndexedDB pending 항목 변경 감지
    const subscription = liveQuery(async () => {
      const pendingProjects = await db.projects.where("syncStatus").equals("pending").count();
      const pendingChapters = await db.chapters.where("syncStatus").equals("pending").count();
      const pendingSynopses = await db.synopses.where("syncStatus").equals("pending").count();
      const pendingCharacters = await db.characters.where("syncStatus").equals("pending").count();
      const pendingRelationships = await db.relationships.where("syncStatus").equals("pending").count();
      return pendingProjects + pendingChapters + pendingSynopses + pendingCharacters + pendingRelationships;
    }).subscribe({
      next: (count) => {
        if (count > 0) {
          // 기존 타이머 취소 (debounce)
          if (syncTimerRef.current) {
            clearTimeout(syncTimerRef.current);
          }
          // debounce 후 동기화
          syncTimerRef.current = setTimeout(() => {
            syncWithFeedback();
            syncTimerRef.current = null;
          }, SYNC_DEBOUNCE_MS);
        }
      },
      error: (err) => console.error("Pending watch error:", err),
    });

    return () => {
      subscription.unsubscribe();
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }
    };
  }, [isOnline, auth.status, isPwaMode]);

  // 로그인 시 서버 데이터 pull
  const userId = auth.status === "authenticated" ? auth.user.id : null;
  useEffect(() => {
    if (!userId) return;
    if (!isOnline) return;

    syncEngine.pullFromServer(userId).catch((error) => {
      console.error("Pull from server error:", error);
      // 초기 로딩 시에는 조용히 실패 (서버 연결 문제일 수 있음)
    });
  }, [userId, isOnline]);

  // Supabase Realtime 구독
  useEffect(() => {
    if (!userId) return;
    if (!isOnline) return;

    const supabase = createClient();

    // 기존 채널 정리
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // 모든 테이블 변경 구독
    const channel = supabase
      .channel(`sync-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "projects",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const eventPayload: SyncEventPayload = {
            type: payload.eventType.toUpperCase() as SyncEventPayload["type"],
            table: "projects",
            record: payload.new as Record<string, unknown> | null,
            old_record: payload.old as Record<string, unknown> | null,
          };
          syncEngine.handleRealtimeEvent(eventPayload);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chapters",
        },
        async (payload) => {
          const projectId =
            (payload.new as Record<string, unknown>)?.project_id ||
            (payload.old as Record<string, unknown>)?.project_id;

          if (!projectId) return;

          // 로컬 캐시에서 프로젝트 소유 확인 (N+1 쿼리 방지)
          const localProject = await db.projects.get(projectId as string);
          if (!localProject || localProject.userId !== userId) return;

          const eventPayload: SyncEventPayload = {
            type: payload.eventType.toUpperCase() as SyncEventPayload["type"],
            table: "chapters",
            record: payload.new as Record<string, unknown> | null,
            old_record: payload.old as Record<string, unknown> | null,
          };
          syncEngine.handleRealtimeEvent(eventPayload);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "synopses",
        },
        async (payload) => {
          const projectId =
            (payload.new as Record<string, unknown>)?.project_id ||
            (payload.old as Record<string, unknown>)?.project_id;

          if (!projectId) return;

          const localProject = await db.projects.get(projectId as string);
          if (!localProject || localProject.userId !== userId) return;

          const eventPayload: SyncEventPayload = {
            type: payload.eventType.toUpperCase() as SyncEventPayload["type"],
            table: "synopses",
            record: payload.new as Record<string, unknown> | null,
            old_record: payload.old as Record<string, unknown> | null,
          };
          syncEngine.handleRealtimeEvent(eventPayload);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "characters",
        },
        async (payload) => {
          const projectId =
            (payload.new as Record<string, unknown>)?.project_id ||
            (payload.old as Record<string, unknown>)?.project_id;

          if (!projectId) return;

          const localProject = await db.projects.get(projectId as string);
          if (!localProject || localProject.userId !== userId) return;

          const eventPayload: SyncEventPayload = {
            type: payload.eventType.toUpperCase() as SyncEventPayload["type"],
            table: "characters",
            record: payload.new as Record<string, unknown> | null,
            old_record: payload.old as Record<string, unknown> | null,
          };
          syncEngine.handleRealtimeEvent(eventPayload);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "relationships",
        },
        async (payload) => {
          const projectId =
            (payload.new as Record<string, unknown>)?.project_id ||
            (payload.old as Record<string, unknown>)?.project_id;

          if (!projectId) return;

          const localProject = await db.projects.get(projectId as string);
          if (!localProject || localProject.userId !== userId) return;

          const eventPayload: SyncEventPayload = {
            type: payload.eventType.toUpperCase() as SyncEventPayload["type"],
            table: "relationships",
            record: payload.new as Record<string, unknown> | null,
            old_record: payload.old as Record<string, unknown> | null,
          };
          syncEngine.handleRealtimeEvent(eventPayload);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("[Realtime] Connected successfully");
        } else if (status === "CHANNEL_ERROR") {
          console.error("[Realtime] Connection error");
        } else if (status === "TIMED_OUT") {
          console.error("[Realtime] Connection timed out");
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, isOnline]);

  // pending count 초기화
  useEffect(() => {
    syncEngine.updatePendingCount();
  }, []);

  return {
    status,
    isOnline,
    pendingCount,
    lastError,
    isPwaMode,
    syncNow,
  };
}
