/**
 * PWA 모드 감지
 * standalone 모드로 실행 중인지 확인
 */
export function isPWA(): boolean {
  if (typeof window === "undefined") return false;

  return (
    // standalone 모드 (Android Chrome, Desktop)
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true ||
    // Windows
    window.matchMedia("(display-mode: window-controls-overlay)").matches
  );
}

/**
 * PWA 설치 가능 여부 확인
 */
export function isInstallable(): boolean {
  if (typeof window === "undefined") return false;
  return "BeforeInstallPromptEvent" in window;
}

/**
 * Service Worker 등록 상태 확인
 */
export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    return await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
}
