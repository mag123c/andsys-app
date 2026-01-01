---
name: developer
description: 기능 개발 스킬. Repository 패턴, 태스크 프로세스, 코드 컨벤션. 코드 작성 시 사용.
---

# Developer Skill

## 기술 스택

Next.js (App Router) + shadcn/ui + Tailwind + Supabase + Dexie.js + Vitest

## 코드 철학 (Kent Beck Style)

### OOP + FP 하이브리드
```
구조 = 클래스/인터페이스 (OOP)
로직 = 순수 함수 (FP)
```

| 원칙 | 적용 |
|------|------|
| **SRP** | 하나의 함수/클래스 = 하나의 책임 |
| **순수 함수** | 입력 → 출력만, 사이드 이펙트는 경계에서 |
| **불변성** | 객체 수정 대신 새 객체 반환 |
| **명확한 의도** | 이름이 곧 문서, 주석 최소화 |

### YAGNI + KISS + 미래지향
- **YAGNI**: 지금 필요없는 기능은 만들지 않음
- **KISS**: 가장 단순한 해결책 선택
- **미래지향**: 확장 포인트(인터페이스)는 미리 설계
- **성능**: 측정 가능한 병목은 즉시 최적화

## Repository 패턴

Supabase 직접 호출 금지. 반드시 Repository 통해 접근:

```
src/
├── repositories/          # 인터페이스 + 타입
├── storage/local/         # Dexie 구현체
├── storage/remote/        # Supabase 구현체
└── lib/di.ts              # 의존성 주입
```

## 태스크 프로세스

1. **분석**: 영향받는 파일 식별, 기존 패턴 파악
2. **구현**: 코드 읽고 확인 후 수정, 추측 금지
3. **테스트**: 필요한 테스트만 작성
4. **검토**: YAGNI/KISS 위반 확인
5. **커밋**: Conventional Commits, Claude 마킹 금지
6. **문서**: docs/ 체크리스트 업데이트

## 서버/클라이언트 분리

```
서버: 데이터 페칭, 민감 정보, SEO 콘텐츠
클라이언트 ("use client"): 훅, 이벤트, 브라우저 API, 인터랙티브 UI
```

## 에디터 규칙

- Novel (Tiptap 기반) 사용
- 자동저장: 2초 debounce
- 저장 상태 표시 필수

> 상세 구현은 기존 코드베이스 분석
