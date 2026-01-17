# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

4ndSYS - 웹소설 작가를 위한 글쓰기 플랫폼. PWA 지원으로 오프라인 작업 가능, 회원가입 시 클라우드 백업.

---

## 용어 정의 (필수 숙지)

| 용어 | 의미 |
|------|------|
| **오프라인** | 인터넷 연결이 없는 상태 (네트워크 끊김) |
| **로컬 모드** | 비로그인 상태. 데이터가 브라우저에만 저장됨. 사이드바에 "로컬" 뱃지 |
| **클라우드 모드** | 로그인 상태. 데이터가 서버에 백업됨. 사이드바에 "클라우드" 뱃지 |
| **PWA** | 앱처럼 설치. 설치 방식의 차이일 뿐, 데이터 안전성은 로그인 여부로 결정 |

### 로그인 기반 동기화 정책

| 상태 | 저장소 | 동기화 | 데이터 안전성 |
|------|--------|--------|--------------|
| 비로그인 (게스트) | IndexedDB만 | 없음 | 브라우저 데이터 삭제 시 복구 불가 |
| 로그인 (회원) | IndexedDB + Supabase | 자동(브라우저)/수동(PWA) | 로그인하면 복구 가능 |

**핵심**: 로그인 여부가 데이터 안전성을 결정. PWA 여부는 동기화 방식만 영향.

---

## AI Context Index

### Knowledge (`.claude/ai-context/`)

지식 문서는 JSON 형식으로 구조화되어 토큰 효율성을 높입니다.

| 문서 | 경로 | 로딩 | 설명 |
|------|------|------|------|
| 도메인 용어 | `domain/glossary.json` | **항상** | 환경 정의, 웹소설 용어 |
| 비즈니스 규칙 | `domain/rules.json` | **항상** | 환경별 동기화 정책, CASCADE_DELETE 등 |
| 엔터티 관계 | `domain/entities.json` | **항상** | 6개 테이블 구조, 필드, 관계 |
| 라우트 구조 | `technical/routes.json` | 필요시 | App Router 5개 그룹 |
| 동기화 흐름 | `technical/sync-flow.json` | sync 작업 | 환경별 동기화 흐름, 수동/자동 동기화 |
| PWA 설정 | `technical/pwa-config.json` | PWA 작업 | 환경별 동작, 컴포넌트, 구현 상태 |
| 에디터 설정 | `technical/editor-config.json` | editor 작업 | Tiptap 확장, 폰트 7개, 자동저장 |
| 스키마 히스토리 | `technical/schema-history.json` | DB 변경 | Dexie v1~v8 마이그레이션 |
| 컴포넌트 맵 | `components/dependency-map.json` | 필요시 | PWA 포함 컴포넌트, 훅 의존성 |
| **디자인 시스템** | `design/paper-ink-redesign.md` | 디자인 작업 | Paper & Ink 리디자인 스펙, 진행 상황 |

### Behavior (`.claude/skills/`)

**스킬 자동 호출 규칙** (필수 준수):

| 트리거 상황 | 필수 스킬 | 이유 |
|-------------|----------|------|
| 코드 변경 요청 시 | `/task` 먼저 호출 | 워크플로우 일관성 |
| Plan Mode 종료 후 구현 시작 | `/task` 호출 | 분석→구현→리뷰 체이닝 |
| 구현 완료 시 | `/reviewer` 자동 호출 | 품질 검증 |
| 커밋/PR 전 | `/verify` 실행 | 빌드/린트/테스트 검증 |

**규칙**: 스킬 호출 없이 직접 코드를 작성하면 안 됩니다. 사용자가 명시적으로 스킬을 호출하지 않아도, Claude가 먼저 적절한 스킬을 호출해야 합니다.

| 스킬 | 용도 |
|------|------|
| `/task` | 전체 워크플로우 오케스트레이션 (분석→구현→리뷰→검증→커밋) |
| `/developer` | 데이터 계층, 로직, Repository, 타입 정의 |
| `/frontend` | RSC 보안, 서버/클라이언트 분리, UI 컴포넌트 |
| `/reviewer` | 코드 리뷰 (버그/보안/성능/가독성) |
| `/verify` | 자체 검증 루프 (빌드/린트/테스트/E2E) |\
| `VS Design Diverge skill` | 디자인 |

### Commands (`.claude/commands/`)

워크플로우 패턴화. 자주 사용하는 명령어를 템플릿화.

| 커맨드 | 용도 |
|--------|------|
| `pr.md` | PR 생성 워크플로우 (검증 → 푸시 → PR) |
| `e2e.md` | E2E 테스트 워크플로우 (Playwright MCP) |

### Selective Loading Rules

**기본 로딩** (모든 세션):
- `glossary.json` - 환경 정의, 도메인 용어
- `rules.json` - 환경별 동기화 정책, 비즈니스 규칙
- `entities.json` - 데이터 구조 이해

**도메인별 추가 로딩**:

| 작업 유형 | 추가 참조 |
|----------|----------|
| Editor 관련 (에디터, 폰트, 자동저장) | `editor-config.json` |
| Sync 관련 (동기화, 충돌, Realtime) | `sync-flow.json` |
| PWA 관련 (설치, 업데이트, 환경별 동기화) | `pwa-config.json` |
| DB 스키마 변경 (Dexie 마이그레이션) | `schema-history.json` |
| 라우트 추가/변경 | `routes.json` |
| 컴포넌트 구조 파악 | `dependency-map.json` |
| **디자인/UI 변경** | `design/paper-ink-redesign.md` |

### Token Estimation

| 세션 유형 | 로딩 파일 | 예상 토큰 |
|----------|----------|----------|
| 일반 작업 | domain/* (3개) | ~2K |
| Editor 작업 | + editor-config | ~2.5K |
| Sync 작업 | + sync-flow | ~3K |
| PWA 작업 | + pwa-config | ~2.5K |
| 전체 분석 | 모든 파일 | ~6K |

---

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
pnpm supabase:migrate     # DB 마이그레이션 적용
pnpm supabase:reset       # DB 초기화 + 마이그레이션
```

---

## Architecture

```
IndexedDB (브라우저) ←→ SyncEngine ←→ Supabase (서버)
                           ↑
                  로그인 여부로 동기화 결정
```

### 로그인 기반 동기화

| 상태 | 저장 | 동기화 |
|------|------|--------|
| 비로그인 (게스트) | IndexedDB only | 없음 |
| 로그인 (브라우저) | IndexedDB + Supabase | 자동 (debounce 2초) |
| 로그인 (PWA) | IndexedDB + Supabase | 수동 버튼 클릭 시 |

### 데이터 계층
```
컴포넌트/훅 → Repository (인터페이스) → Local (Dexie) / Remote (Supabase)
```

- **Repository 패턴**: Supabase 직접 호출 금지, `src/repositories/` 인터페이스 통해 접근
- **로컬 우선 저장**: 모든 저장은 IndexedDB 먼저 (환경 무관)
- **Dexie 스키마 버전**: 현재 v8 → 상세: `ai-context/technical/schema-history.json`

### 주요 폴더 구조
```
src/
├── app/                  # Next.js App Router → 상세: ai-context/technical/routes.json
├── components/
│   ├── ui/               # shadcn/ui 컴포넌트
│   ├── features/         # 도메인별 컴포넌트 → 상세: ai-context/components/dependency-map.json
│   │   └── pwa/          # PWA 관련 (InstallPrompt, UpdatePrompt)
│   └── providers/        # Context Providers
├── repositories/         # 데이터 인터페이스 → 상세: ai-context/domain/entities.json
├── storage/
│   ├── local/            # IndexedDB 구현 (Dexie)
│   └── remote/           # Supabase 클라이언트
├── sync/                 # 동기화 엔진 → 상세: ai-context/technical/sync-flow.json
├── hooks/                # 커스텀 훅 (useLiveQuery, usePWAMode 등)
└── lib/                  # 유틸리티, 상수 (pwa.ts 포함)
```

### 도메인 모델
→ 상세: `ai-context/domain/entities.json`

| 테이블 | 설명 |
|--------|------|
| projects | 소설 프로젝트 (표지 이미지 Base64 저장) |
| chapters | 챕터/회차 (Tiptap JSON, plot 메모) |
| synopses | 시놉시스 (프로젝트당 1개) |
| characters | 등장인물 (커스텀 필드 지원) |
| relationships | 캐릭터 관계도 (양방향 관계 지원) |
| versions | 히스토리 스냅샷 (로컬 전용) |

---

## Core Rules

→ 상세: `ai-context/domain/rules.json`

1. **RSC 보안**: Server Action에서 민감 데이터 반환 금지
2. **로컬 우선 저장**: 모든 저장은 IndexedDB 먼저 (빠른 저장을 위함)
3. **로그인 기반 동기화**: 비로그인=동기화 없음, 로그인 브라우저=자동, 로그인 PWA=수동
4. **비강제 가입**: 가입 없이도 사용 가능. 단, 데이터 안전을 위해 가입 권장
5. **Cascade Delete**: 프로젝트 삭제 시 관련 데이터 함께 삭제
6. **이미지 듀얼 저장**: 로컬(Base64) ↔ 서버(Storage URL)
7. **커밋**: Conventional Commits, Co-Author/Claude 마킹 금지, git -C 금지
8. **디렉토리 문서화**: 새 디렉토리 생성 시 `CLAUDE.md` 작성

---

## Code Philosophy (Kent Beck Style)

### 핵심 원칙
```
OOP + FP 하이브리드: 구조는 클래스/인터페이스, 로직은 순수 함수
```

| 원칙 | 설명 |
|------|------|
| **SRP** | 하나의 모듈 = 하나의 책임 |
| **순수 함수** | 같은 입력 → 같은 출력, 사이드 이펙트 격리 |
| **명확한 의도** | 코드가 곧 문서 |
| **작은 단위** | 함수는 한 가지 일만 |

### YAGNI + KISS + 미래지향
- **YAGNI**: 지금 필요없는 기능은 만들지 않음
- **KISS**: 가장 단순한 해결책 선택
- **미래지향**: 확장 포인트(인터페이스)는 미리 설계
- **성능**: 측정 가능한 병목은 즉시 최적화

---

## Tech Stack

Next.js 16 (App Router, Turbopack) + React 19 + shadcn/ui + Tailwind CSS 4 + Supabase + Dexie.js (IndexedDB) + Tiptap (에디터) + React Flow (관계도 그래프) + Serwist (PWA) + Vitest

---

## Documentation

| 문서 | 용도 |
|------|------|
| `docs/PWA.md` | PWA 스펙 (환경별 동기화, 오프라인 지원) |
| `docs/AI-CONTEXT-OPTIMIZATION.md` | AI Context 최적화 설계 결정 |

> 기타 문서(아키텍처, 스키마, 기획 등)는 `ai-context/` JSON 파일로 대체됨

---

## AI Context 업데이트 규칙

1. ai-context 문서는 코드와 함께 최신 상태를 유지해야 합니다:

    | 변경 사항 | 업데이트 대상 |
    |----------|--------------|
    | 테이블/필드 변경 | `entities.json` |
    | 새 비즈니스 규칙 | `rules.json` |
    | Dexie 버전 변경 | `schema-history.json` |
    | 라우트 추가/변경 | `routes.json` |
    | 에디터 설정 변경 | `editor-config.json` |
    | PWA 관련 변경 | `pwa-config.json` |
    | 새 컴포넌트/훅 추가 | `dependency-map.json` |
    | 새 도메인 용어 | `glossary.json` |
    | 디자인/UI 컴포넌트 변경 | `design/paper-ink-redesign.md` |

2. 필요하다면, 추가적인 문서/JSON을 생성해서 관리하고, 업데이트합니다.
