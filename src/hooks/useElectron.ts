'use client';

/**
 * Electron API 훅
 *
 * Electron 환경 감지 및 API 접근을 위한 훅
 */

import { useEffect, useState, useCallback } from 'react';
import type { API, UpdateInfo } from '@/lib/electron-api.d';

/** Electron 환경 여부 확인 */
export function isElectron(): boolean {
  if (typeof window === 'undefined') return false;
  return !!window.api;
}

/** Electron API 가져오기 (없으면 null) */
export function getElectronAPI(): API | null {
  if (typeof window === 'undefined') return null;
  return window.api ?? null;
}

/**
 * Electron 환경 및 API 접근 훅
 */
export function useElectron() {
  // 클라이언트 사이드에서만 Electron 환경 확인 (초기값은 lazy로 설정)
  const [isElectronEnv] = useState(() => isElectron());
  const [appVersion, setAppVersion] = useState<string | null>(null);

  useEffect(() => {
    if (isElectronEnv) {
      getElectronAPI()
        ?.getAppVersion()
        .then(setAppVersion)
        .catch(console.error);
    }
  }, [isElectronEnv]);

  const openExternal = useCallback(async (url: string) => {
    const api = getElectronAPI();
    if (api) {
      return api.openExternal(url);
    }
    // 브라우저 환경에서는 window.open 사용
    window.open(url, '_blank', 'noopener,noreferrer');
    return { success: true };
  }, []);

  const exportFile = useCallback(
    async (options: Parameters<API['exportFile']>[0]) => {
      const api = getElectronAPI();
      if (api) {
        return api.exportFile(options);
      }
      // 브라우저 환경에서는 다운로드 링크 사용
      const blob = new Blob([options.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = options.defaultPath ?? 'export.txt';
      a.click();
      URL.revokeObjectURL(url);
      return { success: true };
    },
    []
  );

  return {
    isElectron: isElectronEnv,
    appVersion,
    api: getElectronAPI(),
    openExternal,
    exportFile,
  };
}

/**
 * 자동 업데이트 훅
 */
export function useAutoUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState<UpdateInfo | null>(
    null
  );
  const [updateDownloaded, setUpdateDownloaded] = useState<UpdateInfo | null>(
    null
  );
  const [isChecking, setIsChecking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const api = getElectronAPI();
    if (!api) return;

    const unsubAvailable = api.onUpdateAvailable((info) => {
      setUpdateAvailable(info);
      setIsChecking(false);
    });

    const unsubDownloaded = api.onUpdateDownloaded((info) => {
      setUpdateDownloaded(info);
      setIsDownloading(false);
    });

    return () => {
      unsubAvailable();
      unsubDownloaded();
    };
  }, []);

  const checkForUpdate = useCallback(async () => {
    const api = getElectronAPI();
    if (!api) return;
    setIsChecking(true);
    await api.checkForUpdate();
  }, []);

  const downloadUpdate = useCallback(async () => {
    const api = getElectronAPI();
    if (!api) return;
    setIsDownloading(true);
    await api.downloadUpdate();
  }, []);

  const installUpdate = useCallback(async () => {
    const api = getElectronAPI();
    if (!api) return;
    await api.quitAndInstall();
  }, []);

  return {
    updateAvailable,
    updateDownloaded,
    isChecking,
    isDownloading,
    checkForUpdate,
    downloadUpdate,
    installUpdate,
  };
}

/**
 * OAuth 콜백 훅 (Electron 딥링크용)
 */
export function useElectronAuthCallback(
  onCallback: (data: { provider: string; code: string }) => void
) {
  useEffect(() => {
    const api = getElectronAPI();
    if (!api) return;

    const unsubscribe = api.onAuthCallback(onCallback);
    return unsubscribe;
  }, [onCallback]);
}
