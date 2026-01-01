"use client";

import { useEffect, useCallback, useSyncExternalStore, useRef } from "react";
import { syncEngine, type SyncStatus, type SyncResult, type SyncEventPayload } from "@/sync/sync-engine";
import { useRealOnline } from "./useOnline";
import { useAuth } from "@/components/providers/AuthProvider";
import { createClient } from "@/storage/remote/client";
import { db } from "@/storage/local/db";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface UseSyncEngineReturn {
  status: SyncStatus;
  isOnline: boolean;
  pendingCount: number;
  lastError: string | null;
  syncNow: () => Promise<SyncResult>;
}

/**
 * 동기화 엔진 훅
 * - 온라인 복귀 시 자동 동기화
 * - 회원만 동기화 (게스트는 로컬만)
 * - Supabase Realtime 구독으로 실시간 동기화
 */
export function useSyncEngine(): UseSyncEngineReturn {
  const { isOnline } = useRealOnline();
  const { auth } = useAuth();
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
      .subscribe();

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
    syncNow,
  };
}
