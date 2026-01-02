"use client";

import { useSyncExternalStore } from "react";
import { isPWA } from "@/lib/pwa";

function subscribe(callback: () => void): () => void {
  const mediaQuery = window.matchMedia("(display-mode: standalone)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getSnapshot(): boolean {
  return isPWA();
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * PWA 모드 감지 훅
 * standalone 모드로 실행 중인지 확인
 */
export function usePWAMode(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
