# components/providers

## 역할
전역 Context Provider 컴포넌트.

## 파일 구조
| 파일 | 역할 |
|------|------|
| AuthProvider.tsx | 인증 상태 관리 (Supabase Auth + 게스트 모드) |
| SyncProvider.tsx | 동기화 상태 전역 제공 |
| ThemeProvider.tsx | 다크/라이트 테마 관리 (next-themes) |
| ServiceWorkerProvider.tsx | PWA 서비스 워커 등록 및 관리 |

## AuthProvider 주요 기능
- OAuth 로그인 (Google, Discord)
- 게스트 모드 (guestId 기반)
- 게스트 → 회원 데이터 마이그레이션
- 로그인 시 서버 데이터 pull

## 의존성
- `@supabase/supabase-js`
- `lib/guest`
- `sync/sync-engine`

---
최종 수정: 2026-01-02
