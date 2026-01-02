# hooks

## 역할
커스텀 React 훅. 컴포넌트와 데이터 계층을 연결.

## 파일 구조
| 파일 | 역할 |
|------|------|
| useAuth.ts | AuthProvider에서 auth 상태 가져오기 |
| useProject.ts | 단일 프로젝트 CRUD |
| useProjects.ts | 프로젝트 목록 (Dexie useLiveQuery) |
| useChapters.ts | 챕터 목록 및 CRUD |
| useSynopsis.ts | 시놉시스 CRUD |
| useCharacters.ts | 캐릭터 목록 및 CRUD |
| useRelationships.ts | 관계도 CRUD |
| useVersionHistory.ts | 버전 히스토리 조회 |
| useEditor.ts | Tiptap 에디터 상태 관리 |
| useSpellCheck.ts | 맞춤법 검사 상태 및 교정 |
| useSyncEngine.ts | 동기화 엔진 상태 및 Realtime 구독 |
| useOnline.ts | 온라인/오프라인 상태 감지 |
| useLocalStorage.ts | localStorage 동기화 |
| useUserSettings.ts | 사용자 설정 관리 |
| useAdmin.ts | 관리자 권한 확인 |

## 핵심 패턴
- **useLiveQuery**: Dexie 실시간 반응형 구독 (IndexedDB 변경 자동 감지)
- **로컬 우선**: 모든 CRUD는 로컬 저장소(storage/local) 먼저 호출

## 의존성
- `storage/local/*`
- `sync/sync-engine`
- `dexie-react-hooks`

---
최종 수정: 2026-01-02
