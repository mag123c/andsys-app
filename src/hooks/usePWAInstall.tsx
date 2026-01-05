"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  isPWA,
  isIOSSafari as checkIOSSafari,
  isMacOSSafari as checkMacOSSafari,
  isFirefox as checkFirefox,
  needsManualInstallGuide as checkNeedsManualGuide,
} from "@/lib/pwa";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface RelatedApplication {
  platform: string;
  url?: string;
  id?: string;
}

interface PWAInstallContextValue {
  /** 설치 프롬프트 이벤트 (null이면 설치 불가) */
  installPrompt: BeforeInstallPromptEvent | null;
  /** 설치 실행 */
  install: () => Promise<boolean>;
  /** 브라우저 설치 프롬프트 지원 여부 */
  canInstall: boolean;
  /** PWA가 이미 설치되어 있는지 여부 */
  isInstalled: boolean;
  /** PWA 모드 여부 (true면 이미 PWA로 실행 중) */
  isPwaMode: boolean;
  /** 버튼 표시 여부 (브라우저 모드일 때만 true) */
  showInstallButton: boolean;
  /** 앱에서 열기 (설치된 경우) */
  openInApp: () => void;
  /** 수동 설치 안내가 필요한지 (Safari/Firefox) */
  needsManualGuide: boolean;
  /** iOS Safari인지 */
  isIOSSafari: boolean;
  /** macOS Safari인지 */
  isMacOSSafari: boolean;
  /** Firefox인지 */
  isFirefox: boolean;
}

const PWAInstallContext = createContext<PWAInstallContextValue | null>(null);

export function PWAInstallProvider({ children }: { children: ReactNode }) {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isPwaMode, setIsPwaMode] = useState(true); // 초기값 true로 설정하여 SSR에서 버튼 숨김
  const [isInstalled, setIsInstalled] = useState(false);
  const [needsManualGuide, setNeedsManualGuide] = useState(false);
  const [browserType, setBrowserType] = useState({
    isIOSSafari: false,
    isMacOSSafari: false,
    isFirefox: false,
  });

  useEffect(() => {
    // 클라이언트에서 PWA 모드 확인
    const pwaMode = isPWA();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 시 1회성 초기화
    setIsPwaMode(pwaMode);

    // 브라우저 타입 감지
    setBrowserType({
      isIOSSafari: checkIOSSafari(),
      isMacOSSafari: checkMacOSSafari(),
      isFirefox: checkFirefox(),
    });

    // 수동 설치 안내 필요 여부 확인
    setNeedsManualGuide(checkNeedsManualGuide());

    // PWA 모드면 이벤트 캡처 불필요
    if (pwaMode) return;

    // PWA 설치 여부 확인 (Chrome 전용 API)
    if ("getInstalledRelatedApps" in navigator) {
      (navigator as Navigator & { getInstalledRelatedApps: () => Promise<RelatedApplication[]> })
        .getInstalledRelatedApps()
        .then((apps) => {
          const installed = apps.some((app) => app.platform === "webapp");
          setIsInstalled(installed);
        })
        .catch(() => {
          // API 실패 시 무시
        });
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // 앱 설치 완료 이벤트
    const appInstalledHandler = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };
    window.addEventListener("appinstalled", appInstalledHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", appInstalledHandler);
    };
  }, []);

  const install = useCallback(async () => {
    if (!installPrompt) return false;

    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === "accepted") {
      setInstallPrompt(null);
      return true;
    }
    return false;
  }, [installPrompt]);

  // 앱에서 열기 - 새 탭에서 현재 URL 열기 (브라우저가 PWA로 리다이렉트)
  const openInApp = useCallback(() => {
    window.open(window.location.href, "_blank");
  }, []);

  return (
    <PWAInstallContext.Provider
      value={{
        installPrompt,
        install,
        canInstall: !!installPrompt,
        isInstalled,
        isPwaMode,
        showInstallButton: !isPwaMode, // 브라우저 모드일 때만 true
        openInApp,
        needsManualGuide,
        isIOSSafari: browserType.isIOSSafari,
        isMacOSSafari: browserType.isMacOSSafari,
        isFirefox: browserType.isFirefox,
      }}
    >
      {children}
    </PWAInstallContext.Provider>
  );
}

export function usePWAInstall(): PWAInstallContextValue {
  const context = useContext(PWAInstallContext);
  if (!context) {
    throw new Error("usePWAInstall must be used within PWAInstallProvider");
  }
  return context;
}
