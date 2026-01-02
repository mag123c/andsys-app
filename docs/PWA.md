# PWA (Progressive Web App) 전환 스펙

## 개요

4ndSYS를 네이티브 앱처럼 동작하는 PWA로 전환하기 위한 명세서.

### 목표
- 브라우저에서 "앱으로 설치" 가능
- 오프라인에서 완전 동작
- PWA 모드에서 로컬 우선 저장 강화
- 사용자에게 PWA 설치 유도 및 모드 인지

### 배경
Electron 대신 PWA 선택 이유:
- 코드 서명 비용 없음 ($0 vs $200-400/년)
- 앱 용량 최소화 (~수MB 캐시 vs ~100MB 앱)
- 자동 업데이트 (서비스워커)
- 크로스 플랫폼 지원

---

## 1. 현재 상태 분석

### 1.1 데이터 저장 (IndexedDB/Dexie)

| 테이블 | 용도 | 용량 영향 |
|--------|------|----------|
| projects | 소설 프로젝트 | 표지 이미지 Base64 (~1MB/개) |
| chapters | 챕터 콘텐츠 | Tiptap JSON (경량) |
| synopses | 시놉시스 | Tiptap JSON (경량) |
| characters | 캐릭터 | 이미지 Base64 (~500KB/개) |
| relationships | 관계도 | 경량 |
| versions | 히스토리 | 경량 |
| syncQueue | 동기화 대기열 | 경량 |
| settings | 사용자 설정 | 경량 |

**문제점**: Base64 이미지 저장으로 용량 폭증 가능

### 1.2 오프라인 지원 현황

| 기능 | 현재 지원 | 비고 |
|------|----------|------|
| 프로젝트 CRUD | ✓ | IndexedDB |
| 챕터 편집 | ✓ | IndexedDB |
| 이미지 저장 | ✓ | Base64 |
| 오프라인 감지 | ✓ | useOnline.ts |
| 동기화 엔진 | ✓ | syncStatus 추적 |
| 첫 진입 오프라인 | ✗ | 서버 데이터 필요 |

### 1.3 PWA 관련 설정

| 항목 | 현재 | 필요 |
|------|------|------|
| manifest.json | ✗ | ✓ |
| Service Worker | ✗ | ✓ |
| App Icons | ✗ | ✓ |
| theme-color | ✗ | ✓ |
| apple-touch-icon | ✗ | ✓ |

---

## 2. PWA 감지 및 모드 분리

### 2.1 PWA 실행 감지

```typescript
// src/lib/pwa.ts
export function isPWA(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    // standalone 모드 (Android Chrome, Desktop)
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari
    (window.navigator as any).standalone === true ||
    // Windows
    window.matchMedia('(display-mode: window-controls-overlay)').matches
  );
}

export function isInstallable(): boolean {
  // beforeinstallprompt 이벤트 수신 여부
  return 'BeforeInstallPromptEvent' in window;
}
```

### 2.2 모드별 동작 차이

| 기능 | 브라우저 | PWA (설치됨) |
|------|----------|-------------|
| 동기화 | 자동 (실시간) | 수동 버튼 |
| 저장 | IndexedDB | IndexedDB + OPFS (선택) |
| 오프라인 | 제한적 | 완전 지원 |
| 업데이트 | 페이지 새로고침 | 서비스워커 알림 |
| 설치 배너 | 표시 | 숨김 |

### 2.3 모드별 UI 차이

```tsx
// PWA 모드 감지 훅
function usePWAMode() {
  const [isPwaMode, setIsPwaMode] = useState(false);

  useEffect(() => {
    setIsPwaMode(isPWA());
  }, []);

  return isPwaMode;
}

// 조건부 UI 렌더링
function SyncButton() {
  const isPwaMode = usePWAMode();

  if (!isPwaMode) return null; // 브라우저에서는 숨김

  return <Button onClick={syncToCloud}>클라우드 동기화</Button>;
}
```

---

## 3. 구현 태스크

### Phase 1: 기본 PWA 설정 (P1)

#### 3.1 Web App Manifest
```json
// public/manifest.json
{
  "name": "4ndSYS - 웹소설 글쓰기 플랫폼",
  "short_name": "4ndSYS",
  "description": "회차·시놉시스·캐릭터를 한 곳에서",
  "start_url": "/novels",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#000000",
  "background_color": "#ffffff",
  "categories": ["productivity", "utilities"],
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/mobile.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}
```

#### 3.2 메타데이터 추가
```tsx
// src/app/layout.tsx
export const metadata: Metadata = {
  title: "4ndSYS | 웹소설 작가를 위한 글쓰기 플랫폼",
  description: "회차, 시놉시스, 캐릭터를 한 곳에서 관리하세요",
  manifest: "/manifest.json",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "4ndSYS",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};
```

#### 3.3 Service Worker (Serwist 사용)
```typescript
// src/app/sw.ts
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
```

#### 3.4 App Icons 생성
- icon-192.png (192x192)
- icon-512.png (512x512)
- icon-maskable-512.png (안전 영역 포함)
- apple-touch-icon.png (180x180)

---

### Phase 2: PWA 모드 전용 기능 (P2)

#### 3.5 수동 동기화 UI

```tsx
// src/components/features/sync/PWASyncButton.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Cloud, CloudOff, RefreshCw } from "lucide-react";
import { useSyncEngine } from "@/hooks/useSyncEngine";
import { usePWAMode } from "@/hooks/usePWAMode";
import { useOnline } from "@/hooks/useOnline";

export function PWASyncButton() {
  const isPwaMode = usePWAMode();
  const isOnline = useOnline();
  const { syncStatus, syncAll, pendingCount } = useSyncEngine();
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isPwaMode) return null;

  const handleSync = async () => {
    if (!isOnline) return;
    setIsSyncing(true);
    try {
      await syncAll();
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSync}
      disabled={!isOnline || isSyncing}
    >
      {!isOnline ? (
        <CloudOff className="h-4 w-4" />
      ) : isSyncing ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <Cloud className="h-4 w-4" />
      )}
      {pendingCount > 0 && (
        <span className="ml-1 text-xs">({pendingCount})</span>
      )}
    </Button>
  );
}
```

#### 3.6 설치 유도 배너

```tsx
// src/components/features/pwa/InstallPrompt.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";
import { isPWA } from "@/lib/pwa";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // 이미 PWA로 실행 중이면 표시 안 함
    if (isPWA()) return;

    // 이전에 닫았으면 표시 안 함
    if (localStorage.getItem("pwa-prompt-dismissed")) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("pwa-prompt-dismissed", "true");
  };

  if (!deferredPrompt || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-background border rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start gap-3">
        <Download className="h-5 w-5 mt-0.5 text-primary" />
        <div className="flex-1">
          <p className="font-medium">앱으로 설치하기</p>
          <p className="text-sm text-muted-foreground">
            홈 화면에 추가하여 더 빠르게 접속하세요
          </p>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={handleInstall}>
              설치
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss}>
              나중에
            </Button>
          </div>
        </div>
        <button onClick={handleDismiss} className="text-muted-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
```

#### 3.7 업데이트 알림

```tsx
// src/components/features/pwa/UpdatePrompt.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function UpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.ready.then((reg) => {
      setRegistration(reg);

      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            setShowUpdate(true);
          }
        });
      });
    });
  }, []);

  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
    window.location.reload();
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground rounded-lg shadow-lg px-4 py-2 flex items-center gap-3 z-50">
      <RefreshCw className="h-4 w-4" />
      <span className="text-sm">새 버전이 있습니다</span>
      <Button size="sm" variant="secondary" onClick={handleUpdate}>
        업데이트
      </Button>
    </div>
  );
}
```

---

### Phase 3: 오프라인 강화 (P3)

#### 3.8 Background Sync

```typescript
// src/sync/sync-engine.ts 확장
class SyncEngine {
  async registerBackgroundSync(): Promise<void> {
    if (!("serviceWorker" in navigator) || !("SyncManager" in window)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register("sync-pending");
    } catch (error) {
      console.warn("Background Sync 등록 실패:", error);
    }
  }
}

// Service Worker에서 처리
self.addEventListener("sync", (event: SyncEvent) => {
  if (event.tag === "sync-pending") {
    event.waitUntil(syncPendingData());
  }
});
```

#### 3.9 IndexedDB 용량 최적화 (선택)

```typescript
// 이미지를 Cache API로 이동
async function migrateImageToCache(
  imageBase64: string,
  id: string
): Promise<string> {
  const blob = await (await fetch(imageBase64)).blob();
  const cache = await caches.open("images-v1");
  const url = `/cache/images/${id}`;
  await cache.put(url, new Response(blob));
  return url;
}

// IndexedDB는 URL만 저장
interface OptimizedProject {
  coverImageUrl: string | null; // cache:// 또는 blob: URL
  // coverImageBase64 제거
}
```

---

## 4. 파일 구조 변경

```
추가/수정 파일:

public/
├── manifest.json              (NEW)
├── icons/
│   ├── icon-192.png          (NEW)
│   ├── icon-512.png          (NEW)
│   ├── icon-maskable-512.png (NEW)
│   └── apple-touch-icon.png  (NEW)

src/
├── app/
│   ├── sw.ts                  (NEW)
│   └── layout.tsx             (MODIFY)
│
├── lib/
│   └── pwa.ts                 (NEW)
│
├── hooks/
│   └── usePWAMode.ts          (NEW)
│
├── components/
│   └── features/
│       └── pwa/
│           ├── InstallPrompt.tsx   (NEW)
│           ├── UpdatePrompt.tsx    (NEW)
│           └── PWASyncButton.tsx   (NEW)
│
├── sync/
│   └── sync-engine.ts         (MODIFY)
│
└── storage/local/
    └── db.ts                  (MODIFY - 선택)

next.config.ts                 (MODIFY)
```

---

## 5. 의존성 추가

```bash
pnpm add @serwist/next serwist
```

---

## 6. 브라우저 지원

| 브라우저 | PWA 설치 | Service Worker | Background Sync |
|---------|----------|----------------|-----------------|
| Chrome 67+ | ✓ | ✓ | ✓ |
| Edge 79+ | ✓ | ✓ | ✓ |
| Safari 11.1+ | ✓ (제한) | ✓ | ✗ |
| Firefox 44+ | ✗ | ✓ | ✗ |
| Samsung Internet | ✓ | ✓ | ✓ |

---

## 7. 사용자 인지 UX

### 7.1 PWA 모드 표시
- 상태바에 "오프라인" / "동기화 필요" 배지 표시
- 수동 동기화 버튼 (PWA 모드 전용)

### 7.2 설치 유도
- 첫 방문 후 3회 이상 재방문 시 설치 배너
- 설정 페이지에 "앱으로 설치" 버튼

### 7.3 오프라인 피드백
- 오프라인 시 토스트 알림
- 동기화 대기 중인 항목 수 표시
- 온라인 복귀 시 자동 동기화 알림

---

## 8. 테스트 체크리스트

### 설치
- [ ] Chrome에서 설치 배너 표시
- [ ] Safari에서 "홈 화면에 추가" 안내
- [ ] 설치 후 standalone 모드로 실행

### 오프라인
- [ ] 네트워크 끊김 상태에서 앱 로드
- [ ] 오프라인에서 프로젝트 생성/수정
- [ ] 온라인 복귀 후 동기화

### 업데이트
- [ ] 새 버전 배포 시 업데이트 알림
- [ ] 업데이트 적용 후 정상 동작

---

## 9. 로드맵

| Phase | 항목 | 예상 기간 |
|-------|------|----------|
| **Phase 1** | 기본 PWA (manifest, SW, icons) | 1주 |
| **Phase 2** | PWA 전용 UI (설치, 업데이트, 동기화) | 1주 |
| **Phase 3** | 오프라인 강화 (Background Sync) | 1주 |
| **Phase 4** | 최적화 (Cache API, 용량) | 선택 |

---

최종 수정: 2026-01-02
