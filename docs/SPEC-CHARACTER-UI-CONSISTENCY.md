# 캐릭터 UI/UX 일관성 개선

> 상태: **완료** (2026-01-03)
>
> ### 작업 결과 요약
> - ✅ Task 1: CharacterWikiCard 필드 크기 일관성 수정
> - ✅ Task 2: 소설 상세 캐릭터에 관계 설정 필드 추가
> - ✅ Task 3: 관계도 모달 패딩/마진 일관성 수정
> - ✅ Task 4: 소설 상세에 관계도 버튼 추가

## 배경

회차 상세와 소설 상세에서 캐릭터 관련 UI가 일관되지 않음. 필드 크기, 관계 설정 방식, 관계도 접근 방식이 다름.

---

## 문제점 분석

### 1. CharacterWikiCard 필드 크기 불일치

**파일**: `src/components/features/workspace/CharacterWikiCard.tsx`

| 필드 유형 | 라벨 너비 | 적용 필드 |
|----------|----------|----------|
| grid 필드 (compact=true) | `w-16` | 키, 몸무게, 직업, 소속 |
| 일반 필드 (compact=false) | `w-24` | 나머지 모든 필드 |

**문제**:
- 같은 섹션 내에서 라벨 너비가 다름 (예: 외형 섹션의 "키" vs "외형 설명")
- Select 컴포넌트와 Input 컴포넌트의 높이도 미세하게 다름

**관련 코드** (420-443줄, 446-505줄):
```tsx
// Select 타입
<div className={cn("shrink-0 bg-muted px-2 py-1.5 text-muted-foreground", compact ? "w-16" : "w-24")}>

// Text/Number/Textarea 타입
<div className={cn("shrink-0 bg-muted px-2 py-1.5 text-muted-foreground", compact ? "w-16" : "w-24")}>
```

---

### 2. 소설 상세 vs 회차 상세 관계 설정 불일치

| 위치 | 컴포넌트 | 관계 편집 방식 |
|------|---------|--------------|
| **회차 상세** | `CharacterWikiCard` | 캐릭터 카드 내 `RelationshipEditor` 섹션 내장 (219-229줄) |
| **소설 상세** | `CharacterDialog` + `CharacterForm` | 관계 편집 필드 없음 |

**소설 상세에서 관계 편집하려면**:
1. 캐릭터 목록에서 캐릭터 카드의 메뉴 (⋮) 클릭
2. "관계" 메뉴 클릭
3. `RelationshipEditorDialog` 열림

**회차 상세에서 관계 편집하려면**:
1. 캐릭터 카드 펼치기
2. 하단의 "관계" 섹션에서 바로 추가/삭제

→ UX가 다름. 소설 상세가 더 불편함.

---

### 3. 관계도 모달 레이아웃 문제

**파일**:
- `src/components/features/workspace/RightSidebarCharacters.tsx` (173-186줄)
- `src/components/features/relationship/RelationshipGraph.tsx` (454줄)

```tsx
// RightSidebarCharacters.tsx - 모달 컨테이너
<DialogContent className="max-w-6xl h-[80vh]">
  <DialogHeader>
    <DialogTitle>관계도</DialogTitle>
  </DialogHeader>
  <div className="flex-1 min-h-0">
    <RelationshipGraph ... />
  </div>
</DialogContent>

// RelationshipGraph.tsx - 내부 컨테이너
<div className="flex h-[600px] border rounded-lg overflow-hidden">
```

**문제**:
- 부모: `h-[80vh]` (뷰포트 높이의 80%)
- 자식: `h-[600px]` (고정 높이)
- 패딩/마진이 DialogContent 기본값과 맞지 않음

---

### 4. 소설 상세 관계도 접근 방식

**현재 상태**:
- `/novels/[id]/relationships` → `/novels/[id]/characters`로 리디렉트
- 소설 상세의 캐릭터 페이지에 **전체 관계도 보기 버튼 없음**
- 회차 상세에는 "관계도" 버튼이 헤더에 있음 (`RightSidebarCharacters.tsx` 122-132줄)

```tsx
// 회차 상세 - 관계도 버튼 있음
{characters.length >= 2 && (
  <Button variant="ghost" size="sm" onClick={() => setRelationshipDialogOpen(true)}>
    <Network className="h-4 w-4 mr-1" />
    관계도
  </Button>
)}
```

**소설 상세** (`/novels/[id]/characters/page.tsx`):
- 헤더에 "추가" 버튼만 있음
- 관계도 버튼 없음

---

## 작업 태스크

### Task 1: CharacterWikiCard 필드 크기 일관성 ✅

**목표**: 모든 필드의 라벨 너비를 동일하게 통일

**변경 파일**:
- `src/components/features/workspace/CharacterWikiCard.tsx`

**실제 변경 내용**:
1. `LABEL_WIDTH = "w-20"` 상수 추가
2. `compact` prop 제거
3. 모든 필드 라벨 너비를 `LABEL_WIDTH` 상수 사용으로 통일
4. RelationshipEditor의 라벨도 동일 상수 사용
5. 커스텀 필드 라벨도 동일 상수 사용 (`w-24` → `LABEL_WIDTH`)

**변경 코드**:
```tsx
// 상수 추가
const LABEL_WIDTH = "w-20";

// Before
<div className={cn("shrink-0 bg-muted px-2 py-1.5", compact ? "w-16" : "w-24")}>

// After
<div className={cn("shrink-0 bg-muted px-2 py-1.5", LABEL_WIDTH)}>
```

---

### Task 2: 소설 상세 캐릭터에 관계 설정 추가 ✅

**목표**: CharacterDialog에서도 관계를 편집할 수 있도록 함

**변경 파일**:
- `src/components/features/character/CharacterDialog.tsx`
- `src/app/(dashboard)/novels/[id]/characters/page.tsx`

**실제 변경 내용**:
1. CharacterDialog에 props 추가:
   - `relationships?: Relationship[]`
   - `allCharacters?: Character[]`
   - `onRelationshipCreate?: (data: CreateRelationshipInput) => Promise<void>`
   - `onRelationshipDelete?: (id: string) => Promise<void>`
2. 탭 UI 추가 ("기본 정보" / "관계")
3. `RelationshipSection` 컴포넌트 추가 (관계 목록 표시, 추가/삭제 기능)
4. page.tsx에서 편집용 CharacterDialog에 관계 props 전달

**구현 방식**: 별도 탭으로 분리 (기본정보 / 관계)

---

### Task 3: 관계도 모달 패딩/마진 일관성 ✅

**목표**: 관계도 모달의 레이아웃을 일관되게 수정

**변경 파일**:
- `src/components/features/relationship/RelationshipGraph.tsx`
- `src/components/features/workspace/RightSidebarCharacters.tsx`

**실제 변경 내용**:
1. RelationshipGraph: `h-[600px]` → `h-full min-h-[400px]`
2. DialogContent: `flex flex-col p-0` 추가
3. DialogHeader: `px-6 pt-6 pb-4 shrink-0` 추가
4. 내부 div: `px-6 pb-6` 추가 (상하좌우 패딩 일관성)

**변경 코드**:
```tsx
// RelationshipGraph.tsx
// Before
<div className="flex h-[600px] border rounded-lg overflow-hidden">
// After
<div className="flex h-full min-h-[400px] border rounded-lg overflow-hidden">

// RightSidebarCharacters.tsx
<DialogContent className="max-w-6xl h-[80vh] flex flex-col p-0">
  <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
    <DialogTitle>관계도</DialogTitle>
  </DialogHeader>
  <div className="flex-1 min-h-0 px-6 pb-6">
    <RelationshipGraph ... />
  </div>
</DialogContent>
```

---

### Task 4: 소설 상세에 관계도 버튼 추가 ✅

**목표**: 소설 상세 캐릭터 페이지에서도 관계도를 볼 수 있도록 함

**변경 파일**:
- `src/app/(dashboard)/novels/[id]/characters/page.tsx`

**실제 변경 내용**:
1. `Network` 아이콘, `Dialog` 컴포넌트, `RelationshipGraph` import 추가
2. `showRelationshipGraph` 상태 추가
3. 헤더에 "관계도" 버튼 추가 (캐릭터 2명 이상일 때만 표시)
4. 관계도 모달 추가 (관계 생성/삭제 가능, Task 3 레이아웃 적용)

**변경 코드**:
```tsx
const [showRelationshipGraph, setShowRelationshipGraph] = useState(false);

// 헤더
<div className="flex items-center justify-between mb-6">
  <h2 className="text-lg font-semibold">등장인물</h2>
  <div className="flex items-center gap-2">
    {characters.length >= 2 && (
      <Button variant="outline" onClick={() => setShowRelationshipGraph(true)}>
        <Network className="mr-2 h-4 w-4" />
        관계도
      </Button>
    )}
    <Button onClick={() => setShowCreateDialog(true)}>
      <Plus className="mr-2 h-4 w-4" />
      추가
    </Button>
  </div>
</div>

// 모달 (Task 3 레이아웃 적용)
<Dialog open={showRelationshipGraph} onOpenChange={setShowRelationshipGraph}>
  <DialogContent className="max-w-6xl h-[80vh] flex flex-col p-0">
    <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
      <DialogTitle>관계도</DialogTitle>
    </DialogHeader>
    <div className="flex-1 min-h-0 px-6 pb-6">
      <RelationshipGraph
        characters={characters}
        relationships={relationships}
        onDelete={handleRelationshipDelete}
        onCreate={(fromId, toId) => {
          handleRelationshipCreate({
            projectId,
            fromCharacterId: fromId,
            toCharacterId: toId,
            type: "custom",
            bidirectional: true,
            description: null,
          });
        }}
      />
    </div>
  </DialogContent>
</Dialog>
```

---

## 우선순위

| 순서 | 태스크 | 이유 |
|-----|-------|------|
| 1 | Task 1: 필드 크기 일관성 | 가장 간단, 즉시 시각적 개선 |
| 2 | Task 3: 관계도 모달 레이아웃 | Task 4와 연관, 먼저 수정 |
| 3 | Task 4: 소설 상세 관계도 버튼 | 기능 추가, Task 3 완료 후 |
| 4 | Task 2: 관계 설정 필드 | 가장 복잡, 마지막 |

---

## 참고 파일

| 파일 | 역할 |
|------|------|
| `src/components/features/workspace/CharacterWikiCard.tsx` | 회차 상세 캐릭터 카드 (위키 스타일) |
| `src/components/features/workspace/RightSidebarCharacters.tsx` | 회차 상세 우측 사이드바 캐릭터 탭 |
| `src/components/features/character/CharacterDialog.tsx` | 소설 상세 캐릭터 생성/편집 다이얼로그 |
| `src/components/features/character/CharacterForm.tsx` | 캐릭터 폼 (CharacterDialog에서 사용) |
| `src/components/features/character/CharacterCard.tsx` | 소설 상세 캐릭터 카드 |
| `src/components/features/character/RelationshipEditorDialog.tsx` | 소설 상세 관계 편집 다이얼로그 |
| `src/components/features/relationship/RelationshipGraph.tsx` | 관계도 그래프 컴포넌트 |
| `src/app/(dashboard)/novels/[id]/characters/page.tsx` | 소설 상세 캐릭터 페이지 |

---

## 스크린샷 참고

문제가 발생한 UI 스크린샷:
1. 회차 상세 캐릭터 패널 - 필드 크기 불일치
2. 관계도 모달 - 패딩/마진 불일치

---

## 변경된 파일 목록

| 파일 | 변경 내용 |
|------|----------|
| `src/components/features/workspace/CharacterWikiCard.tsx` | LABEL_WIDTH 상수 추가, compact prop 제거 |
| `src/components/features/character/CharacterDialog.tsx` | 관계 props 추가, 탭 UI, RelationshipSection 컴포넌트 |
| `src/components/features/relationship/RelationshipGraph.tsx` | 고정 높이 → 유연한 높이 |
| `src/components/features/workspace/RightSidebarCharacters.tsx` | 관계도 모달 레이아웃 개선 |
| `src/app/(dashboard)/novels/[id]/characters/page.tsx` | 관계도 버튼, 모달 추가 |

---

최종 수정: 2026-01-03 (완료)
