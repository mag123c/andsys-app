# 작업 체크리스트 (Task)

Novel Settings 기능 구현을 위한 작업 목록.

## 개발 단계 개요

| Phase | 범위 | 복잡도 | 예상 파일 수 |
|-------|------|--------|-------------|
| 1 | 소설 상세 레이아웃 변경 | ⭐⭐ | 5-8 |
| 2 | 시놉시스 (Tiptap 재활용) | ⭐⭐ | 8-12 |
| 3 | 등장인물 CRUD | ⭐⭐⭐ | 15-20 |
| 4 | 관계 설정 (리스트) | ⭐⭐ | 8-12 |
| 5 | 표지 이미지 | ⭐⭐ | 5-8 |
| 6 | 우측 사이드바 | ⭐⭐⭐ | 10-15 |
| 7 | 히스토리 (diff) | ⭐⭐⭐⭐ | 12-18 |
| 8 | 관계도 UI (노드 그래프) | ⭐⭐⭐⭐⭐ | 15-25 |

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

## Phase 2: 시놉시스

Tiptap 에디터를 재활용한 시놉시스 편집기.

### 체크리스트

- [ ] 데이터 레이어
  - [ ] Synopsis 타입 정의
  - [ ] Dexie 스키마 추가
  - [ ] Supabase 마이그레이션
  - [ ] Repository 구현
- [ ] 훅
  - [ ] `useSynopsis(projectId)` 구현
- [ ] UI
  - [ ] 시놉시스 페이지 (`/novels/[id]/synopsis`)
  - [ ] 에디터 컴포넌트 (기존 재활용)
  - [ ] 자동 저장 연동
- [ ] 히스토리 (기본)
  - [ ] 버전 저장 로직
  - [ ] 버전 목록 UI

### 파일 목록

```
src/repositories/types/synopsis.ts
src/storage/local/synopsis.local.ts
src/storage/remote/synopsis.remote.ts
src/hooks/useSynopsis.ts
src/app/(dashboard)/novels/[id]/synopsis/page.tsx
src/components/features/synopsis/
├── SynopsisEditor.tsx
└── SynopsisHistoryPanel.tsx
supabase/migrations/XXX_add_synopsis.sql
```

---

## Phase 3: 등장인물 CRUD

캐릭터 생성, 조회, 수정, 삭제 기능.

### 체크리스트

- [ ] 데이터 레이어
  - [ ] Character 타입 정의
  - [ ] Dexie 스키마 추가
  - [ ] Supabase 마이그레이션
  - [ ] Repository 구현
- [ ] 훅
  - [ ] `useCharacters(projectId)` 구현
  - [ ] `useCharacter(characterId)` 구현
- [ ] UI
  - [ ] 등장인물 목록 페이지
  - [ ] 등장인물 상세 페이지
  - [ ] 캐릭터 카드
  - [ ] 생성 다이얼로그
  - [ ] 편집 폼
  - [ ] 드래그 정렬
- [ ] 이미지
  - [ ] 이미지 업로드 컴포넌트
  - [ ] 리사이즈 로직 (100x150)
  - [ ] Base64 저장 (오프라인)
  - [ ] Supabase Storage 업로드

### 파일 목록

```
src/repositories/types/character.ts
src/storage/local/character.local.ts
src/storage/remote/character.remote.ts
src/hooks/useCharacters.ts
src/hooks/useCharacter.ts
src/app/(dashboard)/novels/[id]/characters/page.tsx
src/app/(dashboard)/novels/[id]/characters/[characterId]/page.tsx
src/components/features/character/
├── CharacterCard.tsx
├── CharacterForm.tsx
├── CharacterImageUpload.tsx
├── CreateCharacterDialog.tsx
├── SortableCharacterList.tsx
└── CharacterCustomFields.tsx
supabase/migrations/XXX_add_characters.sql
```

---

## Phase 4: 관계 설정 (리스트)

캐릭터 간 관계 설정 (리스트 형태).

### 체크리스트

- [ ] 데이터 레이어
  - [ ] Relationship 타입 정의
  - [ ] Dexie 스키마 추가
  - [ ] Supabase 마이그레이션
  - [ ] Repository 구현
- [ ] 훅
  - [ ] `useRelationships(projectId)` 구현
- [ ] UI
  - [ ] 관계 목록 페이지
  - [ ] 관계 추가 다이얼로그
  - [ ] 관계 편집 다이얼로그
  - [ ] 관계 타입 선택 UI
  - [ ] 양방향 관계 처리

### 파일 목록

```
src/repositories/types/relationship.ts
src/storage/local/relationship.local.ts
src/storage/remote/relationship.remote.ts
src/hooks/useRelationships.ts
src/app/(dashboard)/novels/[id]/relationships/page.tsx
src/components/features/relationship/
├── RelationshipList.tsx
├── RelationshipCard.tsx
├── CreateRelationshipDialog.tsx
└── EditRelationshipDialog.tsx
supabase/migrations/XXX_add_relationships.sql
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

## Phase 6: 우측 사이드바

에디터에서 설정 참조용 우측 사이드바.

### 체크리스트

- [ ] 레이아웃
  - [ ] EditorLayout에 우측 사이드바 추가
  - [ ] 접기/펴기 토글
  - [ ] 상태 localStorage 저장
- [ ] 검색
  - [ ] 통합 검색 입력
  - [ ] 시놉시스 검색
  - [ ] 등장인물 검색
- [ ] 미리보기
  - [ ] 시놉시스 읽기 전용 뷰
  - [ ] 등장인물 목록
  - [ ] 캐릭터 상세 미리보기

### 파일 목록

```
src/components/features/editor/EditorLayout.tsx  # 수정
src/components/features/workspace/
├── RightSidebar.tsx
├── RightSidebarSearch.tsx
├── RightSidebarSynopsis.tsx
├── RightSidebarCharacters.tsx
└── CharacterPreviewCard.tsx
```

---

## Phase 7: 히스토리 (diff)

시놉시스/등장인물 버전 관리.

### 체크리스트

- [ ] 데이터 레이어
  - [ ] Version 타입 정의
  - [ ] Dexie 스키마 추가
  - [ ] Supabase 마이그레이션
  - [ ] Repository 구현
- [ ] Diff 계산
  - [ ] 필드별 비교 유틸리티
  - [ ] 텍스트 line diff
- [ ] 버전 관리
  - [ ] 자동 버전 생성
  - [ ] 버전 병합 로직
  - [ ] 복원 기능
- [ ] UI
  - [ ] 히스토리 패널
  - [ ] Diff 뷰 (Git 스타일)
  - [ ] 복원 확인 다이얼로그

### 파일 목록

```
src/repositories/types/version.ts
src/storage/local/version.local.ts
src/storage/remote/version.remote.ts
src/hooks/useVersionHistory.ts
src/lib/diff-utils.ts
src/components/features/history/
├── VersionHistoryPanel.tsx
├── VersionListItem.tsx
├── DiffView.tsx
├── LineDiffBlock.tsx
├── FieldDiffBlock.tsx
└── RestoreVersionDialog.tsx
supabase/migrations/XXX_add_versions.sql
```

---

## Phase 8: 관계도 UI (노드 그래프)

React Flow 기반 노드 그래프 시각화.

### 체크리스트

- [ ] 의존성
  - [ ] React Flow 설치
- [ ] 노드/엣지
  - [ ] CharacterNode 커스텀 노드
  - [ ] RelationshipEdge 커스텀 엣지
- [ ] 그래프 로직
  - [ ] 자동 레이아웃 (dagre)
  - [ ] 줌/팬 컨트롤
  - [ ] 필터링 (관계 타입별)
- [ ] UI
  - [ ] 그래프 뷰 컨테이너
  - [ ] 뷰 전환 (리스트 ↔ 그래프)
  - [ ] 범례
  - [ ] 노드 클릭 → 상세 보기

### 파일 목록

```
src/app/(dashboard)/novels/[id]/relationships/page.tsx  # 수정
src/components/features/relationship/
├── RelationshipGraph.tsx
├── CharacterNode.tsx
├── RelationshipEdge.tsx
├── GraphControls.tsx
├── GraphLegend.tsx
└── ViewToggle.tsx
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
