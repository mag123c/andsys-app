# 회차 공유 링크 기능

## 개요

### 기능 소개

특정 회차를 임시 URL로 공유하여 다른 작가들에게 피드백을 받을 수 있는 기능.

### 목적

- 베타리더, 첨삭 요청 등 작가 간 피드백 교환 지원
- 전체 작품 노출 없이 특정 회차만 안전하게 공유
- 만료 시간 설정으로 프라이버시 보호

### 설계 원칙

| 원칙 | 설명 |
|------|------|
| **링크 도구** | 4ndSYS는 링크만 생성, 피드백은 외부(카톡, 디스코드 등)에서 |
| **심플함 유지** | 댓글, 좋아요, 팔로우 등 소셜 기능 배제 |
| **프라이버시** | 만료 시간 + 선택적 비밀번호로 보호 |
| **로컬 우선 철학 유지** | 공유는 선택적 기능, 기본은 여전히 로컬 저장 |

---

## 요구사항

### 기능 요구사항

| ID | 기능 | 설명 | 우선순위 |
|----|------|------|----------|
| F-01 | 공유 링크 생성 | 특정 회차 선택 → 고유 URL 생성 | P0 |
| F-02 | 만료 시간 설정 | 1시간/24시간/7일/30일/무제한 | P0 |
| F-03 | 비밀번호 설정 | 선택적, 4~20자 | P1 |
| F-04 | 공유 링크 목록 | 내가 생성한 링크 관리 | P0 |
| F-05 | 링크 비활성화 | 만료 전 수동 취소 | P0 |
| F-06 | 읽기 전용 뷰어 | 공유 페이지에서 내용만 표시 (편집 불가) | P0 |
| F-07 | 조회수 표시 | 링크가 몇 번 열렸는지 (선택적) | P2 |
| F-08 | 링크 복사 | 클립보드 복사 버튼 | P0 |

### 비기능 요구사항

| ID | 항목 | 설명 |
|----|------|------|
| NF-01 | 보안 | 추측 불가능한 URL (UUID v4 또는 nanoid) |
| NF-02 | 성능 | 공유 페이지 로딩 < 2초 |
| NF-03 | 접근성 | 로그인 없이 공유 링크 접근 가능 |
| NF-04 | 제한 | 회원만 링크 생성 가능 (게스트 제외) |
| NF-05 | 정리 | 만료된 링크 자동 삭제 (일일 배치 또는 접근 시) |

---

## 사용자 플로우

### 링크 생성 플로우

```
에디터에서 회차 작성 중
    ↓
우측 상단 "공유" 버튼 클릭
    ↓
┌─────────────────────────────────────┐
│         회차 공유 설정               │
├─────────────────────────────────────┤
│ 만료 시간: [24시간 ▼]               │
│ 비밀번호: [ ] 설정하기              │
│            [________]               │
├─────────────────────────────────────┤
│        [링크 생성하기]              │
└─────────────────────────────────────┘
    ↓
링크 생성 완료 → 클립보드 자동 복사
    ↓
카톡, 디스코드 등에서 공유
```

### 링크 접근 플로우

```
공유 받은 사람이 링크 클릭
    ↓
비밀번호 있으면 → 비밀번호 입력 화면
    ↓
┌─────────────────────────────────────┐
│ [소설 제목] - [회차 제목]           │
├─────────────────────────────────────┤
│                                     │
│         회차 내용 (읽기 전용)        │
│                                     │
├─────────────────────────────────────┤
│ 📖 X자 | 🕐 2024.01.15에 공유됨     │
│ ⏰ 23시간 후 만료                   │
└─────────────────────────────────────┘
```

### 링크 관리 플로우

```
설정 > 공유 링크 관리
    ↓
┌─────────────────────────────────────────────────────┐
│ 내 공유 링크                                         │
├─────────────────────────────────────────────────────┤
│ 📄 1화: 프롤로그                                     │
│    만료: 22시간 후 | 조회: 5회 | [복사] [삭제]       │
├─────────────────────────────────────────────────────┤
│ 📄 3화: 첫 만남                                      │
│    만료: 6일 후 | 조회: 12회 | [복사] [삭제]         │
├─────────────────────────────────────────────────────┤
│ 📄 5화: 결전 (만료됨)                                │
│    만료됨 | 조회: 8회 | [삭제]                       │
└─────────────────────────────────────────────────────┘
```

---

## 화면 설계

### 1. 공유 버튼 위치

에디터 헤더 우측, 저장 상태 옆에 배치:

```
┌─────────────────────────────────────────────────────────────┐
│ ← 소설 제목  |  1화: 프롤로그  |  저장됨 ✓  |  [🔗 공유]   │
└─────────────────────────────────────────────────────────────┘
```

### 2. 공유 설정 다이얼로그

```
┌─────────────────────────────────────┐
│ 🔗 회차 공유                    [X] │
├─────────────────────────────────────┤
│                                     │
│ 이 회차를 다른 사람과 공유합니다.   │
│ 링크를 받은 사람은 내용을 볼 수     │
│ 있지만 편집할 수 없습니다.          │
│                                     │
│ ─────────────────────────────────── │
│                                     │
│ 만료 시간                           │
│ ┌─────────────────────────────────┐ │
│ │ 24시간 (기본)              ▼   │ │
│ └─────────────────────────────────┘ │
│   • 1시간                           │
│   • 24시간 ✓                        │
│   • 7일                             │
│   • 30일                            │
│   • 무제한                          │
│                                     │
│ ─────────────────────────────────── │
│                                     │
│ 비밀번호 (선택)                     │
│ [ ] 비밀번호로 보호                 │
│ ┌─────────────────────────────────┐ │
│ │ ••••••••                       │ │
│ └─────────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│              [링크 생성]            │
└─────────────────────────────────────┘
```

### 3. 링크 생성 완료

```
┌─────────────────────────────────────┐
│ ✅ 링크가 생성되었습니다!       [X] │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ https://4ndsys.com/s/a1b2c3d4  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [📋 링크 복사]    [완료]            │
│                                     │
│ ─────────────────────────────────── │
│ 💡 24시간 후 자동으로 만료됩니다    │
│    설정 > 공유 링크에서 관리 가능   │
└─────────────────────────────────────┘
```

### 4. 공유 페이지 (읽기 전용)

```
┌─────────────────────────────────────────────────────────────┐
│                      4ndSYS 공유                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📚 [소설 제목]                                             │
│  ─────────────────────────────────────────────────────────  │
│  1화: 프롤로그                                              │
│                                                             │
│  ───────────────────────────────────────────────────────    │
│                                                             │
│     [회차 본문 내용]                                        │
│                                                             │
│     ...                                                     │
│                                                             │
│     ...                                                     │
│                                                             │
│  ───────────────────────────────────────────────────────    │
│                                                             │
│  📖 12,345자                                                │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ⏰ 이 링크는 23시간 후 만료됩니다                          │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  4ndSYS - 웹소설 작가를 위한 무료 글쓰기 플랫폼             │
│  [나도 시작하기]                                            │
└─────────────────────────────────────────────────────────────┘
```

### 5. 비밀번호 입력 화면

```
┌─────────────────────────────────────┐
│           🔒 비밀번호 필요           │
├─────────────────────────────────────┤
│                                     │
│ 이 공유 링크는 비밀번호로           │
│ 보호되어 있습니다.                  │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 비밀번호 입력                  │ │
│ └─────────────────────────────────┘ │
│                                     │
│           [확인]                    │
│                                     │
└─────────────────────────────────────┘
```

### 6. 만료/삭제된 링크

```
┌─────────────────────────────────────┐
│           ⏰ 링크 만료               │
├─────────────────────────────────────┤
│                                     │
│ 이 공유 링크는 만료되었거나         │
│ 삭제되었습니다.                     │
│                                     │
│ 작성자에게 새 링크를 요청하세요.    │
│                                     │
│ ─────────────────────────────────── │
│ 4ndSYS - 웹소설 작가를 위한         │
│ 무료 글쓰기 플랫폼                  │
│                                     │
│        [4ndSYS 시작하기]            │
└─────────────────────────────────────┘
```

---

## 개발 스펙

### 데이터베이스 스키마

#### Supabase (PostgreSQL)

```sql
-- 공유 링크 테이블
CREATE TABLE shared_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 관계
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL,  -- 로컬 project id 참조
  chapter_id UUID NOT NULL,  -- 로컬 chapter id 참조

  -- 공유 설정
  share_token VARCHAR(21) NOT NULL UNIQUE,  -- nanoid (URL-safe)
  password_hash VARCHAR(255),                -- bcrypt hash (nullable)

  -- 스냅샷 (공유 시점의 내용 저장)
  project_title VARCHAR(255) NOT NULL,
  chapter_title VARCHAR(255) NOT NULL,
  chapter_number INTEGER NOT NULL,
  content JSONB NOT NULL,           -- Tiptap JSON
  character_count INTEGER NOT NULL,

  -- 만료 설정
  expires_at TIMESTAMPTZ,           -- NULL = 무제한

  -- 통계
  view_count INTEGER DEFAULT 0,

  -- 상태
  is_active BOOLEAN DEFAULT true,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_shared_chapters_token ON shared_chapters(share_token);
CREATE INDEX idx_shared_chapters_user ON shared_chapters(user_id);
CREATE INDEX idx_shared_chapters_expires ON shared_chapters(expires_at) WHERE is_active = true;

-- RLS 정책
ALTER TABLE shared_chapters ENABLE ROW LEVEL SECURITY;

-- 소유자만 CRUD 가능
CREATE POLICY "Users can manage own shared chapters"
  ON shared_chapters
  FOR ALL
  USING (auth.uid() = user_id);

-- 공개 읽기 (share_token으로 접근)
CREATE POLICY "Anyone can view by token"
  ON shared_chapters
  FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));
```

#### IndexedDB (Dexie) - 로컬 캐시

```typescript
// db.ts에 추가
interface SharedChapterLocal {
  id: string;           // UUID
  chapterId: string;    // 로컬 chapter id
  shareToken: string;
  expiresAt?: Date;
  createdAt: Date;
}

// Dexie 스키마 버전 업
// sharedChapters: 'id, chapterId, shareToken'
```

### API 엔드포인트

#### 1. 공유 링크 생성

```
POST /api/share/chapters

Request:
{
  "chapterId": "uuid",
  "expiresIn": "24h" | "1h" | "7d" | "30d" | "never",
  "password": "optional-string"
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "shareToken": "a1b2c3d4e5f6g7h8i9j0k",
    "shareUrl": "https://4ndsys.com/s/a1b2c3d4e5f6g7h8i9j0k",
    "expiresAt": "2024-01-16T12:00:00Z"
  }
}
```

#### 2. 공유 링크 목록 조회

```
GET /api/share/chapters

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "projectTitle": "소설 제목",
      "chapterTitle": "1화: 프롤로그",
      "shareToken": "a1b2c3d4...",
      "shareUrl": "https://4ndsys.com/s/...",
      "expiresAt": "2024-01-16T12:00:00Z",
      "viewCount": 5,
      "isActive": true,
      "hasPassword": true,
      "createdAt": "2024-01-15T12:00:00Z"
    }
  ]
}
```

#### 3. 공유 링크 삭제 (비활성화)

```
DELETE /api/share/chapters/:id

Response:
{
  "success": true
}
```

#### 4. 공유 페이지 조회 (공개)

```
GET /api/share/:token

Headers:
  X-Share-Password: optional-password (비밀번호 있을 때)

Response (성공):
{
  "success": true,
  "data": {
    "projectTitle": "소설 제목",
    "chapterTitle": "1화: 프롤로그",
    "chapterNumber": 1,
    "content": { /* Tiptap JSON */ },
    "characterCount": 12345,
    "expiresAt": "2024-01-16T12:00:00Z",
    "createdAt": "2024-01-15T12:00:00Z"
  }
}

Response (비밀번호 필요):
{
  "success": false,
  "error": "PASSWORD_REQUIRED"
}

Response (비밀번호 틀림):
{
  "success": false,
  "error": "INVALID_PASSWORD"
}

Response (만료/삭제):
{
  "success": false,
  "error": "LINK_EXPIRED"
}
```

### 컴포넌트 구조

```
src/
├── app/
│   ├── s/
│   │   └── [token]/
│   │       └── page.tsx          # 공유 페이지 (SSR, 공개)
│   ├── api/
│   │   └── share/
│   │       ├── chapters/
│   │       │   └── route.ts      # POST, GET
│   │       ├── chapters/[id]/
│   │       │   └── route.ts      # DELETE
│   │       └── [token]/
│   │           └── route.ts      # GET (공개)
│   └── settings/
│       └── shares/
│           └── page.tsx          # 공유 링크 관리 페이지
├── components/
│   └── features/
│       └── share/
│           ├── ShareButton.tsx           # 에디터 헤더의 공유 버튼
│           ├── ShareDialog.tsx           # 공유 설정 다이얼로그
│           ├── ShareLinkCreated.tsx      # 링크 생성 완료 UI
│           ├── ShareLinkList.tsx         # 공유 링크 목록
│           ├── ShareLinkCard.tsx         # 개별 링크 카드
│           ├── SharedChapterView.tsx     # 읽기 전용 뷰어
│           └── SharePasswordForm.tsx     # 비밀번호 입력 폼
├── hooks/
│   └── useSharedChapters.ts      # 공유 링크 CRUD 훅
└── lib/
    └── share/
        ├── token.ts              # nanoid 토큰 생성
        └── password.ts           # 비밀번호 해시/검증
```

### URL 구조

| 경로 | 용도 | 접근 |
|------|------|------|
| `/s/:token` | 공유 페이지 (읽기 전용) | 공개 |
| `/settings/shares` | 내 공유 링크 관리 | 회원만 |

---

## 보안 고려사항

### 1. 토큰 보안

```typescript
// nanoid 사용 (21자, URL-safe)
import { nanoid } from 'nanoid';
const shareToken = nanoid(); // "V1StGXR8_Z5jdHi6B-myT"

// 충돌 확률: 1% 확률로 충돌하려면 ~149억 개 생성 필요
```

### 2. 비밀번호 보안

```typescript
// bcrypt 해시 (salt rounds: 10)
import bcrypt from 'bcrypt';

const hash = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(input, hash);
```

### 3. Rate Limiting

```typescript
// 비밀번호 시도 제한
// IP당 5회/분, 실패 시 점진적 지연
```

### 4. 스냅샷 저장

공유 시점의 내용을 스냅샷으로 저장:
- 원본 수정해도 공유된 내용은 변경되지 않음
- 공유 후 삭제해도 링크는 유효 (만료까지)

### 5. 개인정보

- 작성자 정보 노출하지 않음 (소설/회차 제목만)
- 접근자 정보 수집하지 않음 (조회수만 카운트)

---

## 구현 우선순위

### Phase 1: 핵심 기능 (P0)

1. DB 스키마 생성 (Supabase 마이그레이션)
2. 공유 링크 생성 API
3. 공유 페이지 (읽기 전용 뷰어)
4. 에디터 공유 버튼 + 다이얼로그
5. 링크 복사 기능

### Phase 2: 관리 기능 (P0-P1)

1. 공유 링크 목록 API
2. 공유 링크 삭제 API
3. 설정 > 공유 링크 관리 페이지
4. 비밀번호 보호 기능

### Phase 3: 부가 기능 (P2)

1. 조회수 카운터
2. 만료 링크 자동 정리 (Cron)
3. 만료 알림 (선택적)

---

## 제외 범위 (Out of Scope)

다음 기능은 앱 정체성 유지를 위해 **구현하지 않음**:

| 제외 기능 | 이유 |
|-----------|------|
| 댓글/피드백 시스템 | 복잡도 증가, 소셜 플랫폼화 방지 |
| 공개 갤러리 | 플랫폼화 방지 |
| 팔로우/좋아요 | 소셜 기능 배제 |
| 알림 시스템 | 복잡도 증가 |
| 공유 분석 (상세 통계) | 과잉 기능 |

---

## 참고

- 유사 서비스: Notion 공유 링크, Google Docs 공유
- 차별점: 만료 시간 기본 설정, 비밀번호 지원, 스냅샷 저장
