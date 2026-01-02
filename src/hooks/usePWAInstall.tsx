"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { isPWA } from "@/lib/pwa";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PWAInstallContextValue {
  /** 설치 프롬프트 이벤트 (null이면 설치 불가) */
  installPrompt: BeforeInstallPromptEvent | null;
  /** 설치 실행 */
  install: () => Promise<boolean>;
  /** 브라우저 설치 프롬프트 지원 여부 */
  canInstall: boolean;
  /** PWA 모드 여부 (true면 이미 PWA로 실행 중) */
  isPwaMode: boolean;
  /** 버튼 표시 여부 (브라우저 모드일 때만 true) */
  showInstallButton: boolean;
}

const PWAInstallContext = createContext<PWAInstallContextValue | null>(null);

export function PWAInstallProvider({ children }: { children: ReactNode }) {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isPwaMode, setIsPwaMode] = useState(true); // 초기값 true로 설정하여 SSR에서 버튼 숨김

  useEffect(() => {
    // 클라이언트에서 PWA 모드 확인
    const pwaMode = isPWA();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 시 1회성 초기화
    setIsPwaMode(pwaMode);

    // PWA 모드면 이벤트 캡처 불필요
    if (pwaMode) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
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

  return (
    <PWAInstallContext.Provider
      value={{
        installPrompt,
        install,
        canInstall: !!installPrompt,
        isPwaMode,
        showInstallButton: !isPwaMode, // 브라우저 모드일 때만 true
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
