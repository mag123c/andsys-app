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
- [ ] 이메일 회원가입
- [ ] 이메일 로그인
- [ ] 로그아웃
- [ ] 비밀번호 재설정
- [ ] 게스트 → 회원 데이터 마이그레이션

### 프로젝트 (Project)
- [x] Repository 인터페이스 정의
- [x] 로컬 구현체 (Dexie)
- [x] 리모트 구현체 (Supabase)
- [x] 프로젝트 목록 페이지
- [x] 프로젝트 생성 다이얼로그
- [x] 프로젝트 카드 컴포넌트
- [x] 프로젝트 삭제 (soft delete)
- [ ] 프로젝트 설정 수정

### 챕터 (Chapter)
- [x] Repository 인터페이스 정의
- [x] 로컬 구현체 (Dexie)
- [x] 리모트 구현체 (Supabase)
- [x] 챕터 목록 (프로젝트 상세 페이지)
- [x] 챕터 생성
- [x] 챕터 삭제
- [ ] 챕터 순서 변경 (드래그앤드롭)

### 에디터 (Editor)
- [x] Novel 에디터 설치 및 설정
- [x] 에디터 컴포넌트 구현
- [x] 자동 저장 (2초 debounce)
- [x] 저장 상태 표시 (저장 중 / 저장됨 / 오프라인)
- [x] 글자수 카운터
- [x] 에디터 레이아웃 (사이드바 + 에디터)

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
- [ ] 대시보드 레이아웃 (DashboardLayout)
- [x] 에디터 레이아웃 (EditorLayout)
- [x] 반응형 사이드바

### 테마
- [x] ThemeProvider 구현 (next-themes)
- [ ] 다크모드 / 라이트모드 전환
- [ ] 시스템 설정 연동

### 페이지
- [ ] 랜딩 페이지 (`/`)
- [ ] 로그인 페이지 (`/login`)
- [ ] 회원가입 페이지 (`/signup`)
- [x] 프로젝트 목록 (`/projects`)
- [x] 프로젝트 상세 (`/projects/[id]`)
- [x] 에디터 페이지 (`/projects/[id]/chapters/[chapterId]`)
- [ ] 설정 페이지 (`/settings`)

### 공통 컴포넌트
- [ ] 로딩 스피너
- [ ] 에러 바운더리
- [x] 토스트 알림 (sonner)
- [x] 확인 다이얼로그

---

## Phase 4: 내보내기 & 마무리

### 내보내기
- [ ] TXT 내보내기
- [ ] 클립보드 복사 (서식 유지)
- [ ] 전체 백업 (JSON)

### 테스트
- [ ] Repository 유닛 테스트
- [ ] SyncEngine 테스트
- [ ] 에디터 통합 테스트

### 배포
- [ ] Vercel 프로젝트 생성
- [ ] 환경 변수 설정
- [ ] 도메인 연결 (선택)
- [ ] 배포 및 검증

---

## Phase 5: Post-MVP (차후)

### P1 기능
- [ ] 소셜 로그인 (Google)
- [ ] 에디터 서식 (볼드, 이탤릭, 취소선)
- [ ] 전체화면 모드
- [ ] 폰트/줄간격 설정
- [ ] 챕터 복제

### P2 기능
- [ ] 맞춤법 검사
- [ ] 캐릭터 관리
- [ ] 세계관 설정 (위키)
- [ ] 플롯 보드
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
| 2. 핵심 기능 | 진행 중 | 85% |
| 3. UI/UX | 진행 중 | 45% |
| 4. 마무리 | 대기 | 0% |
| 5. Post-MVP | 대기 | - |
