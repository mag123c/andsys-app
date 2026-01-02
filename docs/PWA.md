# PWA (Progressive Web App) 스펙

## 용어 정의 (필수)

| 용어 | 의미 |
|------|------|
| **오프라인** | 인터넷 연결이 없는 상태 (네트워크 끊김) |
| **로컬 환경** | PWA 앱으로 사용 (standalone 모드) |
| **클라우드 환경** | 웹 브라우저에서 사용 |

---

## 개요

4ndSYS를 네이티브 앱처럼 동작하는 PWA로 전환.

### 목표
- 브라우저에서 "앱으로 설치" 가능
- 오프라인(인터넷 없음)에서도 완전 동작
- 로컬 환경(PWA)에서는 수동 동기화만 제공
- 로컬 환경에서 가입 강요 없음

### 배경
Electron 대신 PWA 선택 이유:
- 코드 서명 비용 없음 ($0 vs $200-400/년)
- 앱 용량 최소화 (~수MB 캐시 vs ~100MB 앱)
- 자동 업데이트 (서비스워커)
- 크로스 플랫폼 지원

---

## 핵심 개념: 환경별 동기화

### 동기화 정책

| 환경 | 회원 | 비회원 |
|------|------|--------|
| **로컬 (PWA)** | 수동 동기화 버튼 | 동기화 시 가입 필요 |
| **클라우드 (브라우저)** | 자동 동기화 (debounce 2초) | IndexedDB만 사용 |

### 핵심 원칙

1. **로컬 환경은 철저히 "로컬"**: 자동 동기화 없음
2. **오프라인→온라인 시 자동 연동 아님**: 로컬 환경에서는 수동 버튼으로만
3. **동기화 시에만 가입 필요**: 로컬 환경에서 가입 강요 없음
4. **로컬의 단점**: 공유 기능 제한 (향후 개선 가능)

---

## 현재 구현 상태

### Phase 1: 기본 PWA 설정 ✅

- [x] Web App Manifest (`public/manifest.json`)
- [x] Service Worker (`src/app/sw.ts`, Serwist)
- [x] App Icons (192, 512, maskable, apple-touch)
- [x] 메타데이터 (`layout.tsx`)
- [x] PWA 감지 유틸 (`src/lib/pwa.ts`)
- [x] usePWAMode 훅 (`src/hooks/usePWAMode.ts`)

### Phase 2: PWA 전용 UI ✅

- [x] 설치 유도 배너 (`InstallPrompt`)
- [x] 업데이트 알림 (`UpdatePrompt`)
- [x] 수동 동기화 버튼 (`PWASyncButton`)

### Phase 3: 환경별 동기화 로직 ✅

- [x] 로컬 환경 감지 시 자동 동기화 비활성화 (`useSyncEngine.ts`)
- [x] 수동 동기화 버튼 UI (헤더에 `PWASyncButton`)
- [x] 동기화 시 로그인 필요 처리 (비회원은 `/login`으로 이동)

---

## 파일 구조

```
public/
├── manifest.json
├── icons/
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-maskable-512.png
│   └── apple-touch-icon.png

src/
├── app/
│   ├── sw.ts                  # Service Worker (Serwist)
│   └── layout.tsx             # PWA 메타데이터
│
├── lib/
│   └── pwa.ts                 # isPWA(), isInstallable()
│
├── hooks/
│   ├── usePWAMode.ts          # PWA 모드 감지 훅
│   └── useSyncEngine.ts       # 환경별 동기화 엔진 (isPwaMode 분기)
│
├── components/
│   ├── features/pwa/
│   │   ├── InstallPrompt.tsx  # 설치 유도 배너
│   │   ├── UpdatePrompt.tsx   # 업데이트 알림
│   │   ├── PWASyncButton.tsx  # 수동 동기화 버튼 (PWA 전용)
│   │   └── index.ts
│   │
│   ├── features/sync/
│   │   └── SyncStatusIndicator.tsx  # 동기화 상태 (브라우저 전용)
│   │
│   └── layout/
│       └── DashboardHeader.tsx      # PWASyncButton 통합
│
└── sync/
    └── sync-engine.ts         # 동기화 엔진 코어
```

---

## 구현 핵심 로직

### 환경 감지 (usePWAMode)

```typescript
// src/lib/pwa.ts
export function isPWA(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches;
}

// src/hooks/usePWAMode.ts
export function usePWAMode(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
```

### 환경별 동기화 분기 (useSyncEngine)

```typescript
// src/hooks/useSyncEngine.ts
export function useSyncEngine(): UseSyncEngineReturn {
  const isPwaMode = usePWAMode();

  // 온라인 복귀 시 자동 동기화 (클라우드 환경에서만)
  useEffect(() => {
    if (isPwaMode) return; // PWA에서는 자동 동기화 비활성화
    if (!isOnline || auth.status !== "authenticated") return;
    // ... 자동 동기화 로직
  }, [isOnline, auth.status, isPwaMode]);

  return { isPwaMode, syncNow, /* ... */ };
}
```

### 컴포넌트 분리

| 컴포넌트 | 환경 | 역할 |
|----------|------|------|
| `PWASyncButton` | 로컬 (PWA) | 수동 동기화 버튼 |
| `SyncStatusIndicator` | 클라우드 (브라우저) | 자동 동기화 상태 표시 |

---

## 브라우저 지원

| 브라우저 | PWA 설치 | Service Worker |
|---------|----------|----------------|
| Chrome 67+ | ✓ | ✓ |
| Edge 79+ | ✓ | ✓ |
| Safari 11.1+ | ✓ (제한) | ✓ |
| Firefox 44+ | ✗ | ✓ |
| Samsung Internet | ✓ | ✓ |

---

## 테스트 체크리스트

### 설치
- [ ] Chrome에서 설치 배너 표시
- [ ] Safari에서 "홈 화면에 추가" 안내
- [ ] 설치 후 standalone 모드로 실행

### 오프라인 (인터넷 없음)
- [ ] 네트워크 끊김 상태에서 앱 로드
- [ ] 오프라인에서 프로젝트 생성/수정
- [ ] IndexedDB에 정상 저장

### 로컬 환경 동기화
- [ ] PWA 모드에서 자동 동기화 비활성화 확인
- [ ] 수동 동기화 버튼 표시
- [ ] 비회원일 때 동기화 클릭 시 로그인 유도
- [ ] 회원일 때 동기화 정상 동작

### 업데이트
- [ ] 새 버전 배포 시 업데이트 알림
- [ ] 업데이트 적용 후 정상 동작

---

## 로드맵

| Phase | 항목 | 상태 |
|-------|------|------|
| **Phase 1** | 기본 PWA (manifest, SW, icons) | ✅ 완료 |
| **Phase 2** | PWA 전용 UI (설치, 업데이트) | ✅ 완료 |
| **Phase 3** | 환경별 동기화 로직 | ✅ 완료 |
| **Phase 4** | 최적화 (Cache API, 용량) | 선택 |

---

최종 수정: 2026-01-02
