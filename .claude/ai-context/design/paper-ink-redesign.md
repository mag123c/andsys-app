# Paper & Ink 디자인 시스템 리디자인

> 최종 업데이트: 2026-01-16
> 브랜치: `feature/design-system-redesign`

---

## 1. 프로젝트 배경

### 1.1 원래 상태
- 기존 디자인: "Pixel Writer's Quest" (레트로 게임 UI, 픽셀 아트 스타일)
- 문제점: 웹소설 작가를 위한 글쓰기 플랫폼의 정체성과 맞지 않음
- 사용자 피드백: "디지털한 감성으로 변경했지만, 앱의 정체성에 맞지 않는 것 같다"

### 1.2 사용자 요구사항 (확정)
사용자가 AskUserQuestion을 통해 선택한 방향:

| 항목 | 선택 |
|------|------|
| 디자인 방향 | **문학적 감성** - Notion + iA Writer 느낌 |
| 색상 톤 | **따뜻한 중성색** - 크림/세피아/베이지 계열 |
| UI 복잡도 | **극도로 미니멀** - 글쓰기에만 집중 |
| 폰트 스타일 | **세리프** - 바탕체 중심 |
| 다크모드 | **시스템 설정 따름** - OS 자동 감지 |
| 픽셀 아트 | **모두 제거** |

### 1.3 대상 사용자 페르소나
- 2030 웹소설 작가
- 장시간 글쓰기 (눈 피로 최소화 필수)
- 높은 디자인 민감도 (개성 있으면서 사용 편한 UI)
- 기술 친화적 (Notion, Obsidian 사용 경험)

---

## 2. 사용된 스킬

### VS Design Diverge
- **경로**: `plugin:vs-design-diverge`
- **목적**: AI-slop(일반적인 AI 생성 디자인)을 피하고 독창적인 디자인 생성
- **방법론**: Typicality Score(T-Score)로 디자인 방향 평가

### T-Score 평가 결과
| 방향 | T-Score | 설명 |
|------|---------|------|
| A. Modern Minimal | 0.7 | 안전하지만 평범 |
| **B. Paper & Ink Studio** | **0.4** | **선택됨** - 문학적 감성, 따뜻함 |
| C. Neo-Editorial | 0.15 | 너무 실험적 |

---

## 3. Paper & Ink 디자인 스펙

### 3.1 색상 팔레트

#### Light Mode
```css
--background: #FDFBF7      /* Warm Paper - 따뜻한 종이 */
--foreground: #1C1917      /* Ink Black - 잉크 블랙 */
--card: #FFFFFF            /* Pure White */
--card-foreground: #1C1917
--primary: #1C1917         /* Ink Black */
--primary-foreground: #FDFBF7
--secondary: #F5F3EF       /* Soft Cream */
--accent: #8B7355          /* Warm Sepia - 세피아 악센트 */
--muted: #F5F3EF
--muted-foreground: #78716C
--border: #E7E5E0          /* Warm Gray */
--ring: #8B7355            /* Sepia Focus */
--destructive: #B91C1C
```

#### Dark Mode
```css
--background: #1C1917      /* Deep Ink */
--foreground: #F5F3EF      /* Cream White */
--card: #292524            /* Dark Stone */
--primary: #F5F3EF
--primary-foreground: #1C1917
--secondary: #292524
--accent: #D4A574          /* Warm Gold */
--muted: #292524
--muted-foreground: #A8A29E
--border: #44403C
--ring: #D4A574
```

### 3.2 타이포그래피

| 용도 | 폰트 | CSS 클래스 |
|------|------|-----------|
| 제목/헤딩 | RIDIBatang (세리프) | `font-serif` |
| 본문/UI | Pretendard (산세리프) | `font-sans` |
| 에디터 콘텐츠 | 사용자 선택 | `.editor-content` |

### 3.3 그림자 시스템
```css
--shadow-paper: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);
--shadow-paper-md: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.04);
--shadow-paper-lg: 0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.03);
```

### 3.4 라운딩
- 기본: `rounded-md` (6px)
- 카드/컨테이너: `rounded-lg` (8px) ~ `rounded-xl` (12px)
- 버튼: `rounded-md`

### 3.5 보더
- 기본: `border border-border` (1px)
- 포커스: `focus:ring-2 focus:ring-ring/20`
- 픽셀 스타일 보더 제거: `border-4 border-foreground` → 사용 금지

### 3.6 아이콘
- 로고: `Feather` (lucide-react) - 문학적 깃펜 모티브
- 기존 `FilePenLine` 아이콘 모두 `Feather`로 교체

---

## 4. 컴포넌트 가이드라인

### 4.1 Button
```tsx
// 기본 사용
<Button>기본 버튼</Button>
<Button variant="outline">아웃라인</Button>
<Button variant="ghost">고스트</Button>
<Button variant="secondary">보조</Button>

// 크기
<Button size="sm">작은</Button>
<Button size="default">기본</Button>
<Button size="lg">큰</Button>
<Button size="xl">엑스라지</Button>
```

### 4.2 Card
```tsx
<Card className="shadow-paper">
  <CardHeader>
    <CardTitle className="font-serif">제목</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="font-sans text-muted-foreground">내용</p>
  </CardContent>
</Card>
```

### 4.3 헤더/로고 패턴
```tsx
<Link href="/" className="flex items-center gap-2.5 group">
  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary transition-shadow group-hover:shadow-md">
    <Feather className="h-4.5 w-4.5 text-primary-foreground" />
  </div>
  <span className="font-serif text-lg font-medium tracking-tight">4ndSYS</span>
</Link>
```

---

## 5. 완료된 작업

### 5.1 Core
- [x] `src/app/globals.css` - 전체 테마 시스템 재정의
- [x] `tailwind.config.ts` - 폰트, 색상 설정 (이전 세션)

### 5.2 Pages
- [x] `src/app/page.tsx` - 랜딩 페이지
- [x] `src/app/(auth)/layout.tsx` - 인증 레이아웃
- [x] `src/app/(auth)/login/page.tsx` - 로그인
- [x] `src/app/(auth)/signup/page.tsx` - 회원가입

### 5.3 UI Components
- [x] `button.tsx` - 버튼 (pixel, quest variant 호환 유지)
- [x] `badge.tsx` - 뱃지 (hp, mp, legendary, epic, rare variant 호환 유지)
- [x] `card.tsx`
- [x] `input.tsx`
- [x] `textarea.tsx`
- [x] `dialog.tsx`
- [x] `alert-dialog.tsx`
- [x] `alert.tsx`
- [x] `select.tsx`
- [x] `label.tsx`
- [x] `tooltip.tsx`
- [x] `sheet.tsx`

### 5.4 Feature Components
- [x] `SocialLoginButtons.tsx` - 소셜 로그인 버튼

---

## 6. 남은 작업

### 6.1 우선순위 높음 (픽셀 스타일 잔존)

| 파일 | 문제점 |
|------|--------|
| `src/components/features/pwa/InstallPrompt.tsx` | `font-pixel`, `font-retro`, 픽셀 그림자 |
| `src/components/ui/checkbox.tsx` | `border-4` 스타일 |
| `src/components/ui/popover.tsx` | 픽셀 그림자 |
| `src/components/ui/dropdown-menu.tsx` | 픽셀 그림자 |

### 6.2 우선순위 중간 (로고 아이콘)

| 파일 | 문제점 |
|------|--------|
| `src/components/layout/DashboardHeader.tsx` | `FilePenLine` → `Feather` |
| `src/app/(legal)/layout.tsx` | `FilePenLine` → `Feather` |
| `src/app/icon.tsx` | FilePenLine SVG → Feather SVG |
| `src/app/page.tsx` | 미사용 `FilePenLine` import 제거 |

### 6.3 우선순위 낮음 (스타일 일관성)

| 파일 | 문제점 |
|------|--------|
| `src/app/credits/page.tsx` | `font-serif` 헤딩 적용 |
| `src/app/(legal)/terms/page.tsx` | 스타일 확인 |
| `src/app/(legal)/privacy/page.tsx` | 스타일 확인 |

### 6.4 검토 필요

- `workspace/NovelSidebar.tsx`
- `workspace/NovelsListSidebar.tsx`
- `editor/EditorToolbar.tsx`
- `editor/EditorLayout.tsx`

---

## 7. 검색 패턴

### 픽셀 스타일 찾기
```bash
# 픽셀 관련 클래스 검색
rg "font-pixel|font-retro|border-4|shadow-\[.*var\(--foreground\)|pixel-" --type tsx

# 이전 로고 아이콘 검색
rg "FilePenLine" --type tsx
```

### 리디자인 필요 여부 확인
```bash
# border-4 사용처 (픽셀 보더)
rg "border-4" src/components

# 픽셀 그림자 사용처
rg "shadow-\[" src/components
```

---

## 8. 주의사항

### 8.1 호환성 유지
기존 코드에서 사용 중인 variant는 삭제하지 않고 새 스타일로 매핑:
- `variant="pixel"` → accent 스타일
- `variant="quest"` → accent 스타일
- `variant="hp"` → rose 스타일
- `variant="mp"` → sky 스타일
- `variant="legendary"` → amber 스타일
- `variant="epic"` → purple 스타일
- `variant="rare"` → blue 스타일

### 8.2 빌드 검증
모든 변경 후 반드시 실행:
```bash
pnpm build
```

### 8.3 framer-motion 타입
`ease` 속성은 문자열이 아닌 배열로:
```tsx
// 잘못된 예
transition: { ease: "easeOut" }

// 올바른 예
transition: { ease: [0.25, 0.1, 0.25, 1] as const }
```

---

## 9. 참고 자료

### 영감 소스
- Notion - 깔끔한 타이포그래피, 미니멀 UI
- iA Writer - 글쓰기 집중, 따뜻한 색상
- Bear Notes - 세련된 에디터 경험

### 디자인 원칙
1. **가독성 최우선** - 장문 읽기/쓰기에 최적화
2. **정보 계층 명확화** - 에디터 > 사이드바 > 패널
3. **눈 피로 최소화** - 적절한 대비, 따뜻한 색상
4. **일관된 디자인 언어** - Paper & Ink 메타포 유지
