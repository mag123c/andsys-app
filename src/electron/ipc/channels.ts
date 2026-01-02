/**
 * IPC 채널명 상수
 */

export const IPC_CHANNELS = {
  // 앱 정보
  GET_APP_VERSION: 'get-app-version',
  GET_APP_PATH: 'get-app-path',

  // 외부 링크
  OPEN_EXTERNAL: 'open-external',

  // 창 제어
  WINDOW_MINIMIZE: 'window-minimize',
  WINDOW_MAXIMIZE: 'window-maximize',
  WINDOW_CLOSE: 'window-close',

  // OAuth 관련
  AUTH_CALLBACK: 'auth-callback',
  AUTH_START: 'auth-start',

  // 업데이트
  CHECK_FOR_UPDATE: 'check-for-update',
  DOWNLOAD_UPDATE: 'download-update',
  QUIT_AND_INSTALL: 'quit-and-install',
  UPDATE_AVAILABLE: 'update-available',
  UPDATE_DOWNLOADED: 'update-downloaded',

  // 파일 시스템
  EXPORT_FILE: 'export-file',
  IMPORT_FILE: 'import-file',
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
