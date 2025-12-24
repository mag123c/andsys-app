# 버전 히스토리 (History)

시놉시스 및 등장인물 변경 이력 추적 기능.

## 개요

| 항목 | 내용 |
|------|------|
| **스타일** | Git diff 형태 |
| **대상** | 시놉시스, 등장인물 정보 |
| **저장** | 변경 시점마다 스냅샷 |
| **복원** | 이전 버전으로 되돌리기 |

---

## 데이터 스키마

### Version

```typescript
interface Version<T> {
  id: string;
  entityType: "synopsis" | "character";
  entityId: string;
  projectId: string;

  // 버전 정보
  version: number;            // 버전 번호 (1, 2, 3...)
  snapshot: T;                // 해당 시점의 전체 데이터
  diff: DiffEntry[];          // 이전 버전과의 차이

  // 메타
  createdAt: Date;
  createdBy: string | null;   // userId (게스트는 null)
}
```

### DiffEntry

```typescript
interface DiffEntry {
  type: "add" | "remove" | "modify";
  field: string;              // 변경된 필드명
  path?: string;              // 중첩 필드 경로 (예: "customFields.0.value")
  oldValue?: unknown;
  newValue?: unknown;

  // 텍스트 필드용 (line-by-line diff)
  lineDiff?: LineDiff[];
}

interface LineDiff {
  type: "same" | "add" | "remove";
  content: string;
  lineNumber?: number;
}
```

---

## Diff 계산

### 필드별 비교

```typescript
import { diff as deepDiff } from "deep-diff";

function calculateFieldDiff(
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>
): DiffEntry[] {
  const differences = deepDiff(oldData, newData);

  return differences?.map(d => ({
    type: d.kind === "N" ? "add" : d.kind === "D" ? "remove" : "modify",
    field: d.path?.join(".") ?? "",
    oldValue: d.lhs,
    newValue: d.rhs,
  })) ?? [];
}
```

### 텍스트 Line Diff (Git 스타일)

```typescript
import { diffLines } from "diff";

function calculateLineDiff(oldText: string, newText: string): LineDiff[] {
  const changes = diffLines(oldText, newText);

  let lineNumber = 1;
  const result: LineDiff[] = [];

  for (const change of changes) {
    const lines = change.value.split("\n").filter(Boolean);

    for (const line of lines) {
      if (change.added) {
        result.push({ type: "add", content: line });
      } else if (change.removed) {
        result.push({ type: "remove", content: line, lineNumber });
        lineNumber++;
      } else {
        result.push({ type: "same", content: line, lineNumber });
        lineNumber++;
      }
    }
  }

  return result;
}
```

---

## UI 설계

### 히스토리 목록

```
┌────────────────────────────────────────┐
│ 버전 히스토리                    [✕]   │
├────────────────────────────────────────┤
│                                        │
│ ● v5 (현재)                            │
│   2024-01-15 14:30                     │
│   변경: 성격, 배경                      │
│                                        │
│ ○ v4                     [비교] [복원] │
│   2024-01-14 10:15                     │
│   변경: 이름, 나이                      │
│                                        │
│ ○ v3                     [비교] [복원] │
│   2024-01-10 09:00                     │
│   변경: 외형                           │
│                                        │
│ ○ v2                     [비교] [복원] │
│   2024-01-08 15:20                     │
│   ...                                  │
│                                        │
│ ○ v1 (초기)                            │
│   2024-01-05 11:00                     │
│                                        │
└────────────────────────────────────────┘
```

### Diff 뷰 (Git 스타일)

```
┌────────────────────────────────────────────────────────────┐
│ v4 → v5 비교                                         [✕]   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ 성격 (personality)                                         │
│ ┌────────────────────────────────────────────────────┐     │
│ │   1   과묵하고 신중한 성격.                         │     │
│ │ - 2   감정을 잘 드러내지 않는다.                    │     │
│ │ + 2   감정을 잘 드러내지 않지만, 내면은 따뜻하다.    │     │
│ │   3   정의감이 강하다.                             │     │
│ │ + 4   약자를 돕는 것을 소명으로 여긴다.             │     │
│ └────────────────────────────────────────────────────┘     │
│                                                            │
│ 배경 (background)                                          │
│ ┌────────────────────────────────────────────────────┐     │
│ │ + 1   양반 가문 출신이나 서자로 태어났다.            │     │
│ │ + 2   어린 시절 차별을 겪으며 성장.                  │     │
│ └────────────────────────────────────────────────────┘     │
│                                                            │
│                              [이 버전으로 복원]            │
└────────────────────────────────────────────────────────────┘

범례: 초록(+) = 추가, 빨강(-) = 삭제, 회색 = 유지
```

### 필드 변경 Diff

```
┌────────────────────────────────────────────────────────────┐
│ 필드 변경 내역                                             │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ 이름                                                       │
│   이전: 홍길동                                              │
│   이후: 홍길동 (洪吉童)                                     │
│                                                            │
│ 나이                                                       │
│   이전: 24                                                 │
│   이후: 25                                                 │
│                                                            │
│ MBTI                                                       │
│   이전: (없음)                                              │
│   이후: INTJ                                               │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 버전 생성 전략

### 자동 생성 시점

| 시점 | 설명 |
|------|------|
| 저장 시 | 변경사항이 있을 때만 |
| 세션 종료 | 페이지 이탈 시 |
| 일정 간격 | 5분마다 (변경 있을 시) |

### 버전 병합

동일 세션 내 연속 변경은 하나의 버전으로 병합:

```typescript
const MERGE_WINDOW_MS = 5 * 60 * 1000; // 5분

async function saveWithVersion(entityId: string, newData: T) {
  const lastVersion = await getLatestVersion(entityId);

  const timeSinceLastVersion = Date.now() - lastVersion.createdAt.getTime();

  if (timeSinceLastVersion < MERGE_WINDOW_MS) {
    // 마지막 버전 업데이트 (병합)
    await updateVersion(lastVersion.id, newData);
  } else {
    // 새 버전 생성
    await createVersion(entityId, newData);
  }
}
```

---

## Repository 패턴

```typescript
interface VersionRepository {
  // 버전 조회
  findByEntity(
    entityType: "synopsis" | "character",
    entityId: string
  ): Promise<Version<unknown>[]>;

  getVersion(id: string): Promise<Version<unknown> | null>;

  // 버전 생성
  createVersion<T>(
    entityType: "synopsis" | "character",
    entityId: string,
    snapshot: T
  ): Promise<Version<T>>;

  // 복원
  restoreVersion(versionId: string): Promise<void>;

  // 비교
  compareVersions(
    versionId1: string,
    versionId2: string
  ): Promise<DiffEntry[]>;
}
```

---

## 컴포넌트 구조

```
src/components/features/history/
├── index.ts
├── VersionHistoryPanel.tsx    # 히스토리 사이드 패널
├── VersionListItem.tsx        # 버전 목록 아이템
├── DiffView.tsx               # 전체 diff 뷰
├── LineDiffBlock.tsx          # 텍스트 line diff
├── FieldDiffBlock.tsx         # 필드 변경 diff
├── RestoreVersionDialog.tsx   # 복원 확인 다이얼로그
└── DiffLegend.tsx             # 범례 (추가/삭제/수정)
```

---

## 스타일링

### Diff 색상

```css
/* 추가된 라인 */
.diff-add {
  background-color: rgba(34, 197, 94, 0.1);  /* green-500/10 */
  border-left: 3px solid rgb(34, 197, 94);   /* green-500 */
}

/* 삭제된 라인 */
.diff-remove {
  background-color: rgba(239, 68, 68, 0.1);  /* red-500/10 */
  border-left: 3px solid rgb(239, 68, 68);   /* red-500 */
}

/* 변경 없음 */
.diff-same {
  color: var(--muted-foreground);
}
```

---

## 저장 및 정리

### 버전 보관 정책

| 기간 | 정책 |
|------|------|
| 최근 30일 | 모든 버전 보관 |
| 30일 ~ 90일 | 일별 마지막 버전만 |
| 90일 이후 | 주별 마지막 버전만 |

### 정리 스크립트

```typescript
async function cleanupOldVersions(projectId: string) {
  const now = Date.now();
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  const NINETY_DAYS = 90 * 24 * 60 * 60 * 1000;

  // 30일 ~ 90일: 일별 마지막만 유지
  // 90일 이후: 주별 마지막만 유지
  // (구현 상세 생략)
}
```

---

## 오프라인 처리

- 버전 히스토리도 IndexedDB에 저장
- 온라인 복귀 시 서버와 동기화
- 충돌 시: 로컬 버전 우선 저장 후 서버 버전 추가
