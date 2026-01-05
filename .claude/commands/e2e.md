# E2E 테스트 워크플로우

Playwright MCP를 사용한 E2E 테스트 실행.

## 제한사항

> **OAuth 로그인 불가**: Playwright MCP에서는 Google/Kakao 등 OAuth 로그인이 불가능합니다.
> - OAuth는 외부 도메인 리디렉션 + 보안 제약으로 자동화 어려움
> - **대안**: 게스트 모드로 테스트하거나, 로그인 없이 접근 가능한 페이지만 테스트

## 사전 조건

```bash
# 개발 서버 실행 확인
pnpm dev
```

## 테스트 시나리오

### 1. 기본 페이지 로딩

```
browser_navigate → http://localhost:3000
browser_snapshot → 페이지 상태 확인
```

### 2. 게스트 모드 테스트 (OAuth 대안)

```
# 게스트로 시작 (로그인 없이)
browser_navigate → /novels
browser_snapshot → 게스트 모드 확인

# 게스트로 프로젝트 생성
browser_click → 새 프로젝트 버튼
browser_type → 프로젝트 제목
browser_click → 저장

# IndexedDB에 저장 확인
browser_snapshot → 프로젝트 목록에 표시 확인
```

> **참고**: OAuth 로그인이 필요한 기능(동기화, 공유 등)은 수동 테스트 필요

### 3. 프로젝트 CRUD

```
# 프로젝트 생성
browser_navigate → /novels
browser_click → 새 프로젝트 버튼
browser_type → 프로젝트 제목
browser_click → 저장

# 생성 확인
browser_snapshot → 프로젝트 목록 확인
```

### 4. 에디터 테스트

```
browser_navigate → /novels/{id}/chapters/{chapterId}
browser_snapshot → 에디터 로딩 확인

# 텍스트 입력
browser_type → 테스트 텍스트

# 자동저장 확인
browser_wait_for → 2초 대기
browser_snapshot → 저장 상태 확인
```

## 검증 기준

| 항목 | 기대 결과 |
|------|----------|
| 페이지 로딩 | 에러 없음, 주요 요소 렌더링 |
| 네비게이션 | URL 변경, 페이지 전환 정상 |
| 폼 제출 | 데이터 저장, 피드백 표시 |
| 에러 처리 | 에러 메시지 표시, 크래시 없음 |

## 실패 시 조치

1. 스크린샷 저장 (`browser_take_screenshot`)
2. 콘솔 메시지 확인 (`browser_console_messages`)
3. 네트워크 요청 확인 (`browser_network_requests`)
4. 에러 분석 → 코드 수정 → 재테스트
