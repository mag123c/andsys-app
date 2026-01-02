/**
 * Preload 스크립트
 *
 * contextIsolation: true 환경에서 안전하게 API 노출
 */

import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import { IPC_CHANNELS } from './ipc/channels';

// Electron API 확장
const api = {
  // 앱 정보
  getAppVersion: (): Promise<string> =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_APP_VERSION),
  getAppPath: (name: string): Promise<string> =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_APP_PATH, name),

  // 외부 링크
  openExternal: (url: string): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke(IPC_CHANNELS.OPEN_EXTERNAL, url),

  // 창 제어
  minimize: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MINIMIZE),
  maximize: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MAXIMIZE),
  close: (): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CLOSE),

  // 파일 시스템
  exportFile: (options: {
    content: string;
    defaultPath?: string;
    filters?: { name: string; extensions: string[] }[];
  }): Promise<{ success: boolean; filePath?: string; canceled?: boolean }> =>
    ipcRenderer.invoke(IPC_CHANNELS.EXPORT_FILE, options),

  importFile: (options?: {
    filters?: { name: string; extensions: string[] }[];
  }): Promise<{
    success: boolean;
    content?: string;
    filePath?: string;
    canceled?: boolean;
  }> => ipcRenderer.invoke(IPC_CHANNELS.IMPORT_FILE, options ?? {}),

  // 업데이트 이벤트 리스너
  onUpdateAvailable: (callback: (info: UpdateInfo) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, info: UpdateInfo) =>
      callback(info);
    ipcRenderer.on(IPC_CHANNELS.UPDATE_AVAILABLE, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.UPDATE_AVAILABLE, handler);
  },

  onUpdateDownloaded: (callback: (info: UpdateInfo) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, info: UpdateInfo) =>
      callback(info);
    ipcRenderer.on(IPC_CHANNELS.UPDATE_DOWNLOADED, handler);
    return () =>
      ipcRenderer.removeListener(IPC_CHANNELS.UPDATE_DOWNLOADED, handler);
  },

  // 업데이트 액션
  checkForUpdate: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.CHECK_FOR_UPDATE),
  downloadUpdate: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.DOWNLOAD_UPDATE),
  quitAndInstall: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.QUIT_AND_INSTALL),

  // OAuth 콜백 리스너
  onAuthCallback: (
    callback: (data: { provider: string; code: string }) => void
  ): (() => void) => {
    const handler = (
      _event: Electron.IpcRendererEvent,
      data: { provider: string; code: string }
    ) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.AUTH_CALLBACK, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.AUTH_CALLBACK, handler);
  },
};

interface UpdateInfo {
  version: string;
  releaseDate?: string;
  releaseNotes?: string;
}

// contextBridge로 안전하게 노출
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error('Failed to expose API:', error);
  }
} else {
  // @ts-expect-error - fallback for non-isolated context (legacy Electron support)
  window.electron = electronAPI;
  // @ts-expect-error - fallback for non-isolated context (legacy Electron support)
  window.api = api;
}
