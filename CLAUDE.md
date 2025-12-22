# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Andsys - 웹소설 작가를 위한 오프라인 우선(Local-First) 글쓰기 플랫폼.

## Commands

```bash
pnpm dev                  # 개발 서버 (Turbopack)
pnpm build                # 빌드
pnpm lint                 # ESLint 실행
pnpm test                 # Vitest watch 모드
pnpm test:run             # 테스트 1회 실행
pnpm test:run <파일패턴>   # 특정 테스트 실행 (예: pnpm test:run project)
pnpm supabase:start       # 로컬 Supabase (Docker 필요)
pnpm supabase:stop        # Supabase 종료
pnpm supabase:reset       # DB 초기화 + 마이그레이션
```

## Architecture

```
IndexedDB (로컬) ←→ SyncEngine ←→ Supabase (서버)
```

### 데이터 계층
```
컴포넌트/훅 → Repository (인터페이스) → SyncEngine → Local (Dexie) / Remote (Supabase)
```

- **Repository 패턴**: Supabase 직접 호출 금지, `src/repositories/` 인터페이스 통해 접근
- **Server Actions**: `src/actions/`에 분리, 입력 검증 필수, 반환 데이터 최소화
- **오프라인 우선**: 저장 시 IndexedDB 먼저 → 온라인이면 2초 debounce 후 Supabase 동기화

### 주요 폴더 구조
```
src/
├── app/                  # Next.js App Router (page, layout)
├── components/
│   ├── ui/               # shadcn/ui 컴포넌트
│   ├── features/         # 도메인별 컴포넌트 (editor/, project/, chapter/)
│   └── providers/        # Context Providers
├── repositories/         # 데이터 인터페이스 + 타입 정의
├── storage/
│   ├── local/            # IndexedDB 구현 (Dexie)
│   └── remote/           # Supabase 클라이언트
├── hooks/                # 커스텀 훅
├── actions/              # Server Actions ("use server")
└── lib/                  # 유틸리티, 상수
```

## 핵심 규칙

1. **RSC 보안**: Server Action에서 민감 데이터 반환 금지, 필요한 필드만 명시적 반환
2. **오프라인 우선**: 모든 저장은 IndexedDB 먼저, syncStatus 추적
3. **게스트 = 로컬 전용**: 게스트는 서버 동기화 없음 (IndexedDB만), 회원만 Supabase 동기화
4. **커밋**: Conventional Commits, Co-Author/Claude 마킹 금지

## Tech Stack

Next.js 16 (App Router, Turbopack) + React 19 + shadcn/ui + Tailwind CSS 4 + Supabase + Dexie.js (IndexedDB) + Vitest

## Documentation

| 문서 | 용도 |
|------|------|
| `docs/TASK.md` | 작업 현황 |
| `docs/PLANNING.md` | MVP 기능, 로드맵 |
| `docs/SCHEMA.md` | DB 스키마 (Supabase + IndexedDB) |
| `docs/ARCHITECTURE.md` | 상세 아키텍처, 동기화 전략 |
| `docs/DESIGN.md` | 디자인/UX 가이드 |

## Skills

| 스킬 | 용도 | 호출 |
|------|------|------|
| `/task` | 전체 워크플로우 (분석→구현→리뷰→커밋) | 모든 작업의 시작점 |
| `/developer` | 기능 개발 | 데이터 계층, 로직 |
| `/frontend` | RSC, SEO, 컴포넌트 | UI, Provider |
| `/reviewer` | 코드 리뷰 | 구현 후 검토 |

### /task 워크플로우

```
/task "작업 설명"
  → 분석 (타입, 브랜치, 영향 파일)
  → 구현 (/developer, /frontend)
  → 리뷰 (/reviewer) → 이슈 시 수정 루프
  → 마무리 (빌드 확인, 커밋, 문서 업데이트)
```
