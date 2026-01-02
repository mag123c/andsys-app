# 가이드 문서 & 랜딩 페이지 개선 작업 스펙

> 작성일: 2026-01-02
> 상태: 초안

---

## 1. 개요

### 1.1 목적
- 실제 구현된 기능과 문서(가이드, 랜딩 페이지)의 불일치 해소
- 누락된 기능 홍보 및 사용자 가이드 보완
- 정확한 정보 제공으로 사용자 경험 개선

### 1.2 범위
- **가이드 문서**: `guide/` 폴더 (VitePress)
- **랜딩 페이지**: `src/app/page.tsx`
- **스크린샷**: `public/images/landing/`, `guide/public/images/`

---

## 2. 사전 작업 (필수)

### ⚠️ Playwright MCP로 현재 UI/UX 상태 확인

**작업 전 반드시 Playwright MCP를 사용하여 다음을 수행:**

#### 2.1 랜딩 페이지 현황 캡처
```
1. http://localhost:3000 접속
2. 전체 페이지 스크린샷 (라이트/다크 모드)
3. 각 섹션별 스크린샷:
   - Hero 섹션
   - Features 섹션 (4개 기능)
   - FAQ 섹션
   - CTA 섹션
4. 모바일 뷰포트(375px) 스크린샷
```

#### 2.2 앱 주요 화면 캡처 (가이드/랜딩용 스크린샷 소스)
```
1. /novels - 프로젝트 목록
2. /novels/[id] - 프로젝트 대시보드 (회차 목록)
3. /novels/[id]/chapters/[chapterId] - 에디터 화면
   - 플롯 메모 열린 상태
   - 우측 패널 열린 상태
   - 맞춤법 검사 시트 열린 상태 (점검 중 메시지)
4. /novels/[id]/synopsis - 시놉시스 에디터
5. /novels/[id]/characters - 캐릭터 목록
6. /novels/[id]/relationships - 관계도 그래프
7. 설정 모달 (테마, 폰트, 통계)
8. 공유 다이얼로그
9. PWA 설치 프롬프트 (가능하면)
```

#### 2.3 가이드 사이트 현황 확인
```
1. http://localhost:5173 (또는 guide dev 서버) 접속
2. 사이드바 구조 확인
3. 공유 섹션 누락 확인
4. 각 페이지 렌더링 상태 확인
```

#### 2.4 스크린샷 필요 목록 정의
Playwright로 확인 후, 다음 항목에 대해 스크린샷 필요 여부 결정:

| 기능 | 현재 스크린샷 | 필요 여부 | 용도 |
|------|-------------|----------|------|
| 에디터 전체 | ✅ 있음 | 확인 필요 | 랜딩 Hero |
| 프로젝트 대시보드 | ✅ 있음 | 확인 필요 | 랜딩 Features |
| 워크스페이스 | ✅ 있음 | 확인 필요 | 랜딩 Features |
| 캐릭터 목록 | ✅ 있음 | 확인 필요 | 랜딩 Features |
| 관계도 | ✅ 있음 | 확인 필요 | 랜딩 Features |
| 시놉시스 에디터 | ❓ 확인 | 추가 예정 | 랜딩/가이드 |
| 플롯 메모 | ❌ 없음 | 추가 필요 | 가이드 |
| 공유 다이얼로그 | ❓ 확인 | 추가 예정 | 가이드 |
| 설정 모달 | ❓ 확인 | 추가 예정 | 가이드 |
| PWA 설치 | ❌ 없음 | 추가 필요 | 가이드 |
| 자동 저장 상태바 | ❌ 없음 | 추가 필요 | 가이드 |

---

## 3. 가이드 문서 작업

### 3.1 즉시 수정 (버그 수정)

#### A. config.mts - 공유 섹션 추가
**파일**: `guide/.vitepress/config.mts`

**현재 상태**: share/create.md, share/manage.md 파일 존재하지만 sidebar에 없음

**수정 내용**:
```typescript
// sidebar 배열에 추가 (설정 섹션 앞에)
{
  text: '공유',
  items: [
    { text: '공유 링크 만들기', link: '/share/create' },
    { text: '공유 링크 관리', link: '/share/manage' },
  ],
},
```

#### B. auto-save.md - 저장 시간 수정
**파일**: `guide/editor/auto-save.md`

**현재**: "2초 후 자동 저장"
**수정**: "0.5초(500ms) 후 자동 저장"

**수정 위치**:
- Line 10-11: 다이어그램
- Line 13: 설명 문장
- Line 15: 설명 문장

---

### 3.2 신규 문서 작성

#### A. 플롯 메모 가이드
**파일**: `guide/editor/plot-memo.md`

**내용 구조**:
```markdown
# 플롯 메모

> 회차별 줄거리나 메모를 기록하세요.

## 플롯 메모란?
- 각 회차에 간단한 메모 작성
- 복선, 중요 사건, TODO 등 기록
- 에디터 사이드바에서 확인

## 사용 방법
1. 에디터 좌측 사이드바 하단
2. "플롯 메모" 영역 클릭
3. 내용 입력 → 자동 저장 (0.5초)

## 활용 예시
- "이번 화에서 A 캐릭터 복선 심기"
- "다음 화 연결: B 사건 발생"
- "수정 필요: 대화 어색함"

[스크린샷 필요: 플롯 메모 열린 상태]
```

**config.mts 추가**:
```typescript
// 집필 에디터 섹션에 추가
{ text: '플롯 메모', link: '/editor/plot-memo' },
```

#### B. PWA 사용 가이드
**파일**: `guide/getting-started/pwa.md`

**내용 구조**:
```markdown
# 앱처럼 사용하기 (PWA)

> 브라우저 없이도 4ndSYS를 사용할 수 있어요.

## PWA란?
- Progressive Web App
- 앱처럼 설치하여 사용
- 오프라인에서도 작업 가능 (Chrome/Edge)

## 설치 방법

### Chrome / Edge
1. 4ndsys.net 접속
2. 주소창 우측 "설치" 아이콘 클릭
3. 또는 하단 설치 배너 클릭

### Safari (iOS)
⚠️ Safari는 제한적으로 지원됩니다.
1. 공유 버튼 탭
2. "홈 화면에 추가" 선택

[스크린샷 필요: 설치 프롬프트]

## 로컬 모드 vs 클라우드 모드

| 항목 | 로컬 (앱) | 클라우드 (브라우저) |
|------|----------|-------------------|
| 동기화 | 수동 버튼 | 자동 (회원) |
| 오프라인 | ✅ 가능 | ❌ 불가 |
| 로그인 | 선택 | 선택 |

## 수동 동기화
앱으로 사용 시 자동 동기화가 비활성화됩니다.
- 헤더의 "동기화" 버튼 클릭
- 로그인 필요

[스크린샷 필요: PWASyncButton]

## 브라우저 지원 현황

| 브라우저 | 설치 | 오프라인 | 동기화 |
|---------|------|---------|-------|
| Chrome | ✅ | ✅ | ✅ |
| Edge | ✅ | ✅ | ✅ |
| Safari | ⚠️ 수동 | ❌ | ❌ |
| Firefox | ❌ | ✅ | - |
```

**config.mts 추가**:
```typescript
// 시작하기 섹션에 추가
{ text: '앱처럼 사용하기 (PWA)', link: '/getting-started/pwa' },
```

#### C. 맞춤법 검사 가이드 (점검 중 상태)
**파일**: `guide/editor/spell-check.md`

**내용 구조**:
```markdown
# 맞춤법 검사

> 작성한 글의 맞춤법을 검사합니다.

::: warning 현재 점검 중
맞춤법 검사 서비스가 현재 점검 중입니다.
빠른 시일 내에 복구될 예정입니다.
:::

## 기능 소개 (복구 후)
- 하단 상태바의 "맞춤법 검사" 버튼
- 오류 목록 시트로 표시
- 클릭하여 자동 교정
- "모두 적용" 버튼

[스크린샷 필요: 맞춤법 검사 시트 (점검 중 메시지 포함)]
```

---

### 3.3 config.mts 최종 수정안

```typescript
sidebar: [
  {
    text: '시작하기',
    items: [
      { text: '4ndSYS란?', link: '/getting-started/what-is-4ndsys' },
      { text: '게스트 vs 회원', link: '/getting-started/guest-vs-member' },
      { text: '앱처럼 사용하기 (PWA)', link: '/getting-started/pwa' },  // 신규
      { text: 'FAQ', link: '/getting-started/faq' },
    ],
  },
  // ... 소설 관리, 회차 관리 ...
  {
    text: '집필 에디터',
    items: [
      { text: '에디터 기본 사용법', link: '/editor/basics' },
      { text: '서식 적용하기', link: '/editor/formatting' },
      { text: '폰트 변경', link: '/editor/font' },
      { text: '자동 저장', link: '/editor/auto-save' },
      { text: '키보드 단축키', link: '/editor/shortcuts' },
      { text: '우측 패널 활용', link: '/editor/right-panel' },
      { text: '플롯 메모', link: '/editor/plot-memo' },           // 신규
      { text: '맞춤법 검사', link: '/editor/spell-check' },       // 신규
    ],
  },
  // ... 시놉시스, 캐릭터, 관계도 ...
  {
    text: '공유',                                                  // 신규 섹션
    items: [
      { text: '공유 링크 만들기', link: '/share/create' },
      { text: '공유 링크 관리', link: '/share/manage' },
    ],
  },
  {
    text: '설정',
    items: [
      { text: '테마 변경', link: '/settings/theme' },
      { text: '기본 폰트', link: '/settings/default-font' },
      { text: '데이터 백업', link: '/settings/backup' },
    ],
  },
],
```

---

## 4. 랜딩 페이지 작업

### 4.1 Features 섹션 확장

**현재 (4개)**:
1. 회차 관리
2. 집필 워크스페이스
3. 등장인물 관리
4. 관계도 시각화

**추가 권장 (2-3개)**:

#### A. 시놉시스
```typescript
{
  icon: FileText,  // lucide-react
  title: "시놉시스",
  description: "전체 스토리의 흐름을 정리하세요. 집필 중에도 우측 패널에서 바로 확인할 수 있습니다.",
  image: "/images/landing/screenshot-synopsis.png",  // 신규 스크린샷 필요
  imageAlt: "시놉시스 에디터 화면",
},
```

#### B. 자동 저장
```typescript
{
  icon: Save,  // lucide-react
  title: "자동 저장",
  description: "저장 버튼 없이도 안심하세요. 0.5초마다 자동으로 저장되어 데이터 손실 걱정이 없습니다.",
  image: "/images/landing/screenshot-autosave.png",  // 신규 스크린샷 필요 (상태바 강조)
  imageAlt: "자동 저장 상태 표시",
},
```

#### C. 앱처럼 사용 (PWA) - 선택
```typescript
{
  icon: Smartphone,  // lucide-react
  title: "앱처럼 사용",
  description: "Chrome/Edge에서 앱으로 설치하세요. 오프라인에서도 집필할 수 있습니다.",
  image: "/images/landing/screenshot-pwa.png",  // 신규 스크린샷 필요
  imageAlt: "PWA 설치 화면",
},
```

### 4.2 스크린샷 촬영 스펙

**Playwright로 캡처 시 설정**:
```
- 뷰포트: 1280x800 (또는 현재 사용 중인 크기)
- 테마: 라이트 모드 (일관성)
- 더미 데이터: 의미 있는 샘플 콘텐츠
- 파일 형식: PNG
- 저장 위치: public/images/landing/
```

**필요한 신규 스크린샷**:
| 파일명 | 내용 | 촬영 방법 |
|--------|------|----------|
| screenshot-synopsis.png | 시놉시스 에디터 (내용 있는 상태) | /novels/[id]/synopsis |
| screenshot-autosave.png | 에디터 하단 상태바 (저장됨 표시) | 에디터 상태바 부분 크롭 |
| screenshot-pwa.png | PWA 설치 프롬프트 (옵션) | 설치 가능 상태에서 캡처 |

### 4.3 FAQ 추가 항목 (선택)

```typescript
// faqs 배열에 추가
{
  question: "앱으로 설치할 수 있나요?",
  answer:
    "네, Chrome이나 Edge에서 앱으로 설치할 수 있습니다. 주소창의 설치 버튼을 클릭하세요. 오프라인에서도 사용 가능합니다.",
},
{
  question: "맞춤법 검사 기능이 있나요?",
  answer:
    "네, 맞춤법 검사 기능이 있습니다. 현재 서비스 점검 중이며, 빠른 시일 내에 복구될 예정입니다.",
},
```

---

## 5. 작업 순서

### Phase 1: 사전 조사 (Playwright MCP)
1. [ ] 로컬 개발 서버 실행 (`pnpm dev`)
2. [ ] Playwright로 현재 UI 상태 캡처
3. [ ] 기존 스크린샷 파일 확인 및 최신화 필요 여부 판단
4. [ ] 신규 스크린샷 목록 확정

### Phase 2: 가이드 문서 수정
1. [ ] config.mts에 공유 섹션 추가
2. [ ] auto-save.md 시간 수정 (2초 → 0.5초)
3. [ ] plot-memo.md 신규 작성
4. [ ] pwa.md 신규 작성
5. [ ] spell-check.md 신규 작성
6. [ ] 가이드 빌드 테스트

### Phase 3: 스크린샷 촬영
1. [ ] Playwright로 필요한 화면 캡처
2. [ ] 이미지 최적화 (크기, 용량)
3. [ ] 가이드 문서에 이미지 삽입
4. [ ] 랜딩 페이지 이미지 배치

### Phase 4: 랜딩 페이지 수정
1. [ ] features 배열에 시놉시스/자동저장 추가
2. [ ] 필요시 FAQ 항목 추가
3. [ ] 스크린샷 연결 확인
4. [ ] 반응형 테스트

### Phase 5: 검증
1. [ ] 가이드 사이트 전체 확인
2. [ ] 랜딩 페이지 전체 확인
3. [ ] 모바일 뷰포트 확인
4. [ ] 라이트/다크 모드 확인

---

## 6. 파일 변경 목록

### 수정
- `guide/.vitepress/config.mts` - 사이드바 구조
- `guide/editor/auto-save.md` - 저장 시간

### 신규 생성
- `guide/editor/plot-memo.md`
- `guide/editor/spell-check.md`
- `guide/getting-started/pwa.md`
- `public/images/landing/screenshot-synopsis.png` (스크린샷)
- `public/images/landing/screenshot-autosave.png` (스크린샷)

### 선택적 수정
- `src/app/page.tsx` - features/FAQ 확장

---

## 7. 참고 자료

- 실제 구현 상태: `.claude/ai-context/` 문서들
- 에디터 설정: `.claude/ai-context/technical/editor-config.json`
- PWA 설정: `.claude/ai-context/technical/pwa-config.json`
- 컴포넌트 맵: `.claude/ai-context/components/dependency-map.json`
