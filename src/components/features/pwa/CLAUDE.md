# components/features/pwa

## 역할

PWA (Progressive Web App) 관련 UI 컴포넌트.
로컬 환경(PWA)과 클라우드 환경(브라우저)을 구분하여 적절한 UI 제공.

## 파일 구조

| 파일 | 역할 | 표시 조건 |
|------|------|----------|
| InstallPrompt.tsx | 앱 설치 유도 배너 | 브라우저에서 설치 가능할 때 |
| UpdatePrompt.tsx | 새 버전 업데이트 알림 | SW 업데이트 감지 시 |
| PWASyncButton.tsx | 수동 동기화 버튼 | 로컬 환경(PWA)에서만 |
| index.ts | 모듈 export | - |

## 환경별 동작

| 컴포넌트 | 로컬 환경 (PWA) | 클라우드 환경 (브라우저) |
|----------|----------------|----------------------|
| InstallPrompt | 표시 안함 | 설치 가능 시 표시 |
| UpdatePrompt | 업데이트 시 표시 | 업데이트 시 표시 |
| PWASyncButton | 항상 표시 | 표시 안함 |

## PWASyncButton 동작

1. **비회원**: 클릭 시 `/login`으로 이동 (가입 강요 없음)
2. **회원 + 오프라인**: 비활성화 상태
3. **회원 + 온라인**: 수동 동기화 실행
4. **pending 항목**: 뱃지로 개수 표시

## 의존성

- `hooks/useSyncEngine` - 동기화 상태 및 isPwaMode
- `hooks/useAuth` - 인증 상태
- `lib/pwa` - isPWA(), isInstallable()
- `components/ui/button`, `components/ui/tooltip`

## 관련 컴포넌트

- `features/sync/SyncStatusIndicator` - 클라우드 환경 전용 동기화 상태
- `layout/DashboardHeader` - PWASyncButton 통합 위치

---
최종 수정: 2026-01-02
