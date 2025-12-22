---
name: developer
description: 기능 개발 스킬. Repository 패턴, 태스크 프로세스, 코드 컨벤션. 코드 작성 시 사용.
---

# Developer Skill

## 기술 스택

Next.js (App Router) + shadcn/ui + Tailwind + Supabase + Dexie.js + Vitest

## 설계 원칙

- **YAGNI**: 현재 필요한 기능만 구현
- **KISS**: 가장 단순한 해결책 선택
- **SRP**: 하나의 컴포넌트 = 하나의 책임

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
