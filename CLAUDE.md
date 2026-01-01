# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

4ndSYS - 웹소설 작가를 위한 로컬 우선(Local-First) 글쓰기 플랫폼.

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

## Architecture

```
IndexedDB (로컬) ←→ SyncEngine ←→ Supabase (서버)
```

### 데이터 계층
```
컴포넌트/훅 → Repository (인터페이스) → Local (Dexie) / Remote (Supabase)
```

- **Repository 패턴**: Supabase 직접 호출 금지, `src/repositories/` 인터페이스 통해 접근
- **로컬 우선 저장**: 저장 시 IndexedDB 먼저 → 온라인이면 debounce 후 Supabase 동기화
- **Dexie 스키마 버전**: 현재 v7 (projects, chapters, synopses, characters, relationships, versions 테이블)

### 동기화 흐름 (SyncEngine)
```
로컬 저장 → syncStatus: "pending" → SyncEngine.syncAll() → Supabase 업로드 → syncStatus: "synced"
                                                        ↓
                              Supabase Realtime 구독 → 다른 기기 변경 감지 → 로컬 업데이트
```

- **충돌 해결**: Latest-wins (updatedAt 비교)
- **이미지 동기화**: Base64(로컬) → Storage 업로드 → Signed URL(서버)

### 주요 폴더 구조
```
src/
├── app/                  # Next.js App Router (page, layout)
├── components/
│   ├── ui/               # shadcn/ui 컴포넌트
│   ├── features/         # 도메인별 컴포넌트 (editor/, project/, chapter/, character/, relationship/)
│   └── providers/        # Context Providers
├── repositories/         # 데이터 인터페이스 + 타입 정의 (types/ 하위)
├── storage/
│   ├── local/            # IndexedDB 구현 (Dexie) - db.ts가 스키마 정의
│   └── remote/           # Supabase 클라이언트
├── hooks/                # 커스텀 훅 (useProject, useChapters, useCharacters, useSyncEngine 등)
│                         # Dexie useLiveQuery로 IndexedDB 실시간 반응형 구독
└── lib/                  # 유틸리티, 상수
```

### 도메인 모델 (IndexedDB 테이블)
- **projects**: 소설 프로젝트 (표지 이미지 Base64 저장)
- **chapters**: 챕터/회차 (Tiptap JSON content)
- **synopses**: 시놉시스 (프로젝트당 1개)
- **characters**: 등장인물 (커스텀 필드 지원)
- **relationships**: 캐릭터 관계도 (양방향 관계 지원)
- **versions**: 히스토리 스냅샷 (synopsis, character용)

## 코드 철학 (Kent Beck Style)

### 핵심 원칙
```
OOP + FP 하이브리드: 구조는 클래스/인터페이스, 로직은 순수 함수
```

| 원칙 | 설명 |
|------|------|
| **SRP** | 하나의 모듈 = 하나의 책임. 변경 이유가 하나뿐이어야 함 |
| **순수 함수** | 같은 입력 → 같은 출력, 사이드 이펙트 격리 |
| **명확한 의도** | 코드가 곧 문서. 이름만으로 역할이 드러나야 함 |
| **작은 단위** | 함수는 한 가지 일만, 커밋도 한 가지 변경만 |

### YAGNI + KISS + 미래지향
- **YAGNI**: 지금 필요없는 기능은 만들지 않음
- **KISS**: 가장 단순한 해결책 선택
- **미래지향**: 단, 확장 포인트(인터페이스, 추상화)는 미리 설계
- **성능 최적화**: 측정 가능한 병목은 즉시 개선

### 코드 스타일
```typescript
// Good: 순수 함수 + 명확한 의도
function calculateWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// Good: 인터페이스로 확장 포인트 확보
interface Repository<T> {
  getById(id: string): Promise<T | null>;
  save(entity: T): Promise<void>;
}

// Bad: 여러 책임 혼합
function saveAndNotify(data) { /* 저장 + 알림 + 로깅... */ }
```

## 핵심 규칙

1. **RSC 보안**: Server Action에서 민감 데이터 반환 금지, 필요한 필드만 명시적 반환
2. **로컬 우선 저장**: 모든 저장은 IndexedDB 먼저, syncStatus 추적
3. **게스트 = 로컬 전용**: 게스트는 서버 동기화 없음 (IndexedDB만), 회원만 Supabase 동기화
4. **Cascade Delete**: 프로젝트 삭제 시 관련 데이터(chapters, synopses, characters, relationships, versions) 함께 삭제
5. **커밋**: Conventional Commits, Co-Author/Claude 마킹 금지, git -C 명령어 사용 금지
6. **디렉토리 문서화**: 새 디렉토리 생성 시 `CLAUDE.md` 작성 (역할, 파일 설명, 최종 수정일)

## Tech Stack

Next.js 16 (App Router, Turbopack) + React 19 + shadcn/ui + Tailwind CSS 4 + Supabase + Dexie.js (IndexedDB) + Tiptap (에디터) + React Flow (관계도 그래프) + Vitest

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
