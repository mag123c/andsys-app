# components/providers

## 역할
전역 Context Provider 컴포넌트.

## 파일 구조
| 파일 | 역할 |
|------|------|
| AuthProvider.tsx | 인증 상태 관리 (Supabase Auth + 게스트 모드) |
| SyncProvider.tsx | 동기화 상태 전역 제공 |
| ThemeProvider.tsx | 다크/라이트 테마 관리 (next-themes) |
| DesignThemeProvider.tsx | 디자인 테마 관리 (기본/디지털) |

> SW 관리는 `@serwist/next`에서 자동 처리 (next.config.ts)

## AuthProvider 주요 기능
- OAuth 로그인 (Google, Discord)
- 게스트 모드 (guestId 기반)
- 게스트 → 회원 데이터 마이그레이션
- 로그인 시 서버 데이터 pull

## 의존성
- `@supabase/supabase-js`
- `lib/guest`
- `sync/sync-engine`

## DesignThemeProvider 주요 기능
- 디자인 테마 관리 (default/digital)
- HTML data-design-theme 속성 설정
- useUserSettings 훅을 통한 저장/로드
- useDesignTheme 훅으로 접근

## 테마 구조
| 테마 | 속성 | 설명 |
|------|------|------|
| 다크/라이트 | `.dark` 클래스 | next-themes 관리 |
| 디자인 테마 | `data-design-theme` 속성 | DesignThemeProvider 관리 |

---
최종 수정: 2026-01-18
