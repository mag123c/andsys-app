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

/**
 * iOS Safari 감지
 */
export function isIOSSafari(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !("MSStream" in window);
  const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua) && !/CriOS/.test(ua);
  return isIOS && isSafari;
}

/**
 * macOS Safari 감지
 */
export function isMacOSSafari(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  const isMac = /Macintosh/.test(ua);
  const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
  return isMac && isSafari;
}

/**
 * Firefox 감지
 */
export function isFirefox(): boolean {
  if (typeof window === "undefined") return false;
  return /Firefox/.test(navigator.userAgent);
}

/**
 * beforeinstallprompt 이벤트 지원 여부
 */
export function supportsBeforeInstallPrompt(): boolean {
  if (typeof window === "undefined") return false;
  return "BeforeInstallPromptEvent" in window || "onbeforeinstallprompt" in window;
}

/**
 * 수동 설치 안내가 필요한 브라우저인지 확인
 * (beforeinstallprompt 미지원 브라우저: Safari, Firefox)
 */
export function needsManualInstallGuide(): boolean {
  if (typeof window === "undefined") return false;
  // PWA 모드면 안내 불필요
  if (isPWA()) return false;
  // beforeinstallprompt 지원하면 안내 불필요
  if (supportsBeforeInstallPrompt()) return false;
  // Safari 또는 Firefox는 수동 안내 필요
  return isIOSSafari() || isMacOSSafari() || isFirefox();
}
