# DB 스키마 설계

## 개요

### 저장소 구조
- **로컬 (IndexedDB)**: 오프라인 우선, 즉시 저장
- **리모트 (Supabase PostgreSQL)**: 동기화, 백업, 멀티 디바이스

### 동기화 원칙
1. 로컬이 Source of Truth (작업 중)
2. 리모트는 백업 + 동기화 용도
3. 충돌 시 최신 updatedAt 우선

---

## 테이블 구조 (Supabase)

### users (Supabase Auth 확장)

```sql
-- Supabase Auth의 auth.users를 확장
-- profiles 테이블로 추가 정보 저장

profiles
├── id (uuid, PK, FK → auth.users.id)
├── display_name (text, nullable)
├── created_at (timestamptz)
├── updated_at (timestamptz)
```

### projects (소설)

```sql
projects
├── id (uuid, PK, DEFAULT gen_random_uuid())
├── user_id (uuid, FK → auth.users.id, nullable)  -- 게스트는 null
├── guest_id (uuid, nullable)                      -- 게스트 식별자
├── title (text, NOT NULL)
├── description (text, nullable)
├── genre (text, nullable)                         -- 장르 태그
├── status (text, DEFAULT 'active')                -- active, archived, deleted
├── deleted_at (timestamptz, nullable)             -- soft delete
├── created_at (timestamptz, DEFAULT now())
├── updated_at (timestamptz, DEFAULT now())
│
├── INDEX (user_id)
├── INDEX (guest_id)
├── INDEX (updated_at DESC)
├── CHECK (user_id IS NOT NULL OR guest_id IS NOT NULL)  -- 둘 중 하나는 필수
```

### chapters (챕터/회차)

```sql
chapters
├── id (uuid, PK, DEFAULT gen_random_uuid())
├── project_id (uuid, FK → projects.id, ON DELETE CASCADE)
├── title (text, NOT NULL)
├── content (jsonb, DEFAULT '{}')                  -- Tiptap JSON 포맷
├── content_text (text, nullable)                  -- 검색/통계용 평문
├── word_count (int, DEFAULT 0)                    -- 글자수 캐시
├── "order" (int, NOT NULL)                        -- 정렬 순서
├── status (text, DEFAULT 'draft')                 -- draft, published
├── created_at (timestamptz, DEFAULT now())
├── updated_at (timestamptz, DEFAULT now())
│
├── INDEX (project_id)
├── INDEX (project_id, "order")
├── INDEX (updated_at DESC)
```

### sync_log (동기화 로그)

```sql
-- 동기화 충돌 해결 및 디버깅용
sync_log
├── id (uuid, PK, DEFAULT gen_random_uuid())
├── user_id (uuid, FK → auth.users.id, nullable)
├── entity_type (text, NOT NULL)                   -- 'project', 'chapter'
├── entity_id (uuid, NOT NULL)
├── operation (text, NOT NULL)                     -- 'create', 'update', 'delete'
├── client_updated_at (timestamptz)                -- 클라이언트 타임스탬프
├── server_updated_at (timestamptz, DEFAULT now())
├── conflict_resolved (boolean, DEFAULT false)
├── metadata (jsonb, nullable)                     -- 추가 정보
│
├── INDEX (user_id)
├── INDEX (entity_type, entity_id)
├── INDEX (server_updated_at DESC)
```

---

## 로컬 스키마 (IndexedDB / Dexie)

### projects (로컬)

```typescript
interface LocalProject {
  id: string;                    // UUID
  userId: string | null;         // 로그인 사용자
  guestId: string | null;        // 게스트 사용자
  title: string;
  description: string | null;
  genre: string | null;
  status: "active" | "archived" | "deleted";
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // 동기화 메타데이터
  syncStatus: "synced" | "pending" | "conflict";
  lastSyncedAt: Date | null;
}
```

### chapters (로컬)

```typescript
interface LocalChapter {
  id: string;                    // UUID
  projectId: string;
  title: string;
  content: JSONContent;          // Tiptap JSON
  contentText: string | null;    // 평문 (검색용)
  wordCount: number;
  order: number;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;

  // 동기화 메타데이터
  syncStatus: "synced" | "pending" | "conflict";
  lastSyncedAt: Date | null;
}
```

### syncQueue (동기화 대기열)

```typescript
interface SyncQueueItem {
  id?: number;                   // auto-increment
  entityType: "project" | "chapter";
  entityId: string;
  operation: "create" | "update" | "delete";
  payload: unknown;              // 저장할 데이터
  attempts: number;              // 재시도 횟수
  lastAttemptAt: Date | null;
  createdAt: Date;
}
```

---

## Dexie 스키마 정의

```typescript
// storage/local/db.ts
import Dexie, { Table } from "dexie";

export class AppDatabase extends Dexie {
  projects!: Table<LocalProject>;
  chapters!: Table<LocalChapter>;
  syncQueue!: Table<SyncQueueItem>;
  settings!: Table<LocalSettings>;

  constructor() {
    super("4ndsys");

    this.version(1).stores({
      // 인덱스 정의 (id는 PK로 자동)
      projects: "id, userId, guestId, updatedAt, syncStatus",
      chapters: "id, projectId, [projectId+order], updatedAt, syncStatus",
      syncQueue: "++id, entityType, entityId, createdAt",
      settings: "key",
    });
  }
}

export const db = new AppDatabase();
```

---

## RLS (Row Level Security) 정책

### projects 테이블

```sql
-- RLS 활성화
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 정책: 본인 프로젝트만 조회
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (
    auth.uid() = user_id
    OR (auth.uid() IS NULL AND guest_id IS NOT NULL)  -- 게스트 허용 (클라이언트에서 필터링)
  );

-- 정책: 본인 프로젝트만 생성
CREATE POLICY "Users can create own projects"
  ON projects FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR (auth.uid() IS NULL AND user_id IS NULL)  -- 게스트 허용
  );

-- 정책: 본인 프로젝트만 수정
CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 정책: 본인 프로젝트만 삭제
CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);
```

### chapters 테이블

```sql
-- RLS 활성화
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

-- 정책: 본인 프로젝트의 챕터만 접근
CREATE POLICY "Users can access own chapters"
  ON chapters FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = chapters.project_id
      AND projects.user_id = auth.uid()
    )
  );
```

---

## 트리거 및 함수

### updated_at 자동 갱신

```sql
-- 함수 정의
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- projects 트리거
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- chapters 트리거
CREATE TRIGGER chapters_updated_at
  BEFORE UPDATE ON chapters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### 글자수 자동 계산

```sql
-- content_text에서 글자수 계산
CREATE OR REPLACE FUNCTION update_word_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.content_text IS NOT NULL THEN
    NEW.word_count = char_length(regexp_replace(NEW.content_text, '\s', '', 'g'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chapters_word_count
  BEFORE INSERT OR UPDATE ON chapters
  FOR EACH ROW
  EXECUTE FUNCTION update_word_count();
```

---

## 게스트 → 회원 마이그레이션

### 마이그레이션 RPC

```sql
-- 게스트 데이터를 회원 계정으로 이전
CREATE OR REPLACE FUNCTION migrate_guest_data(p_guest_id uuid)
RETURNS void AS $$
BEGIN
  -- projects 이전
  UPDATE projects
  SET user_id = auth.uid(),
      guest_id = NULL,
      updated_at = now()
  WHERE guest_id = p_guest_id;

  -- 연관 chapters는 CASCADE로 자동 처리됨
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 동기화 충돌 해결

### 충돌 시나리오

```
1. 클라이언트 A: 오프라인에서 수정 (updatedAt: 10:00)
2. 클라이언트 B: 온라인에서 수정 (updatedAt: 10:05)
3. 클라이언트 A: 온라인 복귀, 동기화 시도

→ 충돌 발생: 서버(10:05) vs 클라이언트(10:00)
```

### 해결 전략

```typescript
// sync/ConflictResolver.ts
type ConflictStrategy = "server-wins" | "client-wins" | "latest-wins" | "manual";

function resolveConflict(local: Entity, remote: Entity): Entity {
  // 기본: 최신 버전 우선
  if (local.updatedAt > remote.updatedAt) {
    return local;
  }
  return remote;
}
```

### MVP에서는 "latest-wins" 전략 사용
- 간단하고 예측 가능
- 차후 수동 충돌 해결 UI 추가 가능

---

## 스키마 버전 관리

### Supabase Migrations

```
supabase/migrations/
├── 20240101000000_create_profiles.sql
├── 20240101000001_create_projects.sql
├── 20240101000002_create_chapters.sql
├── 20240101000003_create_sync_log.sql
└── 20240101000004_create_rls_policies.sql
```

### Dexie 버전 업그레이드

```typescript
// storage/local/db.ts
this.version(1).stores({
  projects: "id, userId, guestId, updatedAt, syncStatus",
  chapters: "id, projectId, [projectId+order], updatedAt, syncStatus",
  syncQueue: "++id, entityType, entityId, createdAt",
});

// 차후 스키마 변경 시
this.version(2).stores({
  // 새 인덱스 추가 등
}).upgrade(tx => {
  // 마이그레이션 로직
});
```

---

## 엔터티 타입 정의

```typescript
// repositories/types/project.ts
export interface Project {
  id: string;
  userId: string | null;
  guestId: string | null;
  title: string;
  description: string | null;
  genre: string | null;
  status: "active" | "archived" | "deleted";
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateProjectInput = Pick<Project, "title"> &
  Partial<Pick<Project, "description" | "genre">>;

export type UpdateProjectInput = Partial<
  Pick<Project, "title" | "description" | "genre" | "status">
>;
```

```typescript
// repositories/types/chapter.ts
import type { JSONContent } from "@tiptap/core";

export interface Chapter {
  id: string;
  projectId: string;
  title: string;
  content: JSONContent;
  contentText: string | null;
  wordCount: number;
  order: number;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
}

export type CreateChapterInput = Pick<Chapter, "projectId" | "title"> &
  Partial<Pick<Chapter, "content">>;

export type UpdateChapterInput = Partial<
  Pick<Chapter, "title" | "content" | "status">
>;
```

---

## 설계 포인트 요약

| 항목 | 설계 | 이유 |
|------|------|------|
| user_id + guest_id | 둘 중 하나 필수 | 게스트 모드 지원 |
| content (jsonb) | Tiptap JSON 저장 | 서식 보존, 유연함 |
| content_text | 평문 별도 저장 | 검색, 글자수 계산 |
| syncStatus (로컬) | 동기화 상태 추적 | 오프라인 우선 |
| soft delete | deleted_at 사용 | 복구 가능, 휴지통 |
| RLS | 모든 테이블 활성화 | 보안 |
