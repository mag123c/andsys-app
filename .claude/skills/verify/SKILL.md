---
name: verify
description: 검증 스킬. 빌드, 린트, 테스트, E2E 검증. 커밋/PR 전 필수 실행. AI가 스스로 코드를 검증하는 자체 검증 루프.
---

# Verify Skill

자체 검증 루프. AI가 스스로 코드를 검증할 수 있는 수단.

> Boris: "품질을 2~3배 높이는 비결입니다. Claude가 코드를 짠 뒤 스스로 검증할 수 있는 루프(Loop)를 만들어 주세요."

## 검증 단계

```
/verify
    │
    ├─ Step 1: 빌드 검증
    │   └─ pnpm build
    │       ├─ 성공 → Step 2로
    │       └─ 실패 → 에러 분석 → 코드 수정 → 재검증
    │
    ├─ Step 2: 린트 검증
    │   └─ pnpm lint
    │       ├─ 성공 → Step 3로
    │       └─ 에러 → 자동 수정 또는 코드 수정 → 재검증
    │
    ├─ Step 3: 테스트 검증
    │   └─ pnpm test:run
    │       ├─ 성공 → Step 4로
    │       └─ 실패 → 테스트 또는 코드 수정 → 재검증
    │
    └─ Step 4: E2E 검증 (선택)
        └─ Playwright 스냅샷
            ├─ 성공 → 검증 완료
            └─ 실패 → UI 수정 → 재검증
```

## 호출 시점

| 시점 | 필수 여부 | 이유 |
|------|----------|------|
| 커밋 전 | **필수** | 빌드 실패 커밋 방지 |
| PR 생성 전 | **필수** | CI 실패 방지 |
| 구현 완료 후 | 권장 | 조기 문제 발견 |
| 리뷰 이슈 수정 후 | 권장 | 수정 검증 |

## 검증 결과 처리

| 결과 | 조치 |
|------|------|
| 빌드 실패 | 에러 메시지 분석 → 코드 수정 → `/verify` 재실행 |
| 린트 에러 | `pnpm lint --fix` 시도 → 수동 수정 필요 시 코드 수정 |
| 테스트 실패 | 실패 테스트 분석 → 테스트 또는 구현 수정 |
| E2E 실패 | 스크린샷 분석 → UI 또는 로직 수정 |
| **모두 통과** | 커밋/PR 진행 가능 |

## 검증 루프 (Self-Healing)

```
코드 수정
    ↓
/verify 실행
    ↓
실패 발견? ─Yes→ 에러 분석 → 코드 수정 → (루프)
    │
    No
    ↓
커밋/PR 진행
```

**핵심**: 검증 실패 시 사용자 개입 없이 Claude가 스스로 수정하고 재검증합니다.

## 명령어 레퍼런스

```bash
# 빌드 검증
pnpm build

# 린트 검증
pnpm lint

# 린트 자동 수정
pnpm lint --fix

# 테스트 검증
pnpm test:run

# 특정 테스트만 실행
pnpm test:run <패턴>

# E2E (Playwright MCP 사용)
# browser_navigate → browser_snapshot → 검증
```

## 예시

### 입력
```
/verify
```

### 실행 흐름

```
1. pnpm build
   ✗ 에러: Cannot find module '@/lib/utils'
   → import 경로 수정
   → pnpm build 재실행
   ✓ 빌드 성공

2. pnpm lint
   ✗ 에러: 'useState' is defined but never used
   → 불필요한 import 제거
   → pnpm lint 재실행
   ✓ 린트 통과

3. pnpm test:run
   ✓ 모든 테스트 통과

4. 결과: "검증 완료. 커밋 가능합니다."
```

## 주의사항

- **검증 생략 금지**: 커밋/PR 전에는 반드시 `/verify` 실행
- **수동 개입 최소화**: 가능한 Claude가 스스로 문제 해결
- **루프 제한**: 동일 에러로 3회 이상 실패 시 사용자에게 알림
- **E2E는 선택**: 시간이 오래 걸리므로 중요 변경에만 실행

## E2E 테스트 제한사항

> **OAuth 로그인 불가**: Playwright MCP에서는 Google/Kakao 등 OAuth 로그인이 자동화 불가능합니다.
> - 외부 도메인 리디렉션 + 보안 제약으로 인한 기술적 한계
> - **대안**: 게스트 모드로 테스트 (로그인 없이 IndexedDB만 사용)
> - OAuth가 필요한 기능(동기화, 공유 등)은 수동 테스트 필요
