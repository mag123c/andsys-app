/**
 * 네이티브 메뉴 정의
 */

import {
  Menu,
  MenuItemConstructorOptions,
  shell,
  app,
  BrowserWindow,
} from 'electron';

const isMac = process.platform === 'darwin';

export function createMenu(): Menu {
  const template: MenuItemConstructorOptions[] = [
    // macOS 앱 메뉴
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' as const },
              { type: 'separator' as const },
              { role: 'services' as const },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
              { role: 'quit' as const },
            ],
          },
        ]
      : []),

    // 파일 메뉴
    {
      label: '파일',
      submenu: [isMac ? { role: 'close' as const } : { role: 'quit' as const }],
    },

    // 편집 메뉴
    {
      label: '편집',
      submenu: [
        { role: 'undo' as const, label: '실행 취소' },
        { role: 'redo' as const, label: '다시 실행' },
        { type: 'separator' as const },
        { role: 'cut' as const, label: '잘라내기' },
        { role: 'copy' as const, label: '복사' },
        { role: 'paste' as const, label: '붙여넣기' },
        ...(isMac
          ? [
              { role: 'pasteAndMatchStyle' as const, label: '서식 맞춰 붙여넣기' },
              { role: 'delete' as const, label: '삭제' },
              { role: 'selectAll' as const, label: '전체 선택' },
            ]
          : [
              { role: 'delete' as const, label: '삭제' },
              { type: 'separator' as const },
              { role: 'selectAll' as const, label: '전체 선택' },
            ]),
      ],
    },

    // 보기 메뉴
    {
      label: '보기',
      submenu: [
        { role: 'reload' as const, label: '새로고침' },
        { role: 'forceReload' as const, label: '강제 새로고침' },
        { role: 'toggleDevTools' as const, label: '개발자 도구' },
        { type: 'separator' as const },
        { role: 'resetZoom' as const, label: '확대/축소 초기화' },
        { role: 'zoomIn' as const, label: '확대' },
        { role: 'zoomOut' as const, label: '축소' },
        { type: 'separator' as const },
        { role: 'togglefullscreen' as const, label: '전체 화면' },
      ],
    },

    // 창 메뉴
    {
      label: '창',
      submenu: [
        { role: 'minimize' as const, label: '최소화' },
        { role: 'zoom' as const, label: '확대/축소' },
        ...(isMac
          ? [
              { type: 'separator' as const },
              { role: 'front' as const, label: '앞으로 가져오기' },
              { type: 'separator' as const },
              { role: 'window' as const },
            ]
          : [{ role: 'close' as const, label: '닫기' }]),
      ],
    },

    // 도움말 메뉴
    {
      label: '도움말',
      submenu: [
        {
          label: '가이드',
          click: async () => {
            await shell.openExternal('https://guide.4ndsys.net');
          },
        },
        {
          label: '문제 신고',
          click: async () => {
            await shell.openExternal(
              'https://github.com/mag123c/andsys-app/issues'
            );
          },
        },
        { type: 'separator' },
        {
          label: 'DevTools',
          accelerator: isMac ? 'Cmd+Option+I' : 'Ctrl+Shift+I',
          click: () => {
            const win = BrowserWindow.getFocusedWindow();
            win?.webContents.toggleDevTools();
          },
        },
      ],
    },
  ];

  return Menu.buildFromTemplate(template);
}
