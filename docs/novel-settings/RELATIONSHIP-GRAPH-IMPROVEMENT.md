# 관계도 그래프 개선

## 개요

드래그 앤 드롭 기반 관계도 생성 UX로 개선.

## 현재 방식

```
1. "관계 추가" 버튼 클릭
2. Dialog에서 캐릭터 A 선택
3. Dialog에서 캐릭터 B 선택
4. 관계 유형, 라벨 입력
5. 저장 → 그래프에 노드/엣지 생성
```

**문제점:**
- 관계 없는 캐릭터는 그래프에 표시 안 됨
- 직관적이지 않은 Dialog 기반 플로우
- 양방향 관계가 단방향 화살표로만 표시

## 변경 후 방식

### 레이아웃

```
┌──────────────────────────────────────┬────────────┐
│                                      │ 캐릭터     │
│                                      │            │
│           관계도 그래프               │ ○ 홍길동   │
│                                      │ ○ 김철수   │
│    [A] ─────────→ [B]                │ ○ 이영희   │
│         "형"                         │ ○ 박지민   │
│    [A] ←───────── [B]                │            │
│         "동생"                       │            │
│                                      │            │
└──────────────────────────────────────┴────────────┘
```

### 캐릭터 패널 (우측)

**위치:** 그래프 영역 우측

**내용:**
- 등록된 모든 캐릭터 목록
- 이름 + 프로필 이미지 썸네일
- 이미 그래프에 있는 캐릭터는 비활성화 표시 또는 체크 표시

**동작:**
- 캐릭터를 그래프 영역으로 드래그 → 해당 위치에 노드 생성

### 노드 생성 (드래그)

```
캐릭터 패널에서 드래그 → 그래프 영역에 드롭 → 노드 생성
```

**세부 동작:**
1. 캐릭터 항목 드래그 시작
2. 그래프 영역 위로 이동 → 드롭 가능 영역 표시
3. 드롭 → 해당 위치에 CharacterNode 생성
4. 노드는 이후 자유롭게 이동 가능

### 간선 생성 (노드 연결)

```
노드 A의 핸들에서 드래그 시작 → 노드 B로 연결 → 관계 설정 Dialog
```

**세부 동작:**
1. 노드 A의 출력 핸들(하단)에서 드래그 시작
2. 노드 B의 입력 핸들(상단)로 연결
3. 연결 완료 시 RelationshipDialog 자동 표시
4. Dialog에서 관계 유형, 라벨, 양방향 여부 설정
5. 저장 → 엣지 생성

**기존 관계 수정:**
- 엣지의 라벨 클릭 → RelationshipDialog (편집 모드)

**중복 방지:**
- A→B 관계가 이미 존재하면 새 연결 시 기존 관계 편집 모드로

### 노드 삭제

**방법 1: 삭제 버튼**
- 노드 선택 시 삭제 버튼 표시
- 클릭 → 확인 Dialog → 삭제

**방법 2: 드래그 아웃**
- 노드를 그래프 영역 밖으로 드래그
- 드롭 시 삭제 (확인 Dialog 표시)

**삭제 시 동작:**
- 해당 노드 제거
- 연결된 모든 관계(엣지)도 함께 제거
- 캐릭터 데이터는 유지 (그래프에서만 제거)

### 양방향 관계 표시

**현재:**
```
A ─────────────→ B
      "형"
```
- 단방향 화살표만
- reverseLabel은 팝오버에서만 확인

**변경 후:**
```
A ─────────────→ B
      "형"

A ←───────────── B
      "동생"
```

**구현 방식:**
- 양방향 관계 시 2개의 곡선 엣지 생성
- 위쪽 곡선: A→B (label)
- 아래쪽 곡선: B→A (reverseLabel)
- 각 곡선에 화살표 + 라벨 표시

**라벨 위치:**
- 각 곡선의 중앙에 라벨 배치
- 곡선 곡률로 라벨 겹침 방지

## 데이터 구조

기존 `Relationship` 타입 유지:

```typescript
interface Relationship {
  id: string;
  projectId: string;
  fromCharacterId: string;
  toCharacterId: string;
  type: RelationshipType;
  label: string;
  reverseLabel: string | null;
  bidirectional: boolean;
  description: string | null;
  // ...
}
```

**그래프 노드 위치 저장 (신규):**
- 노드 위치를 저장하여 다음 접속 시 복원
- `Character` 또는 별도 테이블에 `graphPosition: { x, y }` 추가 고려

## 영향받는 파일

### 수정
- `src/app/(dashboard)/novels/[id]/relationships/page.tsx`
- `src/components/features/relationship/RelationshipGraph.tsx`
- `src/components/features/relationship/RelationshipEdge.tsx`
- `src/components/features/relationship/RelationshipDialog.tsx`

### 신규
- `src/components/features/relationship/CharacterPanel.tsx` - 우측 캐릭터 목록
- `src/components/features/relationship/DraggableCharacter.tsx` - 드래그 가능 캐릭터 항목

## ReactFlow 활용

**드래그 앤 드롭:**
- `onDrop`, `onDragOver` 이벤트 활용
- 외부에서 드래그한 데이터를 그래프에 노드로 추가

**간선 연결:**
- `onConnect` 콜백으로 새 연결 감지
- 연결 시 Dialog 표시

**양방향 엣지:**
- 같은 source/target에 대해 2개 엣지 생성
- `sourceHandle`, `targetHandle`로 구분
- Bezier 곡선에 curvature 옵션으로 위/아래 분리

## UI 흐름

### 새 관계 생성

```
1. 캐릭터 A를 패널에서 그래프로 드래그 → 노드 A 생성
2. 캐릭터 B를 패널에서 그래프로 드래그 → 노드 B 생성
3. 노드 A 하단 핸들 → 노드 B 상단 핸들로 드래그
4. RelationshipDialog 표시
5. 관계 유형: "가족", 라벨: "형", 양방향: true, 역라벨: "동생"
6. 저장 → 2개 곡선 엣지 생성 (A→B "형", B→A "동생")
```

### 관계 수정

```
1. 엣지의 "형" 라벨 클릭
2. RelationshipDialog (편집 모드) 표시
3. 라벨 변경: "오빠"
4. 저장 → 엣지 라벨 업데이트
```

### 노드 삭제

```
1. 노드 A를 그래프 밖으로 드래그
2. 확인 Dialog: "홍길동을 관계도에서 제거하시겠습니까?"
3. 확인 → 노드 A 및 연결된 모든 엣지 제거
```
