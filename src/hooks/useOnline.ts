"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

function getServerSnapshot() {
  return true;
}

/**
 * 브라우저 온라인 상태 감지 (navigator.onLine 기반)
 */
export function useOnline() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * 실제 인터넷 연결 확인 (fetch 기반)
 * navigator.onLine + /api/health 확인으로 정확한 온라인 상태 감지
 */
export function useRealOnline() {
  const browserOnline = useOnline();
  const [isRealOnline, setIsRealOnline] = useState(browserOnline);
  const [isChecking, setIsChecking] = useState(false);

  const checkOnline = useCallback(async () => {
    if (!browserOnline) {
      setIsRealOnline(false);
      return false;
    }

    setIsChecking(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch("/api/health", {
        method: "HEAD",
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const online = response.ok;
      setIsRealOnline(online);
      return online;
    } catch {
      setIsRealOnline(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [browserOnline]);

  // 브라우저 온라인 상태가 바뀌면 실제 연결 확인
  useEffect(() => {
    if (browserOnline) {
      checkOnline();
    } else {
      setIsRealOnline(false);
    }
  }, [browserOnline, checkOnline]);

  // 온라인 상태에서 주기적으로 연결 확인 (30초마다)
  useEffect(() => {
    if (!browserOnline) return;

    const interval = setInterval(checkOnline, 30000);
    return () => clearInterval(interval);
  }, [browserOnline, checkOnline]);

  return {
    isOnline: isRealOnline,
    isChecking,
    checkOnline,
  };
}
