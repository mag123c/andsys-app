# 시놉시스 관리 (Synopsis)

소설 전체 줄거리를 작성하고 버전 관리하는 기능.

## 개요

| 항목 | 내용 |
|------|------|
| **에디터** | 기존 Tiptap 에디터 재활용 |
| **저장** | 자동 저장 (debounce 2초) |
| **버전 관리** | 변경 시 diff 저장 |
| **히스토리** | 이전 버전 조회/복원 |

---

## 데이터 스키마

### Synopsis

```typescript
interface Synopsis {
  id: string;
  projectId: string;           // 소속 소설
  content: JSONContent;        // Tiptap JSON
  plainText: string;           // 검색용 plain text
  wordCount: number;           // 글자수
  createdAt: Date;
  updatedAt: Date;
  syncStatus: "synced" | "pending" | "conflict";
}
```

### SynopsisVersion (히스토리)

```typescript
interface SynopsisVersion {
  id: string;
  synopsisId: string;
  version: number;             // 버전 번호 (1, 2, 3...)
  content: JSONContent;        // 해당 버전의 전체 내용
  diff: DiffEntry[];           // 이전 버전과의 차이
  createdAt: Date;
}

interface DiffEntry {
  type: "add" | "remove" | "modify";
  path: string;                // 변경 위치
  oldValue?: string;
  newValue?: string;
}
```

---

## UI 설계

### 시놉시스 편집 페이지

```
┌──────────────────────────────────────────────────────────────┐
│ ← 소설 목록     시놉시스                [히스토리] [저장됨]   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ [B] [I] [U] [H1] [H2] [•] [1.] | [Undo] [Redo]       │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │                                                      │   │
│  │  # 전체 줄거리                                       │   │
│  │                                                      │   │
│  │  주인공 홍길동은 양반 가문에서 태어났으나 서자        │   │
│  │  출신으로 차별받으며 성장한다. 어느 날 도적단에       │   │
│  │  납치된 마을 사람들을 구하면서 의적의 길로...         │   │
│  │                                                      │   │
│  │  ## 1부: 탄생                                        │   │
│  │  - 서자로 태어남                                     │   │
│  │  - 아버지의 냉대                                     │   │
│  │                                                      │   │
│  │  ## 2부: 각성                                        │   │
│  │  ...                                                 │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  2,450자                                                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 히스토리 사이드 패널

```
┌─────────────────────────────┐
│ 버전 히스토리         [✕]   │
├─────────────────────────────┤
│                             │
│ ● v5 (현재)                 │
│   2024-01-15 14:30          │
│   "2부 내용 추가"           │
│                             │
│ ○ v4                        │
│   2024-01-14 10:15          │
│   "1부 수정"                │
│   [비교] [복원]             │
│                             │
│ ○ v3                        │
│   2024-01-10 09:00          │
│   ...                       │
│                             │
└─────────────────────────────┘
```

---

## 에디터 설정

### Tiptap 확장 (기존 재활용)

```typescript
const synopsisExtensions = [
  StarterKit,
  Placeholder.configure({
    placeholder: "시놉시스를 작성하세요...",
  }),
  // 기존 에디터와 동일한 확장 사용
];
```

### 자동 저장 로직

```typescript
// 기존 useEditor 훅 재활용
const { editor, saveStatus } = useEditor({
  content: synopsis.content,
  onSave: async (content) => {
    await synopsisRepository.update(synopsis.id, { content });
  },
  debounceMs: 2000,
});
```

---

## 버전 관리

### 버전 생성 시점

| 시점 | 설명 |
|------|------|
| 수동 저장 | 사용자가 명시적으로 저장 버튼 클릭 |
| 세션 종료 | 페이지 이탈 시 |
| 일정 간격 | 5분마다 자동 스냅샷 |

### Diff 계산

```typescript
import { diffLines } from "diff";

function calculateDiff(oldText: string, newText: string): DiffEntry[] {
  const changes = diffLines(oldText, newText);
  return changes.map(change => ({
    type: change.added ? "add" : change.removed ? "remove" : "modify",
    value: change.value,
  }));
}
```

---

## Repository 패턴

```typescript
interface SynopsisRepository {
  findByProjectId(projectId: string): Promise<Synopsis | null>;
  create(data: CreateSynopsisInput): Promise<Synopsis>;
  update(id: string, data: UpdateSynopsisInput): Promise<Synopsis>;

  // 버전 관리
  getVersions(synopsisId: string): Promise<SynopsisVersion[]>;
  getVersion(versionId: string): Promise<SynopsisVersion | null>;
  restoreVersion(synopsisId: string, versionId: string): Promise<Synopsis>;
}
```

---

## 컴포넌트 구조

```
src/components/features/synopsis/
├── index.ts                    # barrel export
├── SynopsisEditor.tsx          # 시놉시스 에디터
├── SynopsisHistoryPanel.tsx    # 히스토리 사이드 패널
├── SynopsisVersionItem.tsx     # 버전 목록 아이템
├── SynopsisDiffView.tsx        # diff 비교 뷰
└── SynopsisRestoreDialog.tsx   # 복원 확인 다이얼로그
```

---

## 오프라인 처리

1. 로컬 저장 우선 (IndexedDB)
2. 버전 히스토리도 로컬에 저장
3. 온라인 복귀 시 서버 동기화
4. 충돌 시 최신 버전 우선 (또는 사용자 선택)
