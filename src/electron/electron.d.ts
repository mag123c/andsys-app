/**
 * Electron API 타입 정의
 *
 * Renderer 프로세스에서 window.api 사용을 위한 타입
 */

export interface ElectronAPI {
  process: {
    versions: NodeJS.ProcessVersions;
  };
  ipcRenderer: {
    send: (channel: string, ...args: unknown[]) => void;
    on: (
      channel: string,
      func: (...args: unknown[]) => void
    ) => (() => void) | undefined;
    invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
  };
}

export interface UpdateInfo {
  version: string;
  releaseDate?: string;
  releaseNotes?: string;
}

export interface API {
  // 앱 정보
  getAppVersion: () => Promise<string>;
  getAppPath: (name: string) => Promise<string>;

  // 외부 링크
  openExternal: (url: string) => Promise<{ success: boolean; error?: string }>;

  // 창 제어
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;

  // 파일 시스템
  exportFile: (options: {
    content: string;
    defaultPath?: string;
    filters?: { name: string; extensions: string[] }[];
  }) => Promise<{
    success: boolean;
    filePath?: string;
    canceled?: boolean;
    error?: string;
  }>;
  importFile: (options?: {
    filters?: { name: string; extensions: string[] }[];
  }) => Promise<{
    success: boolean;
    content?: string;
    filePath?: string;
    canceled?: boolean;
    error?: string;
  }>;

  // 업데이트
  onUpdateAvailable: (callback: (info: UpdateInfo) => void) => () => void;
  onUpdateDownloaded: (callback: (info: UpdateInfo) => void) => () => void;
  checkForUpdate: () => Promise<void>;
  downloadUpdate: () => Promise<void>;
  quitAndInstall: () => Promise<void>;

  // OAuth
  onAuthCallback: (
    callback: (data: { provider: string; code: string }) => void
  ) => () => void;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
    api?: API;
  }
}

export {};
