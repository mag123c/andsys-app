# 아키텍처 문서

## 기술 스택

| 항목 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | Next.js 16 (App Router, Turbopack) | SSR/SSG, 파일 기반 라우팅 |
| React | React 19 | 최신 기능 활용 |
| UI 컴포넌트 | shadcn/ui | 커스터마이징 자유도, Tailwind 기반 |
| 스타일링 | Tailwind CSS 4 | 빠른 개발, 일관된 디자인 |
| 에디터 | Tiptap 3.14.0 | 순수 Tiptap (Novel 제거), 완전한 제어 |
| 로컬 저장소 | IndexedDB (Dexie.js) | 오프라인 우선, 대용량 데이터 |
| 백엔드/DB | Supabase | PostgreSQL + Auth + Realtime |
| 호스팅 | Vercel | Next.js 최적화, 무료 티어 |
| 테스트 | Vitest 4 | 빠른 실행, Vite 호환 |
| 상태관리 | React Context + Hooks | 단순함, 추가 라이브러리 불필요 |

---

## 핵심 아키텍처: 오프라인 우선 (Local-First)

```
┌─────────────────────────────────────────────────────────────┐
│                        클라이언트                           │
│  ┌─────────┐    ┌─────────────┐    ┌──────────────────┐    │
│  │  React  │───▶│  SyncEngine │───▶│    IndexedDB     │    │
│  │   UI    │    │  (동기화)   │    │  (Dexie.js)      │    │
│  └─────────┘    └──────┬──────┘    └──────────────────┘    │
│                        │                                    │
└────────────────────────┼────────────────────────────────────┘
                         │ 온라인 시
                         ▼
              ┌──────────────────────┐
              │      Supabase        │
              │  (PostgreSQL + Auth) │
              └──────────────────────┘
```

### 동기화 전략

```typescript
// 저장 흐름
1. 사용자 입력 발생
2. 즉시 IndexedDB 저장 (optimistic)
3. 저장 상태: "저장됨"
4. 온라인이면:
   - 2초 debounce 후 Supabase 동기화
   - 성공: 동기화 완료
   - 실패: 재시도 큐에 추가
5. 오프라인이면:
   - 로컬만 저장
   - pendingSync 플래그 설정
   - 온라인 복귀 시 자동 동기화
```

---

## 프로젝트 구조

```
4ndsys-project/
├── .claude/               # Claude 스킬
│   └── skills/
│       ├── developer/
│       └── reviewer/
├── docs/                  # 문서
│   ├── PLANNING.md
│   ├── ARCHITECTURE.md
│   ├── SCHEMA.md
│   └── TASK.md
└── src/                   # 소스코드
```

---

## 폴더 구조 (src/)

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # 랜딩 페이지
│   ├── layout.tsx                # 루트 레이아웃
│   ├── (auth)/                   # 인증 관련 (그룹)
│   │   ├── login/
│   │   ├── signup/
│   │   └── forgot-password/
│   ├── projects/                 # 소설 관련
│   │   ├── page.tsx              # 소설 목록
│   │   └── [projectId]/
│   │       ├── page.tsx          # 소설 상세 (리다이렉트)
│   │       └── chapters/
│   │           └── [chapterId]/
│   │               └── page.tsx  # 에디터 페이지
│   ├── settings/                 # 설정
│   └── api/                      # API 라우트 (필요시)
│
├── components/
│   ├── ui/                       # shadcn 컴포넌트
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── features/                 # 도메인 컴포넌트
│   │   ├── editor/               # 에디터 관련
│   │   │   ├── Editor.tsx
│   │   │   ├── EditorToolbar.tsx
│   │   │   └── SaveStatus.tsx
│   │   ├── project/              # 소설 관련
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── ProjectList.tsx
│   │   │   └── CreateProjectDialog.tsx
│   │   ├── chapter/              # 챕터 관련
│   │   │   ├── ChapterList.tsx
│   │   │   ├── ChapterItem.tsx
│   │   │   └── CreateChapterDialog.tsx
│   │   └── auth/                 # 인증 관련
│   │       ├── LoginForm.tsx
│   │       └── SignupForm.tsx
│   ├── layouts/                  # 레이아웃
│   │   ├── EditorLayout.tsx      # 에디터 페이지 레이아웃
│   │   ├── DashboardLayout.tsx   # 대시보드 레이아웃
│   │   └── Sidebar.tsx
│   └── providers/                # Context Providers
│       ├── ThemeProvider.tsx
│       ├── AuthProvider.tsx
│       └── SyncProvider.tsx
│
├── repositories/                 # 데이터 추상화 계층
│   ├── types/
│   │   ├── project.ts
│   │   ├── chapter.ts
│   │   └── user.ts
│   ├── project.repository.ts
│   ├── chapter.repository.ts
│   └── user.repository.ts
│
├── storage/                      # 저장소 구현체
│   ├── local/                    # IndexedDB 구현
│   │   ├── db.ts                 # Dexie 설정
│   │   ├── project.local.ts
│   │   └── chapter.local.ts
│   └── remote/                   # Supabase 구현
│       ├── client.ts
│       ├── project.remote.ts
│       └── chapter.remote.ts
│
├── sync/                         # 동기화 엔진
│   ├── SyncEngine.ts             # 동기화 로직
│   ├── ConflictResolver.ts       # 충돌 해결
│   └── RetryQueue.ts             # 재시도 큐
│
├── hooks/                        # 커스텀 훅
│   ├── useAuth.ts
│   ├── useProject.ts
│   ├── useChapter.ts
│   ├── useEditor.ts
│   ├── useSync.ts
│   ├── useOnline.ts
│   └── useLocalStorage.ts
│
├── lib/                          # 유틸리티
│   ├── di.ts                     # 의존성 주입
│   ├── utils.ts                  # 공통 유틸
│   └── constants.ts              # 상수
│
└── __tests__/                    # 테스트
    ├── setup.ts
    └── ...
```

---

## 데이터 계층 구조

### Repository 패턴 + 오프라인 우선

```
┌─────────────────┐
│   컴포넌트/훅   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Repository    │  ← 인터페이스 (추상화)
│   Interface     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   SyncEngine    │  ← 로컬/리모트 조율
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌────────┐
│ Local │ │ Remote │
│(Dexie)│ │(Supa)  │
└───────┘ └────────┘
```

### Repository 인터페이스 예시

```typescript
// repositories/chapter.repository.ts
export interface ChapterRepository {
  // 조회
  getById(id: string): Promise<Chapter | null>;
  getByProjectId(projectId: string): Promise<Chapter[]>;

  // 생성/수정/삭제
  create(data: CreateChapterInput): Promise<Chapter>;
  update(id: string, data: UpdateChapterInput): Promise<Chapter>;
  delete(id: string): Promise<void>;

  // 순서 변경
  reorder(projectId: string, chapterIds: string[]): Promise<void>;
}
```

### SyncEngine 역할

```typescript
// sync/SyncEngine.ts
class SyncEngine {
  // 저장: 로컬 먼저, 리모트는 백그라운드
  async save(entity: Entity): Promise<void> {
    await this.local.save(entity);

    if (this.isOnline) {
      this.scheduleRemoteSync(entity);
    } else {
      this.markPendingSync(entity);
    }
  }

  // 온라인 복귀 시 호출
  async syncPending(): Promise<void> {
    const pending = await this.local.getPending();
    for (const entity of pending) {
      await this.remote.save(entity);
      await this.local.clearPending(entity.id);
    }
  }
}
```

---

## 에디터 구조

### Tiptap 에디터 통합

```typescript
// components/features/editor/Editor.tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { editorExtensions } from "./extensions";
import { EditorToolbar } from "./EditorToolbar";

export function Editor({ initialContent, onUpdate }) {
  const editor = useEditor({
    extensions: editorExtensions,
    content: initialContent,
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getJSON());
    },
  });

  return (
    <div>
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
```

### 에디터 확장 (extensions.ts)

```typescript
// 소설 에디터에 필요한 기능만 활성화
export const editorExtensions = [
  StarterKit.configure({
    // 마크다운 기능 비활성화 (소설에 불필요)
    heading: false,
    bulletList: false,
    orderedList: false,
    blockquote: false,
    codeBlock: false,
  }),
  Underline,
  TextStyle,
  FontFamily,  // 폰트 선택
  TextAlign,   // 텍스트 정렬
];
```

### 사용 가능한 폰트

| 분류 | 폰트명 |
|------|--------|
| 고딕 | Pretendard, 본고딕, 나눔스퀘어 네오, Gmarket Sans |
| 명조 | 리디바탕, 본명조, 마루 부리 |

---

## 오프라인 지원 구현

### Dexie.js (IndexedDB 래퍼)

```typescript
// storage/local/db.ts
import Dexie from "dexie";

export class AppDatabase extends Dexie {
  projects!: Table<LocalProject>;
  chapters!: Table<LocalChapter>;
  syncQueue!: Table<SyncQueueItem>;

  constructor() {
    super("4ndsys");
    this.version(1).stores({
      projects: "id, updatedAt, pendingSync",
      chapters: "id, projectId, order, updatedAt, pendingSync",
      syncQueue: "++id, entityType, entityId, operation, createdAt",
    });
  }
}

export const db = new AppDatabase();
```

### 온라인 상태 감지

```typescript
// hooks/useOnline.ts
"use client";

import { useSyncExternalStore } from "react";

export function useOnline() {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener("online", callback);
      window.addEventListener("offline", callback);
      return () => {
        window.removeEventListener("online", callback);
        window.removeEventListener("offline", callback);
      };
    },
    () => navigator.onLine,
    () => true // SSR fallback
  );
}
```

---

## 인증 구조

### 게스트 모드 + Supabase Auth

```
┌─────────────────────────────────────────┐
│              사용자 상태                 │
├─────────────────────────────────────────┤
│  1. 게스트 (비로그인)                   │
│     - 로컬 저장만 사용 (서버 동기화 X)   │
│     - guestId 생성 (UUID, IndexedDB)    │
│                                         │
│  2. 회원 (로그인)                       │
│     - 로컬 + 서버 동기화                │
│     - 게스트 데이터 마이그레이션 옵션    │
└─────────────────────────────────────────┘
```

### 게스트 = 로컬 전용 정책

| 모드 | 저장소 | 데이터 복구 |
|------|--------|-------------|
| 게스트 | IndexedDB만 | ❌ (브라우저 삭제 시 유실) |
| 회원 | IndexedDB + Supabase | ✅ (로그인하면 복구) |

**이유**:
- guestId가 IndexedDB에 저장됨 → 브라우저 데이터 삭제 시 guestId 유실
- 서버에 데이터가 있어도 guestId 없으면 복구 불가능 → 서버 저장 무의미
- 명확한 구분: "백업 원하면 가입하세요" → 가입 동기 부여

**UX 흐름**:
```
게스트로 글쓰기 → 저장됨 (로컬)
    ↓
"데이터를 안전하게 보관하려면 가입하세요" 안내
    ↓
가입 시 로컬 데이터 → 서버로 마이그레이션
```

### AuthProvider

```typescript
// components/providers/AuthProvider.tsx
type AuthState =
  | { status: "guest"; guestId: string }
  | { status: "authenticated"; user: User }
  | { status: "loading" };
```

---

## 테마 시스템

### next-themes 사용

```typescript
// components/providers/ThemeProvider.tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
    >
      {children}
    </NextThemesProvider>
  );
}
```

---

## 주요 의존성

```json
{
  "dependencies": {
    "next": "16.1.0",
    "react": "19.2.3",
    "@tiptap/react": "^3.14.0",
    "@tiptap/starter-kit": "^3.14.0",
    "@tiptap/extension-font-family": "^3.14.0",
    "@tiptap/extension-text-align": "^3.14.0",
    "@tiptap/extension-underline": "^3.14.0",
    "dexie": "^4.2.1",
    "@supabase/supabase-js": "^2.89.0",
    "next-themes": "^0.4.6",
    "lucide-react": "^0.562.0",
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0"
  },
  "devDependencies": {
    "tailwindcss": "^4",
    "typescript": "^5",
    "vitest": "^4.0.16",
    "@testing-library/react": "^16.3.1"
  }
}
```

---

## 환경 구성

### 환경 분리

| 환경 | 파일 | Supabase | 용도 |
|------|------|----------|------|
| local | `.env.local` | Docker (로컬) | 개발 |
| production | Vercel 환경변수 | Supabase Cloud | 운영 |

### 로컬 개발 환경

```bash
# Supabase CLI로 로컬 Docker 인스턴스 실행
pnpm supabase start

# 환경 변수 설정
cp .env.local.example .env.local
```

```env
# .env.local (Docker Supabase)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 운영 환경

```env
# Vercel 환경 변수로 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 배포

### Vercel 설정

```json
// vercel.json (필요시)
{
  "framework": "nextjs"
}
```

### 배포 프로세스

1. 로컬에서 개발 및 테스트 (Docker Supabase)
2. `pnpm build`로 빌드 검증
3. Git push → Vercel 자동 배포
4. Vercel Dashboard에서 운영 환경 변수 설정
