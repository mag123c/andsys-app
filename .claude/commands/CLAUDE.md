# Commands

## 역할

자주 사용하는 워크플로우를 패턴화한 명령어 템플릿.
Boris 스타일: "프롬프트를 매번 새로 치지 말고, 명령어로 만들어 팀과 공유하세요."

## 파일 구조

| 파일 | 역할 |
|------|------|
| pr.md | PR 생성 워크플로우 (검증 → 푸시 → PR 생성) |
| e2e.md | E2E 테스트 워크플로우 (Playwright MCP 기반) |

## 사용법

Commands는 Claude Code의 `/` 명령어로 직접 호출 가능:
- 터미널에서 `claude` 실행 후 `/pr` 입력

또는 Skills 내에서 참조:
- `/task` 워크플로우의 Phase 4에서 `/pr` 참조

## 의존성

- Playwright MCP (e2e.md)
- GitHub CLI `gh` (pr.md)
- `/verify` 스킬 (pr.md 사전 조건)

---
최종 수정: 2026-01-05
