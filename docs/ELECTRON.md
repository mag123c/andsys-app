# Electron 마이그레이션 스펙

4ndSYS 데스크톱 앱 개발을 위한 Electron 마이그레이션 문서.

## 1. 배경 및 목적

### 현재 상태 (PWA)
```
브라우저 → IndexedDB (공용 저장소)
         → 브라우저 데이터 삭제 시 유실 위험
         → 오프라인 작업 후 동기화 전 삭제 시 복구 불가
```

### 목표 (Electron)
```
독립 앱 → 앱 전용 저장소 (%APPDATA%/4ndSYS/)
        → 브라우저와 완전 분리
        → 데이터 안전성 향상
```

### 마이그레이션 이유
| 항목 | PWA | Electron |
|------|-----|----------|
| 저장소 | 브라우저 공용 | 앱 전용 |
| 브라우저 캐시 삭제 | 영향 받음 | 영향 없음 |
| 오프라인 데이터 보호 | 취약 | 안전 |
| 파일 시스템 접근 | 제한적 | 전체 |
| 자동 업데이트 | 불가 | 가능 |

---

## 2. 아키텍처

### 2.1 현재 (웹)
```
┌─────────────────────────────────────────┐
│  Browser (Chrome, Safari, etc.)         │
│  ┌───────────────────────────────────┐  │
│  │  Next.js App                      │  │
│  │  ├── React Components             │  │
│  │  ├── IndexedDB (Dexie)            │  │
│  │  └── Supabase Client              │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
              ↓ HTTPS
┌─────────────────────────────────────────┐
│  Vercel (Next.js Server)                │
│  ├── API Routes                         │
│  ├── Server Actions                     │
│  └── SSR Pages                          │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Supabase                               │
│  ├── Auth                               │
│  ├── PostgreSQL                         │
│  ├── Storage                            │
│  └── Realtime                           │
└─────────────────────────────────────────┘
```

### 2.2 Electron 아키텍처
```
┌─────────────────────────────────────────────────────┐
│  Electron App                                       │
│  ┌───────────────────┐  ┌─────────────────────────┐ │
│  │  Main Process     │  │  Renderer Process       │ │
│  │  (Node.js)        │  │  (Chromium)             │ │
│  │                   │  │                         │ │
│  │  ├── IPC Handler  │←→│  Next.js App            │ │
│  │  ├── Auto Update  │  │  ├── React Components   │ │
│  │  ├── File System  │  │  ├── IndexedDB (Dexie)  │ │
│  │  ├── Native Menu  │  │  └── Supabase Client    │ │
│  │  └── Tray Icon    │  │                         │ │
│  └───────────────────┘  └─────────────────────────┘ │
│                                                     │
│  App Data: %APPDATA%/4ndSYS/                        │
│  ├── IndexedDB/                                     │
│  ├── logs/                                          │
│  └── config.json                                    │
└─────────────────────────────────────────────────────┘
              ↓ HTTPS
┌─────────────────────────────────────────┐
│  Supabase (기존 그대로)                  │
└─────────────────────────────────────────┘
```

### 2.3 웹 + 데스크톱 동시 운영
```
┌─────────────────────────────────────────────────────┐
│                    코드베이스                        │
│  src/                                               │
│  ├── app/           (Next.js - 웹/Electron 공용)    │
│  ├── components/    (React - 공용)                  │
│  ├── hooks/         (공용)                          │
│  ├── storage/       (공용)                          │
│  └── electron/      (Electron 전용 - NEW)           │
│      ├── main.ts                                    │
│      ├── preload.ts                                 │
│      └── ipc/                                       │
└─────────────────────────────────────────────────────┘
              ↓
┌──────────────────┐  ┌──────────────────┐
│  pnpm build:web  │  │  pnpm build:electron │
│  → Vercel 배포    │  │  → .exe/.dmg 생성    │
└──────────────────┘  └──────────────────┘
```

---

## 3. 기술 스택

### 3.1 핵심 의존성
```json
{
  "devDependencies": {
    "electron": "^33.x",
    "electron-builder": "^25.x",
    "@electron-toolkit/utils": "^3.x",
    "@electron-toolkit/preload": "^3.x",
    "electron-updater": "^6.x"
  }
}
```

### 3.2 빌드 도구
| 도구 | 역할 |
|------|------|
| electron-builder | 크로스 플랫폼 빌드, 코드 서명 |
| electron-updater | 자동 업데이트 (GitHub Releases) |

### 3.3 호환성
| 항목 | 버전 |
|------|------|
| Electron | 33.x (Chromium 130) |
| Node.js | 20.x (Electron 내장) |
| Windows | 10+ (x64, arm64) |
| macOS | 11+ (x64, arm64) |
| Linux | Ubuntu 20.04+, Fedora 32+ |

---

## 4. 개발 단계

### Phase 1: 기본 설정 (1일)
- [x] Electron 패키지 설치
- [x] electron-builder 설정
- [x] 프로젝트 구조 생성 (`src/electron/`)
- [x] Main Process 기본 코드 작성
- [x] Preload 스크립트 작성
- [x] 개발 환경 설정 (동시 실행)

### Phase 2: Next.js 연동 (1일)
- [x] 개발 모드: localhost:3000 로드
- [x] 프로덕션 모드: 정적 파일 로드 또는 내장 서버
- [x] 핫 리로드 설정

### Phase 3: OAuth 처리 (1일)
- [x] 딥링크 방식 또는 localhost 리다이렉트
- [ ] Supabase Auth 연동 확인
- [ ] 토큰 저장 (Electron safeStorage)

### Phase 4: 네이티브 기능 (선택)
- [ ] 시스템 트레이 아이콘
- [x] 네이티브 메뉴
- [ ] 알림 (Notification API)
- [x] 파일 시스템 접근 (내보내기/백업)

### Phase 5: 빌드 및 배포 (1일)
- [ ] Windows 빌드 (.exe, NSIS installer)
- [ ] macOS 빌드 (.dmg, 코드 서명)
- [x] 자동 업데이트 설정 (GitHub Releases)
- [ ] CI/CD 설정 (GitHub Actions)

---

## 5. 파일 구조

```
src/
├── electron/
│   ├── main.ts              # Main Process 진입점
│   ├── preload.ts           # Preload 스크립트 (contextBridge)
│   ├── ipc/
│   │   ├── handlers.ts      # IPC 핸들러 정의
│   │   └── channels.ts      # IPC 채널명 상수
│   ├── updater.ts           # 자동 업데이트 로직
│   └── menu.ts              # 네이티브 메뉴 정의
│
├── app/                     # Next.js (기존 그대로)
├── components/              # React (기존 그대로)
├── hooks/                   # (기존 그대로)
└── storage/                 # (기존 그대로)

electron-builder.yml         # 빌드 설정
```

---

## 6. 주요 고려사항

### 6.1 OAuth 인증
**문제**: Electron은 브라우저가 아니라 OAuth 리다이렉트 처리 다름

**해결 방안**:
```
방법 1: 딥링크 (권장)
- 커스텀 프로토콜 등록 (4ndsys://)
- OAuth redirect_uri = 4ndsys://auth/callback
- Supabase 설정에서 딥링크 허용

방법 2: Localhost 서버
- Main Process에서 임시 HTTP 서버 실행
- redirect_uri = http://localhost:PORT/auth/callback
- 인증 완료 후 서버 종료
```

### 6.2 저장소
```
앱 데이터 경로:
- Windows: %APPDATA%/4ndSYS/
- macOS: ~/Library/Application Support/4ndSYS/
- Linux: ~/.config/4ndSYS/

구조:
4ndSYS/
├── IndexedDB/           # Chromium IndexedDB (자동)
├── Local Storage/       # (자동)
├── logs/               # 앱 로그
└── config.json         # 사용자 설정
```

### 6.3 자동 업데이트
```yaml
# electron-builder.yml
publish:
  provider: github
  owner: mag123c
  repo: andsys-app
  releaseType: release
```

**업데이트 흐름**:
```
앱 시작 → GitHub Releases 확인 → 새 버전 있으면 다운로드
         → 백그라운드 설치 → 재시작 시 적용
```

### 6.4 코드 서명 (배포 시 필수)
| OS | 인증서 | 비용 |
|----|--------|------|
| Windows | EV Code Signing Certificate | $200-400/년 |
| macOS | Apple Developer Program | $99/년 |

**서명 없이 배포 시**:
- Windows: SmartScreen 경고 ("알 수 없는 게시자")
- macOS: Gatekeeper 차단 (우회 필요)

### 6.5 보안
```typescript
// preload.ts - contextIsolation 활성화
contextBridge.exposeInMainWorld('electronAPI', {
  // 안전한 API만 노출
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
});
```

**주의사항**:
- `nodeIntegration: false` 유지
- `contextIsolation: true` 유지
- 필요한 API만 preload로 노출

---

## 7. 빌드 스크립트

```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "dev:electron": "concurrently \"next dev\" \"wait-on http://localhost:3000 && electron .\"",
    "build:web": "next build",
    "build:electron": "next build && electron-builder",
    "build:electron:win": "next build && electron-builder --win",
    "build:electron:mac": "next build && electron-builder --mac",
    "build:electron:linux": "next build && electron-builder --linux"
  }
}
```

---

## 8. 예상 작업량

| Phase | 작업 | 예상 시간 |
|-------|------|----------|
| 1 | 기본 설정 | 3-4시간 |
| 2 | Next.js 연동 | 2-3시간 |
| 3 | OAuth 처리 | 3-4시간 |
| 4 | 네이티브 기능 (선택) | 2-4시간 |
| 5 | 빌드 및 배포 | 3-4시간 |
| **합계** | | **13-19시간** |

---

## 9. 대안: Tauri (향후 고려)

| 항목 | Electron | Tauri |
|------|----------|-------|
| 번들 크기 | 150-200MB | 5-15MB |
| 메모리 | 300-500MB | 50-100MB |
| 언어 | JavaScript | Rust + JavaScript |
| Next.js 호환 | 좋음 | 수정 필요 |
| 학습 곡선 | 낮음 | 중간 |

**전환 시점**: Electron 버전 안정화 후, 성능 최적화 필요 시

---

## 10. 참고 자료

- [Electron 공식 문서](https://www.electronjs.org/docs)
- [electron-builder 문서](https://www.electron.build/)
- [Next.js + Electron 예제](https://github.com/niceplugin/nextron)
- [Supabase OAuth in Electron](https://supabase.com/docs/guides/auth/social-login)

---

최종 수정: 2026-01-02
