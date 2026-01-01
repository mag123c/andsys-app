# components/features

## 역할
도메인별 기능 컴포넌트. 비즈니스 로직을 포함한 UI.

## 하위 디렉토리
| 디렉토리 | 역할 |
|----------|------|
| auth/ | 로그인, 회원가입 UI |
| project/ | 프로젝트 카드, 생성/수정 다이얼로그, 표지 업로드 |
| chapter/ | 챕터 목록, 생성 다이얼로그 |
| editor/ | Tiptap 에디터, 툴바, 맞춤법 검사 |
| synopsis/ | 시놉시스 에디터 |
| character/ | 캐릭터 카드, 폼, 다이얼로그 |
| relationship/ | 관계도 그래프 (React Flow), 관계 다이얼로그 |
| history/ | 버전 히스토리 비교 |
| workspace/ | 워크스페이스 레이아웃 (사이드바, 헤더) |
| share/ | 공유 링크 생성, 공유 페이지 |
| settings/ | 설정 페이지 컴포넌트 |
| sync/ | 동기화 상태 표시 (SyncStatusIndicator) |

## 컨벤션
- "use client" 지시자 사용
- 훅(hooks/)을 통해 데이터 접근
- UI 컴포넌트는 components/ui/ 재사용

## 의존성
- `hooks/*`
- `components/ui/*`
- `lib/*`

---
최종 수정: 2026-01-01
