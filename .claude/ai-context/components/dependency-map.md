# Component Dependency Map

**Version:** 1.2.0
**Description:** 컴포넌트-훅-UseCase 의존성 맵

---

## Components

### Editor

#### EditorLayout
- **Path:** `src/components/features/editor/EditorLayout.tsx`
- **Description:** 에디터 페이지 전체 레이아웃
- **Hooks:** useChapters, useEditor, useSyncEngine, useSpellCheck, useUserSettings
- **Components:** Editor, EditorToolbar, EditorSidebar, EditorStatusBar, PlotMemo, SpellCheckSheet
- **Features:** autosave, spellcheck, plotMemo, chapterNavigation

#### Editor
- **Path:** `src/components/features/editor/Editor.tsx`
- **Description:** Tiptap EditorContent 래퍼
- **Hooks:** (없음)
- **Libs:** @tiptap/react
- **Props:** editor, className

#### EditorToolbar
- **Path:** `src/components/features/editor/EditorToolbar.tsx`
- **Description:** 서식 툴바 (폰트, 크기, 정렬 등)
- **Hooks:** useUserSettings
- **Props:** editor

#### EditorSidebar
- **Path:** `src/components/features/editor/EditorSidebar.tsx`
- **Description:** 사이드바 (챕터 목록, 플롯 메모)
- **Hooks:** useChapters
- **Components:** PlotMemo

#### SpellCheckSheet
- **Path:** `src/components/features/editor/SpellCheckSheet.tsx`
- **Description:** 맞춤법 검사 결과 시트
- **Hooks:** useSpellCheck
- **Props:** editor

---

### Project

#### ProjectCard
- **Path:** `src/components/features/project/ProjectCard.tsx`
- **Description:** 프로젝트 카드 (표지, 제목, 메뉴)
- **Hooks:** useProject
- **Components:** CoverImage, ProjectMenu
- **Features:** coverImage, delete, archive

#### ProjectList
- **Path:** `src/components/features/project/ProjectList.tsx`
- **Description:** 프로젝트 목록 그리드
- **Hooks:** useProjects
- **Components:** ProjectCard, CreateProjectDialog

---

### Chapter

#### ChapterList
- **Path:** `src/components/features/chapter/ChapterList.tsx`
- **Description:** 챕터 목록 (드래그앤드롭 정렬)
- **Hooks:** useChapters
- **Libs:** @dnd-kit/core, @dnd-kit/sortable
- **Components:** ChapterItem

---

### Character

#### CharacterCard
- **Path:** `src/components/features/character/CharacterCard.tsx`
- **Description:** 캐릭터 카드
- **Hooks:** useCharacters, useVersionHistory
- **Components:** CharacterImage, CharacterForm, CustomFieldsEditor
- **Features:** imageUpload, customFields, history

#### CharacterList
- **Path:** `src/components/features/character/CharacterList.tsx`
- **Description:** 캐릭터 목록 그리드 (드래그앤드롭 정렬)
- **Hooks:** useCharacters
- **Libs:** @dnd-kit/core, @dnd-kit/sortable
- **Components:** CharacterCard

---

### Relationship

#### RelationshipGraph
- **Path:** `src/components/features/relationship/RelationshipGraph.tsx`
- **Description:** 관계도 그래프 (React Flow)
- **Hooks:** useCharacters, useRelationships
- **Libs:** @xyflow/react
- **Components:** CharacterNode, RelationshipEdge, RelationshipDialog, CharacterPanel, GraphLegend
- **Features:** dragDrop, zoom, filter, addRelationship, readonly mode

---

### Synopsis

#### SynopsisEditor
- **Path:** `src/components/features/synopsis/SynopsisEditor.tsx`
- **Description:** 시놉시스 에디터
- **Hooks:** useSynopsis, useVersionHistory
- **Components:** Editor
- **Features:** autosave, history

---

### Workspace

#### NovelsListSidebar
- **Path:** `src/components/features/workspace/NovelsListSidebar.tsx`
- **Description:** 소설 목록 사이드바 (로고, 메뉴, 프로필)
- **Hooks:** useAuth, usePWAInstall
- **Components:** SidebarProfile, SettingsModal
- **Features:** 가이드북 링크, 디스코드 링크, 앱 다운로드 버튼

#### NovelsListLayout
- **Path:** `src/components/features/workspace/NovelsListLayout.tsx`
- **Description:** 소설 목록 페이지 레이아웃
- **Hooks:** useLocalStorageBoolean
- **Components:** NovelsListSidebar

#### NovelSidebar
- **Path:** `src/components/features/workspace/NovelSidebar.tsx`
- **Description:** 소설 상세 좌측 사이드바 (회차/시놉시스/등장인물 메뉴)
- **Hooks:** useAuth
- **Components:** SidebarProfile
- **Features:** 챕터 목록 펼침, 캐릭터 목록 펼침, 관계도 모달 트리거

#### NovelDetailLayout
- **Path:** `src/components/features/workspace/NovelDetailLayout.tsx`
- **Description:** 소설 상세 페이지 레이아웃 (사이드바 + 관계도 모달)
- **Hooks:** useProject, useChapters, useCharacters, useRelationships, useLocalStorageBoolean
- **Components:** NovelSidebar, RelationshipGraph
- **Features:** 사이드바 접힘/펼침, 관계도 모달

#### RightSidebar
- **Path:** `src/components/features/workspace/RightSidebar.tsx`
- **Description:** 에디터 우측 사이드바 (3탭: 시놉시스/등장인물/회차)
- **Components:** RightSidebarSynopsis, RightSidebarCharacters, RightSidebarChapters
- **Features:** 탭 전환, 접힘/펼침

#### RightSidebarSynopsis
- **Path:** `src/components/features/workspace/RightSidebarSynopsis.tsx`
- **Description:** 우측 사이드바 시놉시스 탭
- **Components:** Editor
- **Features:** 시놉시스 미리보기/편집

#### RightSidebarCharacters
- **Path:** `src/components/features/workspace/RightSidebarCharacters.tsx`
- **Description:** 우측 사이드바 등장인물 탭
- **Components:** CharacterWikiCard, RelationshipGraph
- **Features:** 캐릭터 검색, 위키 스타일 카드, 관계도 모달

#### RightSidebarChapters
- **Path:** `src/components/features/workspace/RightSidebarChapters.tsx`
- **Description:** 우측 사이드바 회차 탭
- **Features:** 회차 목록, 현재 회차 하이라이트

#### CharacterWikiCard
- **Path:** `src/components/features/workspace/CharacterWikiCard.tsx`
- **Description:** 캐릭터 위키 스타일 카드 (접힘/펼침)
- **Features:** 인라인 편집, 관계 표시, 커스텀 필드

#### CharacterPreviewCard
- **Path:** `src/components/features/workspace/CharacterPreviewCard.tsx`
- **Description:** 캐릭터 미리보기 카드 (툴팁용)
- **Features:** 호버 시 상세 정보 표시

#### SidebarProfile
- **Path:** `src/components/features/workspace/SidebarProfile.tsx`
- **Description:** 사이드바 하단 프로필 영역
- **Hooks:** useAuth
- **Features:** 아바타, 설정 버튼, 접힘 토글

#### SidebarToggle
- **Path:** `src/components/features/workspace/SidebarToggle.tsx`
- **Description:** 사이드바 접힘/펼침 토글 버튼

---

### Sync

#### SyncStatusIndicator
- **Path:** `src/components/features/sync/SyncStatusIndicator.tsx`
- **Description:** 동기화 상태 표시 (클라우드 환경 전용)
- **Hooks:** useSyncEngine, useAuth
- **Shows:** 클라우드 환경(브라우저)에서만, PWA에서는 숨김
- **Features:** pendingCount, lastSyncTime, manualSync

---

### PWA

#### InstallPrompt
- **Path:** `src/components/features/pwa/InstallPrompt.tsx`
- **Description:** PWA 설치 유도 배너
- **Hooks:** usePWAInstall
- **Shows:** 브라우저에서 설치 가능할 때
- **Location:** page.tsx (랜딩 페이지)

#### UpdatePrompt
- **Path:** `src/components/features/pwa/UpdatePrompt.tsx`
- **Description:** SW 업데이트 알림
- **Shows:** 새 버전 감지 시
- **Location:** layout.tsx

#### PWASyncButton
- **Path:** `src/components/features/pwa/PWASyncButton.tsx`
- **Description:** 수동 동기화 버튼 (로컬 환경 전용)
- **Hooks:** useSyncEngine, useAuth
- **Shows:** 로컬 환경(PWA)에서만
- **Location:** DashboardHeader.tsx
- **Behavior:**
  - guest: 클릭 시 /login으로 이동
  - member_offline: 비활성화
  - member_online: 수동 동기화 실행

---

### Share

#### ShareDialog
- **Path:** `src/components/features/share/ShareDialog.tsx`
- **Description:** 공유 링크 생성 다이얼로그
- **Hooks:** useAuth
- **Features:** password, expiration, copyLink

---

### Settings

#### SettingsModal
- **Path:** `src/components/features/settings/SettingsModal.tsx`
- **Description:** 설정 모달 (테마, 폰트, 백업, 계정)
- **Hooks:** useAuth, useProjects, useUserSettings, useUserStats
- **Trigger:** SidebarProfile 설정 버튼
- **Features:** theme, font, backup, shareLinks, account, statistics

---

## Hooks

### useAuth
- **Path:** `src/hooks/useAuth.ts`
- **Description:** AuthProvider에서 auth 상태 가져오기
- **Returns:** user, isGuest, isMember, signOut
- **Provider:** AuthProvider

### useProject
- **Path:** `src/hooks/useProject.ts`
- **Description:** 단일 프로젝트 CRUD
- **Storage:** storage/local/project.local.ts
- **Sync:** sync/sync-engine.ts
- **Reactivity:** dexie-react-hooks/useLiveQuery

### useProjects
- **Path:** `src/hooks/useProjects.ts`
- **Description:** 프로젝트 목록 및 CRUD (deleteProject는 UseCase 사용)
- **Storage:** storage/local/project.local.ts
- **UseCases:** deleteProjectUseCase
- **Reactivity:** dexie-react-hooks/useLiveQuery

### useChapters
- **Path:** `src/hooks/useChapters.ts`
- **Description:** 챕터 목록 및 CRUD (create/reorder는 UseCase 사용)
- **Storage:** storage/local/chapter.local.ts
- **UseCases:** createChapterUseCase, reorderChaptersUseCase
- **Reactivity:** dexie-react-hooks/useLiveQuery

### useSynopsis
- **Path:** `src/hooks/useSynopsis.ts`
- **Description:** 시놉시스 CRUD (getOrCreate 패턴)
- **Storage:** storage/local/synopsis.local.ts
- **Sync:** sync/sync-engine.ts

### useCharacters
- **Path:** `src/hooks/useCharacters.ts`
- **Description:** 캐릭터 목록 및 CRUD
- **Storage:** storage/local/character.local.ts
- **Sync:** sync/sync-engine.ts
- **Reactivity:** dexie-react-hooks/useLiveQuery

### useRelationships
- **Path:** `src/hooks/useRelationships.ts`
- **Description:** 관계도 CRUD
- **Storage:** storage/local/relationship.local.ts
- **Sync:** sync/sync-engine.ts
- **Reactivity:** dexie-react-hooks/useLiveQuery

### useVersionHistory
- **Path:** `src/hooks/useVersionHistory.ts`
- **Description:** 버전 히스토리 조회
- **Storage:** storage/local/version.local.ts
- **Note:** 로컬 전용, 서버 동기화 없음

### useEditor
- **Path:** `src/hooks/useEditor.ts`
- **Description:** Tiptap 에디터 상태 관리
- **Features:** autosave, wordCount, content

### useSpellCheck
- **Path:** `src/hooks/useSpellCheck.ts`
- **Description:** 맞춤법 검사 상태 및 교정
- **API:** /api/spellcheck
- **Status:** 점검 중 (의도적 비활성화)
- **Note:** API 구현 완료, spellcheck.ts에서 점검 메시지 반환

### useUserStats
- **Path:** `src/hooks/useUserStats.ts`
- **Description:** 사용자 통계 (프로젝트 수, 챕터 수, 총 글자수)
- **Returns:** totalProjects, totalChapters, totalWords
- **Reactivity:** dexie-react-hooks/useLiveQuery
- **UsedBy:** SettingsModal

### useSyncEngine
- **Path:** `src/hooks/useSyncEngine.ts`
- **Description:** 환경별 동기화 엔진 (로컬=수동, 클라우드=자동)
- **Dependencies:** useAuth, useOnline, usePWAMode
- **Returns:** status, isOnline, pendingCount, lastError, isPwaMode, syncNow
- **Behavior:**
  - pwa: 자동 동기화 비활성화, 수동만
  - browser_member: debounce 2초 후 자동 동기화
  - browser_guest: 동기화 없음
- **Realtime:** Supabase Realtime

### usePWAMode
- **Path:** `src/hooks/usePWAMode.ts`
- **Description:** PWA 모드 감지 (standalone 여부)
- **Lib:** src/lib/pwa.ts
- **Returns:** boolean
- **Pattern:** useSyncExternalStore

### useOnline
- **Path:** `src/hooks/useOnline.ts`
- **Description:** 온라인/오프라인 상태 감지
- **API:** navigator.onLine + event listeners

### useUserSettings
- **Path:** `src/hooks/useUserSettings.ts`
- **Description:** 사용자 설정 관리 (폰트, 테마 등)
- **Storage:** localStorage

### useLocalStorage
- **Path:** `src/hooks/useLocalStorage.ts`
- **Description:** localStorage 동기화 (SSR 안전)
- **Pattern:** useSyncExternalStore
- **Exports:** useLocalStorage, useLocalStorageBoolean
- **Note:** SSR/hydration 안전하게 localStorage 값 읽기/쓰기

### useAdmin
- **Path:** `src/hooks/useAdmin.ts`
- **Description:** 관리자 권한 확인
- **API:** /api/admin/check
- **Returns:** isAdmin, isChecking
- **Dependencies:** useAuth

### usePWAInstall
- **Path:** `src/hooks/usePWAInstall.tsx`
- **Description:** PWA 설치 프롬프트 전역 공유
- **Provider:** PWAInstallProvider
- **Returns:** canInstall, install, isPwaMode, showInstallButton
- **Note:** beforeinstallprompt 이벤트 공유

---

## Providers

### AuthProvider
- **Path:** `src/components/providers/AuthProvider.tsx`
- **Description:** 인증 상태 관리 (게스트/회원)
- **Context:** AuthContext

### ThemeProvider
- **Path:** `src/components/providers/ThemeProvider.tsx`
- **Description:** 테마 관리 (light/dark/system)
- **Lib:** next-themes

### SyncProvider
- **Path:** `src/components/providers/SyncProvider.tsx`
- **Description:** 동기화 엔진 초기화 및 Realtime 구독
- **Context:** SyncContext

### PWAInstallProvider
- **Path:** `src/hooks/usePWAInstall.tsx`
- **Description:** beforeinstallprompt 이벤트 전역 공유
- **Context:** PWAInstallContext
- **Location:** layout.tsx

---

## UseCases

### deleteProjectUseCase
- **Path:** `src/application/project/delete-project.usecase.ts`
- **Description:** 프로젝트 삭제 (CASCADE DELETE 적용)
- **Rule:** CASCADE_DELETE
- **Dependencies:** storage/local/db
- **UsedBy:** useProjects

### createChapterUseCase
- **Path:** `src/application/chapter/create-chapter.usecase.ts`
- **Description:** 챕터 생성 (프로젝트 검증 포함)
- **Dependencies:** storage/local/db, storage/local/chapter.local.ts
- **UsedBy:** useChapters

### reorderChaptersUseCase
- **Path:** `src/application/chapter/reorder-chapters.usecase.ts`
- **Description:** 챕터 순서 변경 (ID 검증 포함)
- **Dependencies:** storage/local/db, storage/local/chapter.local.ts
- **UsedBy:** useChapters
