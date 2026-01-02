# 작업 현황

## Phase 1: 프로젝트 초기화

### 환경 설정
- [x] Next.js 15 프로젝트 생성
- [x] TypeScript 설정
- [x] Tailwind CSS 4 설정
- [x] shadcn/ui 설치 및 테마 설정
- [x] ESLint 설정
- [x] Vitest 설정
- [x] 폴더 구조 생성

### Supabase 설정
- [x] Supabase 프로젝트 생성 (로컬 Docker)
- [x] 환경 변수 설정 (.env.local.example, .env.production.example)
- [x] Supabase 클라이언트 설정
- [x] DB 마이그레이션 파일 작성
  - [x] profiles 테이블
  - [x] projects 테이블
  - [x] chapters 테이블
  - [x] RLS 정책

### 로컬 저장소 설정
- [x] Dexie.js 설치
- [x] IndexedDB 스키마 정의
- [x] 로컬 저장소 구현체 작성

---

## Phase 2: 핵심 기능 구현

### 인증 (Auth)
- [x] AuthProvider 구현
- [x] 게스트 모드 구현 (guestId 생성)
- [x] 이메일 회원가입
- [x] 이메일 로그인
- [x] 로그아웃
- [x] 비밀번호 재설정
- [x] 게스트 → 회원 데이터 마이그레이션

### 소설 (Project)
- [x] Repository 인터페이스 정의
- [x] 로컬 구현체 (Dexie)
- [x] 리모트 구현체 (Supabase)
- [x] 소설 목록 페이지
- [x] 소설 생성 다이얼로그
- [x] 소설 카드 컴포넌트
- [x] 소설 삭제 (soft delete)
- [x] 소설 설정 수정

### 챕터 (Chapter)
- [x] Repository 인터페이스 정의
- [x] 로컬 구현체 (Dexie)
- [x] 리모트 구현체 (Supabase)
- [x] 챕터 목록 (프로젝트 상세 페이지)
- [x] 챕터 생성
- [x] 챕터 삭제
- [x] 챕터 순서 변경 (드래그앤드롭)

### 에디터 (Editor)
- [x] Tiptap 에디터 설치 및 설정 (Novel 제거, 순수 Tiptap 3.14.0)
- [x] 에디터 컴포넌트 구현
- [x] 에디터 툴바 (Undo/Redo, 폰트, B/I/U, 정렬)
- [x] 자동 저장 (2초 debounce)
- [x] 저장 상태 표시 (저장 중 / 저장됨 / 오프라인)
- [x] 글자수 카운터 (공백 포함/제외 토글)
- [x] 에디터 레이아웃 (사이드바 + 에디터)
- [x] 한글 웹폰트 7종 (Pretendard, 본고딕, 본명조, 나눔스퀘어 네오, Gmarket Sans, 리디바탕, 마루 부리)

### 동기화 (Sync)
- [x] SyncEngine 구현
- [x] 온라인/오프라인 감지 (useOnline)
- [x] 오프라인 저장 (IndexedDB)
- [x] 온라인 복귀 시 자동 동기화
- [x] 동기화 대기열 (syncQueue)
- [x] 충돌 해결 (latest-wins)

---

## Phase 3: UI/UX 완성

### 레이아웃
- [x] 루트 레이아웃 (RootLayout)
- [x] 대시보드 레이아웃 (DashboardLayout)
- [x] 에디터 레이아웃 (EditorLayout)
- [x] 반응형 사이드바

### 테마
- [x] ThemeProvider 구현 (next-themes)
- [x] 다크모드 / 라이트모드 전환
- [x] 시스템 설정 연동

### 페이지
- [x] 랜딩 페이지 (`/`)
- [x] 로그인 페이지 (`/login`)
- [x] 회원가입 페이지 (`/signup`)
- [x] 소설 목록 (`/projects`)
- [x] 소설 상세 (`/projects/[id]`)
- [x] 에디터 페이지 (`/projects/[id]/chapters/[chapterId]`)
- [x] 설정 페이지 (`/settings`)
- [x] 크레딧 페이지 (`/credits`) - 오픈소스/폰트 라이선스

### 공통 컴포넌트
- [x] 로딩 스피너
- [x] 에러 바운더리
- [x] 토스트 알림 (sonner)
- [x] 확인 다이얼로그

---

## Phase 4: 내보내기 & 마무리

### 내보내기
- [x] TXT 내보내기
- [x] 클립보드 복사 (서식 유지)
- [x] 전체 백업 (JSON)

### 테스트
- [x] Repository 유닛 테스트
- [x] SyncEngine 테스트
- [x] 에디터 통합 테스트

### 배포
- [x] Vercel 프로젝트 생성 (vercel.json 설정 완료)
- [x] GitHub 저장소 연결 (mag123c/4ndsys-app)
- [x] 환경 변수 설정 (Supabase Cloud 연결)
- [x] 배포 완료
  - Production: 4ndsys.net
- [ ] 커스텀 도메인 연결 (선택)

---

## AI Context 최적화 및 클린 아키텍처

> 컬리 OMS팀의 Claude AI 협업 방식을 적용한 구조 개선 작업
> 참고: [컬리 OMS팀 사례](https://helloworld.kurly.com/blog/oms-claude-ai-workflow/)

### Phase 1: AI Context 기반 구축
- [x] `.claude/ai-context/` 디렉토리 생성
- [x] `domain/glossary.json` - 웹소설 도메인 용어
- [x] `domain/rules.json` - 비즈니스 규칙 12개
- [x] `domain/entities.json` - 6개 테이블 구조
- [x] `technical/routes.json` - App Router 5개 그룹
- [x] `technical/sync-flow.json` - 동기화 흐름
- [x] `technical/editor-config.json` - 에디터 설정
- [x] `technical/schema-history.json` - Dexie v1~v8 마이그레이션
- [x] `components/dependency-map.json` - 15개 컴포넌트, 13개 훅

### Phase 2: CLAUDE.md 인덱스화
- [x] 루트 `CLAUDE.md` 리팩토링 (인덱스 구조)
- [x] 선택적 로딩 규칙 정의
- [x] 토큰 예측 가이드 추가

### Phase 3: UseCase 레이어 도입
- [x] `src/application/` 디렉토리 생성
- [x] `deleteProjectUseCase` - CASCADE DELETE, 트랜잭션 에러 처리
- [x] `createChapterUseCase` - 프로젝트 검증 후 생성
- [x] `reorderChaptersUseCase` - ID 유효성 검증, 중복 체크
- [x] `useProjects.ts` 리팩토링 - UseCase 호출
- [x] `useChapters.ts` 리팩토링 - UseCase 호출
- [x] `dependency-map.json` UseCase 섹션 추가

### Phase 4: 검증 및 문서화
- [x] 빌드/린트 검증
- [x] `src/application/CLAUDE.md` 작성
- [x] `docs/TASK.md` 업데이트 (이 섹션)
- [x] 디렉토리별 `CLAUDE.md` 갱신
- [ ] 실제 AI 세션 검증 (사용하면서 개선)

### 예상 효과

| 항목 | Before | After |
|------|--------|-------|
| 토큰 효율성 | 자연어 문서 | JSON으로 ~3배 절감 |
| 비즈니스 로직 | 훅에 분산 | UseCase에 집중 |
| AI 이해도 | 암묵적 지식 | 명시적 JSON |
| 테스트 용이성 | 훅 테스트 어려움 | UseCase 단위 테스트 가능 |

---

## Phase 5: Post-MVP (차후)

### P1 기능
- [ ] 소셜 로그인 (Google)
- [x] 에디터 서식 (볼드, 이탤릭, 밑줄) ← 완료
- [ ] 전체화면 모드
- [x] 폰트 설정 ← 완료 (7종 웹폰트)
- [ ] 줄간격 설정
- [ ] 챕터 복제

### P2 기능
- [x] 맞춤법 검사
- [x] 캐릭터 관리 (관계도 편집, 커스텀 필드)
- [x] 시놉시스 (Tiptap 에디터, 버전 관리)
- [ ] 세계관 설정 (위키)
- [x] 플롯 메모 (회차별 토글)
- [ ] EPUB/PDF 내보내기

### 프리미엄 (차후 검토)
- [ ] 클라우드 동기화 (멀티 디바이스)
- [ ] AI 문장 제안
- [ ] 버전 히스토리

---

## 진행 상황 요약

| Phase | 상태 | 진행률 |
|-------|------|--------|
| 1. 초기화 | 완료 | 100% |
| 2. 핵심 기능 | 완료 | 100% |
| 3. UI/UX | 완료 | 100% |
| 4. 마무리 | 완료 | 100% |
| 5. Post-MVP | 대기 | - |

## 배포 정보

| 항목 | 값 |
|------|-----|
| GitHub | https://github.com/mag123c/4ndsys-app |
| Vercel | 4ndsys.net |
| Supabase | rwuukrncmkrhubbqughn.supabase.co |
