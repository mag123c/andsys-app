/**
 * 자동 업데이트 로직
 *
 * electron-updater를 사용하여 GitHub Releases에서 업데이트 확인
 */

import { autoUpdater, UpdateInfo } from 'electron-updater';
import { ipcMain, BrowserWindow } from 'electron';
import { IPC_CHANNELS } from './ipc/channels';

export function setupAutoUpdater(mainWindow: BrowserWindow): void {
  // 개발 모드에서는 비활성화
  if (process.env.NODE_ENV === 'development') {
    return;
  }

  // 자동 다운로드 비활성화 (사용자 확인 후 다운로드)
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  // 업데이트 확인 가능
  autoUpdater.on('update-available', (info: UpdateInfo) => {
    mainWindow.webContents.send(IPC_CHANNELS.UPDATE_AVAILABLE, {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes,
    });
  });

  // 업데이트 다운로드 완료
  autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
    mainWindow.webContents.send(IPC_CHANNELS.UPDATE_DOWNLOADED, {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes,
    });
  });

  // 오류 처리
  autoUpdater.on('error', (error) => {
    console.error('Auto-updater error:', error);
  });

  // IPC 핸들러 등록
  ipcMain.handle(IPC_CHANNELS.CHECK_FOR_UPDATE, async () => {
    try {
      await autoUpdater.checkForUpdates();
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  });

  ipcMain.handle(IPC_CHANNELS.DOWNLOAD_UPDATE, async () => {
    try {
      await autoUpdater.downloadUpdate();
    } catch (error) {
      console.error('Failed to download update:', error);
    }
  });

  ipcMain.handle(IPC_CHANNELS.QUIT_AND_INSTALL, () => {
    autoUpdater.quitAndInstall();
  });

  // 앱 시작 시 업데이트 확인
  autoUpdater.checkForUpdates().catch((error) => {
    console.error('Initial update check failed:', error);
  });
}
