/**
 * IPC 핸들러 정의
 */

import { ipcMain, shell, app, dialog, BrowserWindow } from 'electron';
import { IPC_CHANNELS } from './channels';

export function registerIpcHandlers(): void {
  // 앱 버전 조회
  ipcMain.handle(IPC_CHANNELS.GET_APP_VERSION, () => {
    return app.getVersion();
  });

  // 앱 경로 조회
  ipcMain.handle(IPC_CHANNELS.GET_APP_PATH, (_event, name: string) => {
    return app.getPath(name as Parameters<typeof app.getPath>[0]);
  });

  // 외부 링크 열기
  ipcMain.handle(IPC_CHANNELS.OPEN_EXTERNAL, async (_event, url: string) => {
    // URL 유효성 검사
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:') {
        await shell.openExternal(url);
        return { success: true };
      }
      return { success: false, error: 'Invalid protocol' };
    } catch {
      return { success: false, error: 'Invalid URL' };
    }
  });

  // 창 제어
  ipcMain.handle(IPC_CHANNELS.WINDOW_MINIMIZE, (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win?.minimize();
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW_MAXIMIZE, (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win?.isMaximized()) {
      win.unmaximize();
    } else {
      win?.maximize();
    }
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW_CLOSE, (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win?.close();
  });

  // 파일 내보내기
  ipcMain.handle(
    IPC_CHANNELS.EXPORT_FILE,
    async (_event, { content, defaultPath, filters }: ExportFileOptions) => {
      const result = await dialog.showSaveDialog({
        defaultPath,
        filters: filters ?? [{ name: 'All Files', extensions: ['*'] }],
      });

      if (result.canceled || !result.filePath) {
        return { success: false, canceled: true };
      }

      try {
        const fs = await import('fs/promises');
        await fs.writeFile(result.filePath, content, 'utf-8');
        return { success: true, filePath: result.filePath };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );

  // 파일 가져오기
  ipcMain.handle(
    IPC_CHANNELS.IMPORT_FILE,
    async (_event, options: ImportFileOptions) => {
      const result = await dialog.showOpenDialog({
        filters: options.filters ?? [{ name: 'All Files', extensions: ['*'] }],
        properties: ['openFile'],
      });

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, canceled: true };
      }

      try {
        const fs = await import('fs/promises');
        const content = await fs.readFile(result.filePaths[0], 'utf-8');
        return { success: true, content, filePath: result.filePaths[0] };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );
}

interface ExportFileOptions {
  content: string;
  defaultPath?: string;
  filters?: Electron.FileFilter[];
}

interface ImportFileOptions {
  filters?: Electron.FileFilter[];
}
