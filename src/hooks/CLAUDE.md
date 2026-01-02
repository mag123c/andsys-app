# hooks

## 역할
커스텀 React 훅. 컴포넌트와 데이터 계층을 연결.

## 아키텍처

```
컴포넌트 → hooks (여기) → UseCase → Repository → Storage
```

훅은 UI 상태 관리와 UseCase 호출을 담당하고, 비즈니스 로직은 `application/` UseCase에 위임.

## 파일 구조

| 파일 | 역할 | UseCase 사용 |
|------|------|-------------|
| useAuth.ts | AuthProvider에서 auth 상태 가져오기 | - |
| useProject.ts | 단일 프로젝트 CRUD | - |
| useProjects.ts | 프로젝트 목록, 삭제 | `deleteProjectUseCase` |
| useChapters.ts | 챕터 목록, 생성, 순서 변경 | `createChapterUseCase`, `reorderChaptersUseCase` |
| useSynopsis.ts | 시놉시스 CRUD | - |
| useCharacters.ts | 캐릭터 목록 및 CRUD | - |
| useRelationships.ts | 관계도 CRUD | - |
| useVersionHistory.ts | 버전 히스토리 조회 | - |
| useEditor.ts | Tiptap 에디터 상태 관리 | - |
| useSpellCheck.ts | 맞춤법 검사 상태 및 교정 | - |
| useSyncEngine.ts | 환경별 동기화 엔진 (isPwaMode 분기) | - |
| useOnline.ts | 온라인/오프라인 상태 감지 | - |
| usePWAMode.ts | PWA 모드 감지 (standalone 여부) | - |
| useLocalStorage.ts | localStorage 동기화 | - |
| useUserSettings.ts | 사용자 설정 관리 | - |
| useAdmin.ts | 관리자 권한 확인 | - |

## 핵심 패턴

- **useLiveQuery**: Dexie 실시간 반응형 구독 (IndexedDB 변경 자동 감지)
- **로컬 우선**: 모든 CRUD는 로컬 저장소(storage/local) 먼저 호출
- **UseCase 위임**: 비즈니스 규칙이 필요한 작업은 `application/` UseCase 호출
- **useSyncExternalStore**: 외부 상태 구독 (usePWAMode, useOnline)

## 환경별 동기화 (useSyncEngine + usePWAMode)

| 환경 | isPwaMode | 동기화 동작 |
|------|-----------|------------|
| 로컬 (PWA) | `true` | 자동 동기화 OFF, 수동만 |
| 클라우드 (브라우저) | `false` | 회원: 자동, 비회원: 없음 |

## 의존성

- `application/*` - UseCase (비즈니스 로직)
- `storage/local/*` - 로컬 저장소
- `sync/sync-engine` - 동기화 엔진
- `dexie-react-hooks` - IndexedDB 반응형 구독

---
최종 수정: 2026-01-02
