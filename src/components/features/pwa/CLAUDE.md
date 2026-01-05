# components/features/pwa

## 역할

PWA (Progressive Web App) 관련 UI 컴포넌트.
로컬 환경(PWA)과 클라우드 환경(브라우저)을 구분하여 적절한 UI 제공.

## 파일 구조

| 파일 | 역할 | 표시 조건 |
|------|------|----------|
| InstallPrompt.tsx | 앱 설치 유도 배너 | 브라우저에서 설치 가능할 때 (24시간 dismiss 정책) |
| ManualInstallGuide.tsx | Safari/Firefox 수동 설치 안내 | beforeinstallprompt 미지원 브라우저 |
| UpdatePrompt.tsx | 새 버전 업데이트 알림 | SW 업데이트 감지 시 (자동 리로드) |
| OpenInAppButton.tsx | 앱에서 열기 버튼 | 브라우저에서 앱 설치된 경우 |
| PWASyncButton.tsx | 수동 동기화 버튼 | 로컬 환경(PWA)에서만 |
| index.ts | 모듈 export | - |

## 환경별 동작

| 컴포넌트 | 로컬 환경 (PWA) | 클라우드 환경 (브라우저) |
|----------|----------------|----------------------|
| InstallPrompt | 표시 안함 | 설치 가능 시 표시 |
| ManualInstallGuide | 표시 안함 | Safari/Firefox에서 표시 |
| UpdatePrompt | 업데이트 시 자동 리로드 | 업데이트 시 자동 리로드 |
| OpenInAppButton | 표시 안함 | 앱 설치 시 표시 |
| PWASyncButton | 항상 표시 | 표시 안함 |

## dismiss 정책

- **저장소**: `lib/pwa-storage.ts`
- **키**: `pwa-prompt-dismissed`
- **형식**: `{ timestamp: number }`
- **만료**: 24시간 후 자동 재표시
- **적용**: InstallPrompt, ManualInstallGuide

## PWASyncButton 동작

1. **비회원**: 클릭 시 `/login`으로 이동 (가입 강요 없음)
2. **회원 + 오프라인**: 비활성화 상태
3. **회원 + 온라인**: 수동 동기화 실행
4. **pending 항목**: 뱃지로 개수 표시

## 의존성

- `hooks/usePWAInstall` - PWA 설치 상태, 브라우저 타입 감지
- `hooks/useSyncEngine` - 동기화 상태 및 isPwaMode
- `hooks/useAuth` - 인증 상태
- `lib/pwa` - isPWA(), isInstallable(), 브라우저 감지 함수들
- `lib/pwa-storage` - 24시간 만료 localStorage 관리
- `components/ui/button`, `components/ui/dialog`

## 관련 컴포넌트

- `features/sync/SyncStatusIndicator` - 클라우드 환경 전용 동기화 상태
- `features/workspace/NovelsListSidebar` - OpenInAppButton 통합 위치
- `features/workspace/NovelsListLayout` - InstallPrompt 통합 위치

---
최종 수정: 2026-01-05
