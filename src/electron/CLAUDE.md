# Electron

Electron 데스크톱 앱 관련 코드.

## 역할

Main Process와 Preload 스크립트를 통해 Electron 앱의 네이티브 기능을 관리합니다.

## 파일 구조

| 파일 | 역할 |
|------|------|
| `main.ts` | Main Process 진입점, 창 생성 및 앱 라이프사이클 관리 |
| `preload.ts` | Renderer에 안전하게 API 노출 (contextBridge) |
| `menu.ts` | 네이티브 메뉴 정의 |
| `updater.ts` | 자동 업데이트 로직 (GitHub Releases) |
| `electron.d.ts` | window.api 타입 정의 |
| `ipc/channels.ts` | IPC 채널명 상수 |
| `ipc/handlers.ts` | IPC 핸들러 구현 |

## 아키텍처

```
Main Process (Node.js)          Renderer Process (Chromium)
┌─────────────────────┐         ┌─────────────────────────┐
│  main.ts            │   IPC   │  Next.js App            │
│  ├── createWindow() │ ←────→  │  ├── window.api.*       │
│  ├── IPC handlers   │         │  └── React Components   │
│  └── Auto updater   │         └─────────────────────────┘
└─────────────────────┘
         ↑
    preload.ts
    (contextBridge)
```

## 보안 설정

- `nodeIntegration: false` - 렌더러에서 Node.js API 직접 사용 금지
- `contextIsolation: true` - 메인/렌더러 컨텍스트 분리
- `sandbox: false` - preload 스크립트에서 Node.js API 접근 허용

## 딥링크 (OAuth)

프로토콜: `4ndsys://`

```
OAuth 흐름:
1. 브라우저에서 OAuth 진행
2. redirect_uri = 4ndsys://auth/callback?code=xxx
3. Main Process에서 URL 파싱 → Renderer로 전달
```

---

최종 수정: 2026-01-02
