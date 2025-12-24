# 작업 체크리스트 (Task)

Novel Settings 기능 구현을 위한 작업 목록.

## 개발 단계 개요

| Phase | 범위 | 복잡도 | 예상 파일 수 | 상태 |
|-------|------|--------|-------------|------|
| 1 | 소설 상세 레이아웃 변경 | ⭐⭐ | 5-8 | ✅ |
| 2 | 시놉시스 (Tiptap 재활용) | ⭐⭐ | 8-12 | ✅ |
| 3 | 등장인물 CRUD | ⭐⭐⭐ | 15-20 | ✅ |
| 4 | 관계 설정 (리스트) | ⭐⭐ | 8-12 | ✅ |
| 5 | 표지 이미지 | ⭐⭐ | 5-8 | ✅ |
| 6 | 우측 사이드바 | ⭐⭐⭐ | 10-15 | ✅ |
| 7 | 히스토리 (diff) | ⭐⭐⭐⭐ | 12-18 | ✅ |
| 8 | 관계도 UI (노드 그래프) | ⭐⭐⭐⭐⭐ | 15-25 | ✅ |
| 9 | 사이드바 개선 | ⭐⭐ | 1-3 | ✅ |
| 10 | 관계도 드래그 앤 드롭 | ⭐⭐⭐⭐ | 5-8 | 예정 |

---

## Phase 1: 레이아웃 변경 ✅

소설 상세 페이지에 좌측 사이드바 추가.

### 체크리스트

- [x] 레이아웃 컴포넌트 설계
  - [x] `NovelDetailLayout.tsx` 생성
  - [x] 좌측 사이드바 기본 구조
  - [x] 접기/펴기 토글 구현
- [x] 네비게이션 구조
  - [x] 회차 목록 섹션
  - [x] 시놉시스 링크
  - [x] 등장인물 링크
  - [x] 관계도 링크
- [x] 상태 저장
  - [x] localStorage에 접힌 상태 저장
- [x] 반응형
  - [x] lg 미만: 드로어로 변환

### 파일 목록

```
src/app/(dashboard)/novels/[id]/layout.tsx      # 신규
src/components/features/workspace/
├── NovelDetailLayout.tsx                       # 신규
├── NovelSidebar.tsx                            # 신규
├── SidebarToggle.tsx                           # 신규
└── index.ts                                    # 신규
```

---

## Phase 2: 시놉시스 ✅

Tiptap 에디터를 재활용한 시놉시스 편집기.

### 체크리스트

- [x] 데이터 레이어
  - [x] Synopsis 타입 정의
  - [x] Dexie 스키마 추가 (v3)
  - [ ] Supabase 마이그레이션 (추후)
  - [x] Repository 구현 (로컬)
- [x] 훅
  - [x] `useSynopsis(projectId)` 구현
- [x] UI
  - [x] 시놉시스 페이지 (`/novels/[id]/synopsis`)
  - [x] 에디터 컴포넌트 (기존 재활용)
  - [x] 자동 저장 연동 (2000ms debounce)
- [ ] 히스토리 (기본) - Phase 7로 이동
  - [ ] 버전 저장 로직
  - [ ] 버전 목록 UI

### 파일 목록

```
src/repositories/types/synopsis.ts                 # 신규
src/repositories/synopsis.repository.ts            # 신규
src/storage/local/synopsis.local.ts                # 신규
src/storage/local/db.ts                            # 수정 (v3)
src/hooks/useSynopsis.ts                           # 신규
src/app/(dashboard)/novels/[id]/synopsis/page.tsx  # 신규
src/components/features/synopsis/
├── SynopsisEditor.tsx                             # 신규
└── index.ts                                       # 신규
src/components/ui/skeleton.tsx                     # 신규 (shadcn)
```

---

## Phase 3: 등장인물 CRUD ✅

캐릭터 생성, 조회, 수정, 삭제 기능.

### 체크리스트

- [x] 데이터 레이어
  - [x] Character 타입 정의 (CustomField 포함)
  - [x] Dexie 스키마 추가 (v4)
  - [ ] Supabase 마이그레이션 (추후)
  - [x] Repository 구현 (로컬)
- [x] 훅
  - [x] `useCharacters(projectId)` 구현 (CRUD + reorder)
- [x] UI
  - [x] 등장인물 목록 페이지 (`/novels/[id]/characters`)
  - [x] 캐릭터 카드 (CharacterCard)
  - [x] 생성/편집 다이얼로그 (CharacterDialog)
  - [x] 편집 폼 (CharacterForm)
  - [x] 드래그 정렬 (SortableCharacterGrid, @dnd-kit)
- [x] 이미지
  - [x] 이미지 업로드 (CharacterForm 내장)
  - [x] 리사이즈 로직 (image-utils.ts 재활용)
  - [x] Base64 저장 (오프라인)
  - [ ] Supabase Storage 업로드 (추후)

### 파일 목록

```
src/repositories/types/character.ts                # 신규
src/repositories/character.repository.ts           # 신규
src/storage/local/character.local.ts               # 신규
src/storage/local/db.ts                            # 수정 (v4)
src/hooks/useCharacters.ts                         # 신규
src/app/(dashboard)/novels/[id]/characters/page.tsx # 신규
src/components/features/character/
├── CharacterCard.tsx                              # 신규
├── CharacterForm.tsx                              # 신규
├── CharacterDialog.tsx                            # 신규
├── SortableCharacterGrid.tsx                      # 신규
├── EmptyCharacters.tsx                            # 신규
└── index.ts                                       # 신규
```

---

## Phase 4: 관계 설정 (리스트) ✅

캐릭터 간 관계 설정 (리스트 형태).

### 체크리스트

- [x] 데이터 레이어
  - [x] Relationship 타입 정의 (RELATIONSHIP_TYPES 8종)
  - [x] Dexie 스키마 추가 (v5)
  - [ ] Supabase 마이그레이션 (추후)
  - [x] Repository 구현 (로컬, deleteByCharacterId 포함)
- [x] 훅
  - [x] `useRelationships(projectId)` 구현
- [x] UI
  - [x] 관계 목록 페이지 (`/novels/[id]/relationships`)
  - [x] 관계 추가/편집 다이얼로그 (RelationshipDialog)
  - [x] 관계 타입 선택 UI (RELATIONSHIP_TYPES)
  - [x] 양방향 관계 처리 (bidirectional, reverseLabel)

### 파일 목록

```
src/repositories/types/relationship.ts             # 신규
src/repositories/relationship.repository.ts        # 신규
src/storage/local/relationship.local.ts            # 신규
src/storage/local/db.ts                            # 수정 (v5)
src/hooks/useRelationships.ts                      # 신규
src/app/(dashboard)/novels/[id]/relationships/page.tsx # 신규
src/components/features/relationship/
├── RelationshipList.tsx                           # 신규
├── RelationshipCard.tsx                           # 신규
├── RelationshipDialog.tsx                         # 신규
├── EmptyRelationships.tsx                         # 신규
└── index.ts                                       # 신규
src/components/ui/checkbox.tsx                     # 신규 (shadcn)
```

---

## Phase 5: 표지 이미지 ✅

소설 표지 이미지 업로드.

### 체크리스트

- [x] 데이터 레이어
  - [x] Project 타입에 coverImageUrl 추가
  - [x] Dexie 스키마 업데이트 (version 2)
  - [ ] Supabase 마이그레이션 (추후)
- [x] 이미지 처리
  - [x] 리사이즈 유틸리티 (100x150)
  - [x] Base64 변환
  - [ ] Supabase Storage 업로드 (추후)
- [x] UI
  - [x] CoverImageUpload 컴포넌트
  - [x] DefaultCoverImage 컴포넌트
  - [x] EditProjectDialog에 통합
  - [x] 소설 목록에 표지 표시

### 파일 목록

```
src/repositories/types/project.ts              # 수정
src/storage/local/db.ts                        # 수정 (version 2)
src/storage/local/project.local.ts             # 수정
src/storage/remote/project.remote.ts           # 수정
src/sync/sync-engine.ts                        # 수정
src/lib/image-utils.ts                         # 신규
src/components/features/project/
├── CoverImageUpload.tsx                       # 신규
├── DefaultCoverImage.tsx                      # 신규
├── EditProjectDialog.tsx                      # 수정
└── ProjectCard.tsx                            # 수정
```

---

## Phase 6: 우측 사이드바 ✅

에디터에서 설정 참조용 우측 사이드바.

### 체크리스트

- [x] 레이아웃
  - [x] EditorLayout에 우측 사이드바 추가
  - [x] 접기/펴기 토글
  - [x] 상태 localStorage 저장
- [x] 검색
  - [x] 등장인물 검색 (탭 내 검색)
- [x] 미리보기
  - [x] 시놉시스 읽기 전용 뷰
  - [x] 등장인물 목록
  - [x] 캐릭터 상세 미리보기

### 파일 목록

```
src/app/(editor)/novels/[id]/chapters/[chapterId]/page.tsx  # 수정
src/components/features/editor/EditorLayout.tsx             # 수정
src/components/features/workspace/
├── RightSidebar.tsx                                        # 신규
├── RightSidebarSynopsis.tsx                                # 신규
├── RightSidebarCharacters.tsx                              # 신규
├── CharacterPreviewCard.tsx                                # 신규
└── index.ts                                                # 수정
```

---

## Phase 7: 히스토리 (diff) ✅

시놉시스/등장인물 버전 관리.

### 체크리스트

- [x] 데이터 레이어
  - [x] Version 타입 정의
  - [x] Dexie 스키마 추가 (v6)
  - [ ] Supabase 마이그레이션 (추후)
  - [x] Repository 구현 (로컬)
- [x] Diff 계산
  - [x] 필드별 비교 유틸리티
  - [x] 텍스트 line diff (LCS 알고리즘)
- [x] 버전 관리
  - [x] 자동 버전 생성 (저장 시)
  - [x] 최대 50개 버전 유지
  - [x] 복원 기능
- [x] UI
  - [x] 히스토리 패널 (시놉시스 통합)
  - [x] Diff 뷰 (Git 스타일)
  - [x] 복원 확인 다이얼로그

### 파일 목록

```
src/repositories/types/version.ts                  # 신규
src/repositories/version.repository.ts             # 신규
src/storage/local/version.local.ts                 # 신규
src/storage/local/db.ts                            # 수정 (v6)
src/hooks/useVersionHistory.ts                     # 신규
src/hooks/useSynopsis.ts                           # 수정 (버전 연동)
src/hooks/useCharacters.ts                         # 수정 (버전 연동)
src/lib/diff-utils.ts                              # 신규
src/components/features/history/
├── VersionHistoryPanel.tsx                        # 신규
├── VersionListItem.tsx                            # 신규
├── DiffView.tsx                                   # 신규
└── RestoreVersionDialog.tsx                       # 신규
src/components/features/synopsis/SynopsisEditor.tsx # 수정
src/components/ui/scroll-area.tsx                  # 신규 (shadcn)
```

---

## Phase 8: 관계도 UI (노드 그래프) ✅

React Flow 기반 노드 그래프 시각화.

### 체크리스트

- [x] 의존성
  - [x] React Flow (@xyflow/react) 설치
  - [x] dagre, @types/dagre 설치
- [x] 노드/엣지
  - [x] CharacterNode 커스텀 노드
  - [x] RelationshipEdge 커스텀 엣지
- [x] 그래프 로직
  - [x] 자동 레이아웃 (dagre, graph-utils.ts)
  - [x] 줌/팬 컨트롤 (React Flow Controls)
  - [x] 필터링 (관계 타입별, GraphLegend)
- [x] UI
  - [x] 그래프 뷰 컨테이너 (RelationshipGraph)
  - [x] 뷰 전환 (리스트 ↔ 그래프, ViewToggle)
  - [x] 범례 (GraphLegend)
  - [x] 미니맵 (MiniMap)
  - [ ] 노드 클릭 → 상세 보기 (추후)

### 파일 목록

```
src/lib/graph-utils.ts                                  # 신규
src/app/(dashboard)/novels/[id]/relationships/page.tsx  # 수정
src/components/features/relationship/
├── RelationshipGraph.tsx                               # 신규
├── CharacterNode.tsx                                   # 신규
├── RelationshipEdge.tsx                                # 신규
├── GraphLegend.tsx                                     # 신규
├── ViewToggle.tsx                                      # 신규
└── index.ts                                            # 수정
src/components/ui/toggle.tsx                            # 신규 (shadcn)
src/components/ui/toggle-group.tsx                      # 신규 (shadcn)
```

---

## 의존성 추가

```bash
# Phase 7
pnpm add diff deep-diff
pnpm add -D @types/diff

# Phase 8
pnpm add @xyflow/react dagre
pnpm add -D @types/dagre
```

---

## 우선순위 정리

| 순서 | Phase | 이유 |
|------|-------|------|
| 1 | Phase 1 (레이아웃) | 다른 기능의 기반 |
| 2 | Phase 5 (표지) | 독립적, 빠른 완성 |
| 3 | Phase 2 (시놉시스) | 에디터 재활용, 기반 작업 |
| 4 | Phase 3 (등장인물) | 관계도의 전제조건 |
| 5 | Phase 4 (관계 리스트) | 그래프 전 단순 버전 |
| 6 | Phase 6 (우측 사이드바) | 시놉시스/인물 완성 후 |
| 7 | Phase 7 (히스토리) | 부가 기능 |
| 8 | Phase 8 (관계 그래프) | 가장 복잡, 마지막 |

---

## Phase 9: 사이드바 개선 ✅

NovelSidebar UX 개선.

> 상세: [SIDEBAR-IMPROVEMENT.md](./SIDEBAR-IMPROVEMENT.md)

### 체크리스트

- [x] 중간 "회차" 섹션 제거
- [x] 꺾쇠 펼침/접힘 추가
  - [x] 회차 목록 꺾쇠 (리스트: 회차들)
  - [x] 등장인물 꺾쇠 (리스트: 캐릭터 이름만)
  - [x] 꺾쇠 클릭 = 펼침, 메뉴 텍스트 클릭 = 페이지 이동
  - [x] 해당 페이지 진입 시 자동 펼침
  - [x] 빈 상태 시 꺾쇠 숨김
  - [x] 최대 20개 + "더보기" 버튼
- [x] 메뉴별 색상 적용
  - [x] 회차 목록: Blue (slate-500)
  - [x] 시놉시스: Green (emerald-500)
  - [x] 등장인물: Purple (violet-500)
  - [x] 관계도: Rose (rose-500)

### 파일 목록

```
src/components/features/workspace/NovelSidebar.tsx   # 수정
```

---

## Phase 10: 관계도 드래그 앤 드롭 (예정)

드래그 기반 관계도 생성 UX로 개선.

> 상세: [RELATIONSHIP-GRAPH-IMPROVEMENT.md](./RELATIONSHIP-GRAPH-IMPROVEMENT.md)

### 체크리스트

- [ ] 캐릭터 패널 (우측)
  - [ ] CharacterPanel 컴포넌트
  - [ ] 드래그 가능한 캐릭터 항목
  - [ ] 이미 그래프에 있는 캐릭터 표시
- [ ] 노드 드래그 생성
  - [ ] onDrop, onDragOver 이벤트 처리
  - [ ] 드롭 위치에 CharacterNode 생성
- [ ] 간선 드래그 연결
  - [ ] 노드 핸들에서 드래그
  - [ ] onConnect 시 RelationshipDialog 표시
  - [ ] 기존 관계 있으면 편집 모드
- [ ] 노드 삭제
  - [ ] 노드 선택 시 삭제 버튼
  - [ ] 드래그 아웃으로 삭제
  - [ ] 연결된 관계도 함께 삭제
- [ ] 양방향 엣지 개선
  - [ ] 2개 곡선 엣지 (위/아래)
  - [ ] 각 곡선에 라벨 표시
  - [ ] Bezier curvature로 분리
- [ ] "관계 추가" 버튼 제거

### 파일 목록

```
src/app/(dashboard)/novels/[id]/relationships/page.tsx    # 수정
src/components/features/relationship/
├── RelationshipGraph.tsx                                 # 수정
├── RelationshipEdge.tsx                                  # 수정
├── RelationshipDialog.tsx                                # 수정
├── CharacterPanel.tsx                                    # 신규
├── DraggableCharacter.tsx                                # 신규
└── index.ts                                              # 수정
```
