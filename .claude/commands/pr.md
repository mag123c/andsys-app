# PR 생성 워크플로우

PR 생성 전 자동 검증 및 생성을 수행합니다.

## 실행 순서

```bash
# 1. 검증 실행
/verify

# 2. 변경사항 확인
git status
git diff --stat main...HEAD

# 3. 커밋 정리 (필요시)
git log --oneline main...HEAD

# 4. 푸시
git push -u origin $(git branch --show-current)

# 5. PR 생성
gh pr create --title "{제목}" --body "## Summary
- 변경사항 요약

## Test Plan
- [ ] 테스트 항목

## Checklist
- [ ] 빌드 통과
- [ ] 린트 통과
- [ ] 테스트 통과"
```

## PR 템플릿

```markdown
## Summary
{1-3줄 요약}

## Changes
- {변경사항 1}
- {변경사항 2}

## Test Plan
- [ ] 빌드 검증 (pnpm build)
- [ ] 린트 검증 (pnpm lint)
- [ ] 테스트 검증 (pnpm test:run)
- [ ] E2E 검증 (필요시)

## Screenshots
{UI 변경 시 스크린샷}
```
