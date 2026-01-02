# AI Context 최적화 결정 문서

## 개요

컬리 OMS팀의 Claude AI 협업 방식을 4ndSYS 프로젝트에 적용하기 위한 최종 결정 문서.

**목표**:
- AI Context의 지식/행동 분리
- 토큰 효율성 3배 향상 (자연어 → JSON)
- 선택적 로딩으로 토큰 예측 가능성 확보
- 클린 아키텍처 기반 UseCase 레이어 도입

**참고 자료**:
- [컬리 OMS팀의 Claude AI 협업 사례](https://helloworld.kurly.com/blog/oms-claude-ai-workflow/)

---

## 1. 참고: 컬리 OMS팀 방식

### 핵심 원칙

```
ai-context/ (지식) + skills/ (행동) 분리
```

| 구분 | 역할 | 로딩 시점 |
|------|------|----------|
| ai-context/ | 도메인, API 스펙, 데이터 모델 | 세션 시작 시 명시적 로딩 |
| skills/ | 개발 및 배포 워크플로우 | 실행 시점에 동적 로딩 |

### 왜 지식을 Skills로 분리하지 않는가?

1. **토큰 사용량의 예측 가능성**: CLAUDE.md를 통해 어떤 문서가 언제 로드될지 제어 가능
2. **문서 로딩 시점의 투명성**: Skills는 동적 로드되어 예상치 못한 토큰 소비 발생
3. **역할별 Context 최적화**: 필요한 지식 문서만 선택적으로 로드

### CLAUDE.md의 역할

- ai-context/ 폴더 내 각 문서의 **위치를 명시하는 인덱스**
- Claude가 프로젝트의 도메인, API, 아키텍처 정보가 **어디에 있는지** 파악

### JSON DSL의 효과

- 자연어 대비 **~3배 토큰 효율성**
- 구조화된 정보로 AI 이해도 향상
- 서비스 간 데이터 흐름 자동 추적 가능

---

## 2. 적용 범위

### 적용 O

| 항목 | 설명 |
|------|------|
| ai-context/ 디렉토리 | 지식 문서 JSON화 |
| CLAUDE.md 인덱스화 | 문서 위치 명시, 선택적 로딩 규칙 |
| 도메인 지식 문서화 | 웹소설 용어, 비즈니스 규칙 |
| 기술 지식 문서화 | 라우트, 에디터, 동기화, 스키마 히스토리 |
| UseCase 레이어 | 클린 아키텍처 기반 비즈니스 로직 분리 |

### 적용 X (이유)

| 항목 | 이유 |
|------|------|
| MSA별 AI 세션 | 단일 모놀리식 프로젝트 |
| MCP 통합 (Jira, Datadog) | 현재 불필요 (GitHub MCP는 추후 고려) |
| 도메인별 Skills 분리 | `/developer`가 이미 범용적으로 충분 |

---

## 3. 디렉토리 구조

### 최종 구조

```
4ndsys-project/
├── .claude/
│   ├── ai-context/              # 신규: 지식 문서
│   │   ├── domain/
│   │   │   ├── glossary.json    # 웹소설 도메인 용어
│   │   │   ├── rules.json       # 비즈니스 규칙
│   │   │   └── entities.json    # 엔터티 관계도
│   │   ├── technical/
│   │   │   ├── routes.json      # App Router 구조
│   │   │   ├── sync-flow.json   # 동기화 상세 흐름
│   │   │   ├── editor-config.json # 에디터 설정
│   │   │   └── schema-history.json # Dexie 마이그레이션 히스토리
│   │   ├── components/
│   │   │   └── dependency-map.json # 컴포넌트-훅 의존성
│   │   └── README.md            # ai-context 사용 가이드
│   └── skills/                  # 기존 유지
│       ├── task/
│       ├── developer/
│       ├── frontend/
│       └── reviewer/
├── CLAUDE.md                    # 리팩토링: 인덱스 역할
└── docs/                        # 기존 유지 (상세 문서)
```

---

## 4. JSON 지식 문서 스펙

### 4.1 domain/glossary.json

웹소설 도메인 용어 정의.

```json
{
  "$schema": "ai-context/domain/glossary",
  "version": "1.0.0",
  "terms": {
    "회차": {
      "en": "chapter",
      "description": "소설의 에피소드 단위. 웹소설에서는 '1화', '2화'로 표기",
      "model": "Chapter",
      "aliases": ["화", "에피소드"]
    },
    "시놉시스": {
      "en": "synopsis",
      "description": "소설의 전체 줄거리. 프로젝트당 1개만 존재",
      "model": "Synopsis",
      "constraints": ["ONE_PER_PROJECT"]
    },
    "플롯 메모": {
      "en": "plot",
      "description": "챕터별 간단한 전개 메모. content와 별도로 저장",
      "field": "Chapter.plot"
    },
    "관계도": {
      "en": "relationship graph",
      "description": "캐릭터 간 관계를 시각화한 그래프",
      "model": "Relationship",
      "ui": "React Flow"
    },
    "캐릭터 시트": {
      "en": "character sheet",
      "description": "캐릭터의 상세 정보 (외형, 성격, 배경 등)",
      "model": "Character"
    }
  }
}
```

### 4.2 domain/rules.json

비즈니스 규칙 정의.

```json
{
  "$schema": "ai-context/domain/rules",
  "version": "1.0.0",
  "rules": {
    "CASCADE_DELETE": {
      "description": "프로젝트 삭제 시 모든 하위 데이터 함께 삭제",
      "entities": ["chapters", "synopses", "characters", "relationships", "versions"],
      "implementation": "useProject.deleteProject()"
    },
    "GUEST_LOCAL_ONLY": {
      "description": "게스트는 IndexedDB만 사용, 서버 동기화 없음",
      "reason": "guestId가 IndexedDB에 저장되어 브라우저 삭제 시 유실 → 서버 데이터 복구 불가",
      "implementation": "SyncEngine.shouldSync()"
    },
    "ONE_SYNOPSIS_PER_PROJECT": {
      "description": "프로젝트당 시놉시스 1개만 존재",
      "implementation": "useSynopsis.getOrCreate()"
    },
    "LOCAL_FIRST_SAVE": {
      "description": "모든 저장은 IndexedDB 먼저, 온라인이면 debounce 후 서버 동기화",
      "debounce": 2000,
      "implementation": "storage/local/*.ts"
    },
    "LATEST_WINS_CONFLICT": {
      "description": "동기화 충돌 시 updatedAt이 최신인 데이터 우선",
      "implementation": "SyncEngine.resolveConflict()"
    },
    "IMAGE_DUAL_STORAGE": {
      "description": "이미지는 로컬에 Base64, 서버에 Storage URL로 저장",
      "fields": ["coverImageBase64/coverImageUrl", "imageBase64/imageUrl"],
      "implementation": "image-utils.ts, sync-engine.ts"
    }
  },
  "policies": {
    "guest": {
      "canSync": false,
      "storage": "IndexedDB only",
      "migration": "회원 가입 시 migrateGuestDataToUser() 호출"
    },
    "member": {
      "canSync": true,
      "storage": "IndexedDB + Supabase",
      "realtime": "Supabase Realtime 구독"
    }
  }
}
```

### 4.3 domain/entities.json

엔터티 관계 및 필드 정의.

```json
{
  "$schema": "ai-context/domain/entities",
  "version": "1.0.0",
  "entities": {
    "Project": {
      "description": "소설 프로젝트",
      "table": {
        "local": "projects",
        "remote": "projects"
      },
      "fields": {
        "id": { "type": "uuid", "pk": true },
        "userId": { "type": "uuid", "nullable": true },
        "guestId": { "type": "uuid", "nullable": true },
        "title": { "type": "string", "required": true },
        "description": { "type": "string", "nullable": true },
        "genre": { "type": "string", "nullable": true },
        "coverImageUrl": { "type": "string", "nullable": true, "remote": true },
        "coverImageBase64": { "type": "string", "nullable": true, "local": true },
        "status": { "type": "enum", "values": ["active", "archived", "deleted"], "default": "active" },
        "deletedAt": { "type": "datetime", "nullable": true },
        "syncStatus": { "type": "enum", "values": ["synced", "pending", "conflict"], "local": true }
      },
      "relations": {
        "chapters": { "type": "hasMany", "entity": "Chapter", "cascade": true },
        "synopsis": { "type": "hasOne", "entity": "Synopsis", "cascade": true },
        "characters": { "type": "hasMany", "entity": "Character", "cascade": true },
        "relationships": { "type": "hasMany", "entity": "Relationship", "cascade": true },
        "versions": { "type": "hasMany", "entity": "Version", "cascade": true }
      },
      "constraints": ["userId OR guestId must be set"]
    },
    "Chapter": {
      "description": "소설 회차",
      "fields": {
        "id": { "type": "uuid", "pk": true },
        "projectId": { "type": "uuid", "fk": "Project.id" },
        "title": { "type": "string", "required": true },
        "content": { "type": "json", "format": "Tiptap JSONContent" },
        "contentText": { "type": "string", "nullable": true, "purpose": "검색/글자수" },
        "wordCount": { "type": "integer", "default": 0 },
        "order": { "type": "integer", "required": true },
        "status": { "type": "enum", "values": ["draft", "published"], "default": "draft" },
        "plot": { "type": "string", "nullable": true, "purpose": "플롯 메모" },
        "syncStatus": { "type": "enum", "values": ["synced", "pending", "conflict"], "local": true }
      }
    },
    "Synopsis": {
      "description": "소설 시놉시스 (프로젝트당 1개)",
      "fields": {
        "id": { "type": "uuid", "pk": true },
        "projectId": { "type": "uuid", "fk": "Project.id", "unique": true },
        "content": { "type": "json", "format": "Tiptap JSONContent" },
        "plainText": { "type": "string", "nullable": true },
        "wordCount": { "type": "integer", "default": 0 },
        "syncStatus": { "type": "enum", "values": ["synced", "pending", "conflict"], "local": true }
      }
    },
    "Character": {
      "description": "등장인물",
      "fields": {
        "id": { "type": "uuid", "pk": true },
        "projectId": { "type": "uuid", "fk": "Project.id" },
        "name": { "type": "string", "required": true },
        "nickname": { "type": "string", "nullable": true },
        "age": { "type": "integer", "nullable": true },
        "gender": { "type": "string", "nullable": true },
        "race": { "type": "string", "nullable": true },
        "imageUrl": { "type": "string", "nullable": true, "remote": true },
        "imageBase64": { "type": "string", "nullable": true, "local": true },
        "order": { "type": "integer", "required": true },
        "height": { "type": "integer", "nullable": true },
        "weight": { "type": "integer", "nullable": true },
        "appearance": { "type": "string", "nullable": true },
        "mbti": { "type": "string", "nullable": true },
        "personality": { "type": "string", "nullable": true },
        "education": { "type": "string", "nullable": true },
        "occupation": { "type": "string", "nullable": true },
        "affiliation": { "type": "string", "nullable": true },
        "background": { "type": "string", "nullable": true },
        "customFields": { "type": "array", "items": { "key": "string", "value": "string" } },
        "syncStatus": { "type": "enum", "values": ["synced", "pending", "conflict"], "local": true }
      }
    },
    "Relationship": {
      "description": "캐릭터 관계",
      "fields": {
        "id": { "type": "uuid", "pk": true },
        "projectId": { "type": "uuid", "fk": "Project.id" },
        "fromCharacterId": { "type": "uuid", "fk": "Character.id" },
        "toCharacterId": { "type": "uuid", "fk": "Character.id" },
        "type": { "type": "enum", "values": ["family", "friend", "lover", "rival", "enemy", "colleague", "master", "custom"] },
        "description": { "type": "string", "nullable": true },
        "bidirectional": { "type": "boolean", "default": false },
        "syncStatus": { "type": "enum", "values": ["synced", "pending", "conflict"], "local": true }
      }
    },
    "Version": {
      "description": "버전 히스토리 (로컬 전용)",
      "fields": {
        "id": { "type": "uuid", "pk": true },
        "projectId": { "type": "uuid", "fk": "Project.id" },
        "entityType": { "type": "enum", "values": ["synopsis", "character"] },
        "entityId": { "type": "uuid" },
        "snapshot": { "type": "json" },
        "diff": { "type": "json", "nullable": true }
      },
      "note": "서버 동기화 없음, 로컬 전용"
    }
  },
  "relationshipTypes": [
    { "value": "family", "label": "가족" },
    { "value": "friend", "label": "친구" },
    { "value": "lover", "label": "연인" },
    { "value": "rival", "label": "라이벌" },
    { "value": "enemy", "label": "적" },
    { "value": "colleague", "label": "동료" },
    { "value": "master", "label": "사제" },
    { "value": "custom", "label": "기타" }
  ]
}
```

### 4.4 technical/routes.json

App Router 구조.

```json
{
  "$schema": "ai-context/technical/routes",
  "version": "1.0.0",
  "groups": {
    "(auth)": {
      "description": "인증 전용 레이아웃 (헤더 없음)",
      "layout": "src/app/(auth)/layout.tsx",
      "routes": {
        "/login": "로그인 페이지",
        "/signup": "회원가입 페이지"
      }
    },
    "(dashboard)": {
      "description": "대시보드 레이아웃 (사이드바 포함)",
      "layout": "src/app/(dashboard)/layout.tsx",
      "routes": {
        "/novels": "소설 목록",
        "/novels/[id]": "소설 상세 (챕터 목록)",
        "/novels/[id]/synopsis": "시놉시스 편집",
        "/novels/[id]/characters": "캐릭터 관리",
        "/novels/[id]/relationships": "관계도",
        "/settings": "설정",
        "/settings/shares": "공유 링크 관리"
      }
    },
    "(editor)": {
      "description": "에디터 전용 레이아웃 (전체화면, 사이드바 없음)",
      "layout": "src/app/(editor)/layout.tsx (없음, 페이지 자체가 레이아웃)",
      "routes": {
        "/novels/[id]/chapters/[chapterId]": "챕터 에디터"
      }
    },
    "(legal)": {
      "description": "법적 문서",
      "routes": {
        "/privacy": "개인정보처리방침",
        "/terms": "이용약관"
      }
    },
    "public": {
      "description": "공개 페이지",
      "routes": {
        "/": "랜딩 페이지",
        "/credits": "크레딧",
        "/s/[token]": "공유 페이지 (토큰 기반 접근)"
      }
    }
  },
  "params": {
    "[id]": "프로젝트 ID (UUID)",
    "[chapterId]": "챕터 ID (UUID)",
    "[token]": "공유 토큰"
  }
}
```

### 4.5 technical/sync-flow.json

동기화 상세 흐름.

```json
{
  "$schema": "ai-context/technical/sync-flow",
  "version": "1.0.0",
  "overview": {
    "strategy": "Local-First",
    "conflictResolution": "Latest-Wins (updatedAt 비교)",
    "debounce": 2000
  },
  "saveFlow": {
    "steps": [
      { "step": 1, "action": "사용자 입력 발생" },
      { "step": 2, "action": "즉시 IndexedDB 저장 (optimistic)", "syncStatus": "pending" },
      { "step": 3, "action": "UI에 '저장됨' 표시" },
      { "step": 4, "condition": "온라인", "action": "2초 debounce 후 Supabase 동기화" },
      { "step": 5, "condition": "성공", "action": "syncStatus: 'synced'" },
      { "step": 5, "condition": "실패", "action": "재시도 큐에 추가" },
      { "step": 4, "condition": "오프라인", "action": "로컬만 저장, 온라인 복귀 시 자동 동기화" }
    ]
  },
  "pullFlow": {
    "trigger": "앱 시작 시 또는 수동 새로고침",
    "steps": [
      { "step": 1, "action": "서버에서 최신 데이터 조회 (updatedAt > lastSyncedAt)" },
      { "step": 2, "action": "로컬 데이터와 비교" },
      { "step": 3, "condition": "충돌 없음", "action": "로컬 업데이트, syncStatus: 'synced'" },
      { "step": 3, "condition": "충돌 발생", "action": "Latest-Wins 적용" }
    ]
  },
  "realtimeFlow": {
    "subscription": "Supabase Realtime",
    "events": {
      "INSERT": "새 데이터 로컬에 추가",
      "UPDATE": "로컬 데이터 업데이트 (충돌 해결 적용)",
      "DELETE": "로컬 데이터 삭제"
    },
    "filter": "user_id = 현재 사용자"
  },
  "imageSync": {
    "description": "이미지는 로컬에 Base64, 서버에 Storage URL로 저장",
    "uploadFlow": [
      { "step": 1, "action": "이미지 선택 → 100x150 리사이즈" },
      { "step": 2, "action": "Base64로 변환 → IndexedDB 저장 (xxxBase64 필드)" },
      { "step": 3, "condition": "동기화 시", "action": "Base64 → Supabase Storage 업로드" },
      { "step": 4, "action": "Signed URL 생성 → Supabase DB 저장 (xxxUrl 필드)" }
    ],
    "downloadFlow": [
      { "step": 1, "action": "서버에서 xxxUrl 가져옴" },
      { "step": 2, "action": "URL에서 이미지 다운로드 → Base64 변환" },
      { "step": 3, "action": "IndexedDB xxxBase64 필드에 저장" }
    ]
  },
  "retryStrategy": {
    "maxAttempts": 3,
    "backoff": "exponential",
    "initialDelay": 1000
  }
}
```

### 4.6 technical/editor-config.json

에디터 설정.

```json
{
  "$schema": "ai-context/technical/editor-config",
  "version": "1.0.0",
  "tiptap": {
    "version": "3.14.0",
    "extensions": {
      "StarterKit": {
        "enabled": true,
        "disabled": ["heading", "bulletList", "orderedList", "blockquote", "codeBlock"],
        "reason": "소설 에디터에 불필요한 마크다운 기능"
      },
      "Underline": { "enabled": true },
      "TextStyle": { "enabled": true },
      "FontFamily": { "enabled": true },
      "TextAlign": { "enabled": true },
      "FontSize": { "enabled": true, "custom": true, "path": "extensions.ts" }
    }
  },
  "fonts": {
    "default": "RIDIBatang",
    "categories": {
      "명조": [
        { "name": "리디바탕", "value": "RIDIBatang", "default": true },
        { "name": "본명조", "value": "Noto Serif KR" },
        { "name": "마루 부리", "value": "MaruBuri" }
      ],
      "고딕": [
        { "name": "Pretendard", "value": "Pretendard" },
        { "name": "본고딕", "value": "Noto Sans KR" },
        { "name": "나눔스퀘어 네오", "value": "NanumSquareNeo" },
        { "name": "Gmarket Sans", "value": "GmarketSansMedium" }
      ]
    }
  },
  "fontSize": {
    "default": "12pt",
    "options": ["9pt", "10pt", "11pt", "12pt", "14pt", "16pt", "18pt", "20pt", "24pt"]
  },
  "autosave": {
    "enabled": true,
    "delay": 2000,
    "unit": "ms"
  },
  "spellCheck": {
    "enabled": true,
    "api": "/api/spellcheck",
    "provider": "부산대 맞춤법 검사기"
  }
}
```

### 4.7 technical/schema-history.json

Dexie 마이그레이션 히스토리.

```json
{
  "$schema": "ai-context/technical/schema-history",
  "version": "1.0.0",
  "database": "4ndsys",
  "currentVersion": 8,
  "migrations": [
    {
      "version": 1,
      "date": "2024-12-22",
      "description": "초기 스키마",
      "tables": ["projects", "chapters", "syncQueue", "settings"]
    },
    {
      "version": 2,
      "date": "2024-12-23",
      "description": "표지 이미지 필드 추가",
      "changes": ["projects: coverImageUrl, coverImageBase64 추가"],
      "reason": "프로젝트 표지 이미지 기능"
    },
    {
      "version": 3,
      "date": "2024-12-24",
      "description": "시놉시스 테이블 추가",
      "tables": ["synopses"],
      "reason": "시놉시스 기능"
    },
    {
      "version": 4,
      "date": "2024-12-24",
      "description": "캐릭터 테이블 추가",
      "tables": ["characters"],
      "reason": "캐릭터 관리 기능"
    },
    {
      "version": 5,
      "date": "2024-12-24",
      "description": "관계도 테이블 추가",
      "tables": ["relationships"],
      "reason": "캐릭터 관계도 기능"
    },
    {
      "version": 6,
      "date": "2024-12-24",
      "description": "버전 히스토리 테이블 추가",
      "tables": ["versions"],
      "reason": "시놉시스/캐릭터 히스토리 추적"
    },
    {
      "version": 7,
      "date": "2024-12-25",
      "description": "관계도 필드 정리",
      "changes": ["relationships: label, reverseLabel 필드 제거"],
      "reason": "불필요한 필드 정리, type으로 충분"
    },
    {
      "version": 8,
      "date": "2024-12-XX",
      "description": "플롯 메모 필드 추가",
      "changes": ["chapters: plot 필드 추가"],
      "reason": "챕터별 플롯 메모 기능"
    }
  ],
  "upgradeNotes": {
    "addField": "필드 추가 시 .upgrade()에서 기존 데이터에 기본값 설정",
    "removeField": "필드 제거 시 .upgrade()에서 delete 처리",
    "addTable": "테이블 추가는 .stores()에 정의만으로 충분"
  }
}
```

### 4.8 components/dependency-map.json

컴포넌트-훅 의존성 맵.

```json
{
  "$schema": "ai-context/components/dependency-map",
  "version": "1.0.0",
  "components": {
    "features/editor/EditorLayout": {
      "hooks": ["useChapters", "useEditor", "useSyncEngine", "useSpellCheck", "useUserSettings"],
      "components": ["Editor", "EditorToolbar", "EditorSidebar", "EditorStatusBar", "PlotMemo", "SpellCheckSheet"],
      "features": ["autosave", "spellcheck", "plotMemo", "chapterNavigation"]
    },
    "features/project/ProjectCard": {
      "hooks": ["useProject"],
      "components": ["CoverImage", "ProjectMenu"],
      "features": ["coverImage", "delete", "archive"]
    },
    "features/relationship/RelationshipGraph": {
      "hooks": ["useCharacters", "useRelationships"],
      "libs": ["@xyflow/react"],
      "components": ["CharacterNode", "RelationshipEdge", "RelationshipDialog"],
      "features": ["dragDrop", "zoom", "filter", "addRelationship"]
    },
    "features/character/CharacterCard": {
      "hooks": ["useCharacters", "useVersionHistory"],
      "components": ["CharacterImage", "CharacterForm", "CustomFieldsEditor"],
      "features": ["imageUpload", "customFields", "history"]
    },
    "features/workspace/WorkspaceSidebar": {
      "hooks": ["useProjects", "useChapters", "useAuth"],
      "components": ["ProjectList", "ChapterList", "SyncStatusIndicator"],
      "features": ["projectSwitch", "chapterNavigation", "syncStatus"]
    }
  },
  "hooks": {
    "useProject": {
      "storage": "storage/local/project.local.ts",
      "sync": "sync/sync-engine.ts",
      "reactivity": "dexie-react-hooks/useLiveQuery"
    },
    "useChapters": {
      "storage": "storage/local/chapter.local.ts",
      "sync": "sync/sync-engine.ts",
      "reactivity": "dexie-react-hooks/useLiveQuery"
    },
    "useSyncEngine": {
      "dependencies": ["useAuth", "useOnline"],
      "realtime": "Supabase Realtime"
    }
  }
}
```

---

## 5. CLAUDE.md 인덱스 구조

### 새로운 CLAUDE.md 템플릿

```markdown
# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

4ndSYS - 웹소설 작가를 위한 로컬 우선(Local-First) 글쓰기 플랫폼.

## AI Context Index

### Knowledge (ai-context/)

| 문서 | 경로 | 로딩 | 설명 |
|------|------|------|------|
| 도메인 용어 | `.claude/ai-context/domain/glossary.json` | **항상** | 웹소설 용어 정의 |
| 비즈니스 규칙 | `.claude/ai-context/domain/rules.json` | **항상** | CASCADE_DELETE, GUEST_LOCAL_ONLY 등 |
| 엔터티 관계 | `.claude/ai-context/domain/entities.json` | **항상** | 테이블 구조, 필드, 관계 |
| 라우트 구조 | `.claude/ai-context/technical/routes.json` | 필요시 | App Router 구조 |
| 동기화 흐름 | `.claude/ai-context/technical/sync-flow.json` | sync 작업 | 동기화 상세 로직 |
| 에디터 설정 | `.claude/ai-context/technical/editor-config.json` | editor 작업 | 폰트, 확장, 자동저장 |
| 스키마 히스토리 | `.claude/ai-context/technical/schema-history.json` | DB 변경 | Dexie 마이그레이션 |
| 컴포넌트 맵 | `.claude/ai-context/components/dependency-map.json` | 필요시 | 컴포넌트-훅 의존성 |

### Behavior (skills/)

| 스킬 | 용도 |
|------|------|
| `/task` | 전체 워크플로우 (분석→구현→리뷰→커밋) |
| `/developer` | 데이터 계층, 로직, Repository |
| `/frontend` | RSC, SEO, UI 컴포넌트 |
| `/reviewer` | 코드 리뷰, 버그/보안/성능 |

### Selective Loading Rules

**기본 로딩** (모든 세션):
- `glossary.json`, `rules.json`, `entities.json`

**도메인별 로딩**:
| 작업 | 추가 로딩 |
|------|----------|
| Editor 관련 | `editor-config.json` |
| Sync 관련 | `sync-flow.json` |
| DB 스키마 변경 | `schema-history.json` |
| 라우트 추가/변경 | `routes.json` |
| 컴포넌트 구조 파악 | `dependency-map.json` |

### Token Estimation

| 세션 유형 | 예상 토큰 |
|----------|----------|
| 일반 작업 | ~2K |
| Editor 작업 | ~2.5K |
| Sync 작업 | ~3K |
| 전체 분석 | ~5K |

## Commands
(기존 내용 유지)

## Architecture
(기존 내용 유지, 상세는 ai-context/로 이동)

## Core Rules
(기존 내용 유지)
```

---

## 6. 클린 아키텍처: UseCase 레이어

### 6.1 현재 vs 목표

**현재**:
```
컴포넌트/훅 → Repository (인터페이스) → Storage (구현체)
```
- 비즈니스 로직이 훅에 분산됨

**목표**:
```
컴포넌트 → 훅 → UseCase → Repository → Storage
```
- 비즈니스 로직이 UseCase에 집중됨

### 6.2 디렉토리 구조

```
src/
├── application/              # 신규: UseCase 레이어
│   ├── project/
│   │   ├── create-project.usecase.ts
│   │   ├── delete-project.usecase.ts
│   │   └── index.ts
│   ├── chapter/
│   │   ├── create-chapter.usecase.ts
│   │   ├── reorder-chapters.usecase.ts
│   │   └── index.ts
│   ├── sync/
│   │   ├── sync-all.usecase.ts
│   │   ├── pull-from-server.usecase.ts
│   │   └── index.ts
│   └── index.ts
│
├── repositories/             # 기존: 인터페이스 (Port 역할)
├── storage/                  # 기존: 구현체 (Adapter 역할)
│   ├── local/
│   └── remote/
└── hooks/                    # 기존: UseCase 호출
```

### 6.3 UseCase 예시

```typescript
// application/project/delete-project.usecase.ts
import { db } from "@/storage/local/db";

export interface DeleteProjectUseCaseInput {
  projectId: string;
}

export interface DeleteProjectUseCaseOutput {
  success: boolean;
  deletedCounts: {
    chapters: number;
    synopses: number;
    characters: number;
    relationships: number;
    versions: number;
  };
}

/**
 * 프로젝트 삭제 UseCase
 * - CASCADE_DELETE 규칙 적용
 * - 모든 관련 데이터 함께 삭제
 */
export async function deleteProjectUseCase(
  input: DeleteProjectUseCaseInput
): Promise<DeleteProjectUseCaseOutput> {
  const { projectId } = input;

  // 1. 관련 데이터 카운트 (결과 반환용)
  const chapters = await db.chapters.where("projectId").equals(projectId).count();
  const synopses = await db.synopses.where("projectId").equals(projectId).count();
  const characters = await db.characters.where("projectId").equals(projectId).count();
  const relationships = await db.relationships.where("projectId").equals(projectId).count();
  const versions = await db.versions.where("projectId").equals(projectId).count();

  // 2. CASCADE DELETE 실행
  await db.chapters.where("projectId").equals(projectId).delete();
  await db.synopses.where("projectId").equals(projectId).delete();
  await db.characters.where("projectId").equals(projectId).delete();
  await db.relationships.where("projectId").equals(projectId).delete();
  await db.versions.where("projectId").equals(projectId).delete();
  await db.projects.delete(projectId);

  return {
    success: true,
    deletedCounts: { chapters, synopses, characters, relationships, versions }
  };
}
```

### 6.4 훅에서 UseCase 호출

```typescript
// hooks/useProject.ts (수정)
import { deleteProjectUseCase } from "@/application/project";

export function useProject(projectId: string) {
  // ...

  const deleteProject = useCallback(async () => {
    const result = await deleteProjectUseCase({ projectId });
    if (result.success) {
      // 필요시 추가 처리 (토스트 등)
    }
  }, [projectId]);

  return { deleteProject, /* ... */ };
}
```

### 6.5 적용 우선순위

| 우선순위 | UseCase | 이유 |
|----------|---------|------|
| 1 | deleteProjectUseCase | CASCADE_DELETE 로직 복잡 |
| 2 | syncAllUseCase | 동기화 로직 복잡 |
| 3 | migrateGuestDataUseCase | 게스트→회원 마이그레이션 |
| 4 | createChapterUseCase | order 계산 로직 |
| 5 | reorderChaptersUseCase | 순서 변경 로직 |

---

## 7. 작업 순서

### Phase 1: AI Context 기반 구축 (1주차)

| 순서 | 작업 | 파일 |
|------|------|------|
| 1-1 | ai-context 디렉토리 생성 | `.claude/ai-context/` |
| 1-2 | domain/glossary.json 작성 | 웹소설 도메인 용어 |
| 1-3 | domain/rules.json 작성 | 비즈니스 규칙 |
| 1-4 | domain/entities.json 작성 | 엔터티 관계 |
| 1-5 | technical/routes.json 작성 | 라우트 구조 |
| 1-6 | technical/sync-flow.json 작성 | 동기화 흐름 |
| 1-7 | technical/editor-config.json 작성 | 에디터 설정 |
| 1-8 | technical/schema-history.json 작성 | 스키마 히스토리 |
| 1-9 | components/dependency-map.json 작성 | 컴포넌트 맵 |
| 1-10 | ai-context/README.md 작성 | 사용 가이드 |

### Phase 2: CLAUDE.md 리팩토링 (1주차)

| 순서 | 작업 |
|------|------|
| 2-1 | CLAUDE.md 백업 |
| 2-2 | CLAUDE.md 인덱스 구조로 재작성 |
| 2-3 | 선택적 로딩 규칙 추가 |
| 2-4 | 토큰 예측 가이드 추가 |

### Phase 3: UseCase 레이어 도입 (2주차)

| 순서 | 작업 | 파일 |
|------|------|------|
| 3-1 | application 디렉토리 생성 | `src/application/` |
| 3-2 | deleteProjectUseCase 구현 | CASCADE DELETE |
| 3-3 | useProject 훅 수정 | UseCase 호출로 변경 |
| 3-4 | syncAllUseCase 구현 | 동기화 로직 이동 |
| 3-5 | useSyncEngine 훅 수정 | UseCase 호출로 변경 |
| 3-6 | 나머지 UseCase 점진적 추가 | 필요에 따라 |

### Phase 4: 검증 및 문서화 (2주차)

| 순서 | 작업 |
|------|------|
| 4-1 | 빌드/테스트 검증 |
| 4-2 | 실제 AI 세션에서 검증 |
| 4-3 | docs/TASK.md 업데이트 |
| 4-4 | 디렉토리별 CLAUDE.md 갱신 |

---

## 8. 예상 효과

| 항목 | Before | After |
|------|--------|-------|
| 토큰 효율성 | 자연어 문서 | JSON으로 ~3배 절감 |
| 토큰 예측 | 불가능 | 세션 유형별 예측 가능 |
| 비즈니스 로직 | 훅에 분산 | UseCase에 집중 |
| AI 이해도 | 암묵적 지식 | 명시적 JSON |
| 테스트 용이성 | 훅 테스트 어려움 | UseCase 단위 테스트 |
| 유지보수 | 규칙 찾기 어려움 | rules.json 참조 |

---

## 9. 참고 자료

- [컬리 OMS팀의 Claude AI 협업 사례](https://helloworld.kurly.com/blog/oms-claude-ai-workflow/)
- 스크린샷: `.playwright-mcp/kurly-oms-claude-full.png`

---

## 변경 이력

| 날짜 | 버전 | 설명 |
|------|------|------|
| 2026-01-02 | 1.0.0 | 초안 작성 |
