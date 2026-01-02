/**
 * Main Process 진입점
 *
 * Electron 앱의 메인 프로세스를 관리합니다.
 */

import { app, BrowserWindow, Menu, shell } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { registerIpcHandlers } from './ipc/handlers';
import { createMenu } from './menu';
import { setupAutoUpdater } from './updater';
import { IPC_CHANNELS } from './ipc/channels';

// 딥링크 프로토콜
const PROTOCOL = '4ndsys';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    autoHideMenuBar: false,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  // 창이 준비되면 표시
  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  // 외부 링크는 기본 브라우저에서 열기
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // 개발 모드: localhost 로드
  // 프로덕션: 정적 파일 로드 또는 로컬 서버
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    // 프로덕션에서는 Next.js export된 정적 파일 로드
    // 또는 로컬 Next.js 서버 실행 후 로드
    const indexPath = join(__dirname, '../out/index.html');
    mainWindow.loadFile(indexPath);
  }
}

// 딥링크 프로토콜 등록
function registerProtocol(): void {
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [
        join(process.cwd(), process.argv[1]),
      ]);
    }
  } else {
    app.setAsDefaultProtocolClient(PROTOCOL);
  }
}

// 딥링크 URL 처리
function handleDeepLink(url: string): void {
  if (!mainWindow) return;

  // 4ndsys://auth/callback?code=xxx&provider=google
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.pathname === '//auth/callback') {
      const code = parsedUrl.searchParams.get('code');
      const provider = parsedUrl.searchParams.get('provider');
      if (code && provider) {
        mainWindow.webContents.send(IPC_CHANNELS.AUTH_CALLBACK, { code, provider });
      }
    }
  } catch (error) {
    console.error('Failed to parse deep link:', error);
  }

  // 창이 최소화되어 있으면 복원
  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }
  mainWindow.focus();
}

// macOS: open-url 이벤트로 딥링크 처리
app.on('open-url', (event, url) => {
  event.preventDefault();
  handleDeepLink(url);
});

// Windows/Linux: second-instance 이벤트로 딥링크 처리
app.on('second-instance', (_event, commandLine) => {
  // 마지막 인자가 딥링크 URL
  const url = commandLine.find((arg) => arg.startsWith(`${PROTOCOL}://`));
  if (url) {
    handleDeepLink(url);
  }
});

// 단일 인스턴스 보장 (Windows/Linux)
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.whenReady().then(() => {
    // 플랫폼별 최적화
    electronApp.setAppUserModelId('net.4ndsys.app');

    // 개발 모드에서 F12로 DevTools 열기
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window);
    });

    // 딥링크 프로토콜 등록
    registerProtocol();

    // IPC 핸들러 등록
    registerIpcHandlers();

    // 메뉴 설정
    Menu.setApplicationMenu(createMenu());

    // 메인 윈도우 생성
    createWindow();

    // 자동 업데이트 설정
    if (mainWindow) {
      setupAutoUpdater(mainWindow);
    }

    // macOS: 앱 활성화 시 윈도우가 없으면 생성
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
}

// 모든 창이 닫히면 앱 종료 (macOS 제외)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Electron 보안 경고 비활성화 (개발 모드)
if (is.dev) {
  process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
}
