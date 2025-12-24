# 작업 체크리스트

## Phase 1: MVP (현재)

### 1. Sentry 설정 (우선순위: 필수)

```
□ Sentry 계정 생성 (sentry.io)
□ 프로젝트 생성 (Next.js 선택)
□ SDK 설치
  □ pnpm add @sentry/nextjs
  □ npx @sentry/wizard@latest -i nextjs
□ 환경 변수 설정 (.env.local)
□ 커스텀 에러 핸들러 구현 (src/lib/error.ts)
□ 사용자 식별 연동 (AuthProvider)
□ 알림 채널 설정
  □ Discord 웹훅 생성
  □ Sentry Alert Rule 설정
    □ 신규 에러 알림
    □ 에러 급증 알림
    □ 재발 이슈 알림
□ 테스트
  □ 의도적 에러 발생
  □ Discord 알림 수신 확인
  □ Sentry 대시보드 확인
```

### 2. GA4 설정 (우선순위: 필수)

```
□ Google Analytics 계정 생성
□ GA4 속성 생성
□ 데이터 스트림 설정 (웹)
□ 측정 ID 복사
□ 환경 변수 설정
□ 스크립트 삽입 (layout.tsx)
□ Search Console 연동 (SEO)
□ 테스트
  □ 실시간 보고서 확인
  □ 페이지뷰 추적 확인
```

### 3. Vercel Analytics 설정 (우선순위: 권장)

```
□ Vercel 대시보드에서 Analytics 활성화
□ @vercel/analytics 설치
□ Analytics 컴포넌트 추가 (layout.tsx)
□ 테스트
  □ 대시보드 데이터 확인
  □ Core Web Vitals 확인
```

---

## Phase 2: PMF 검증

### 4. PostHog 설정 (DAU 50+ 시점)

```
□ PostHog 계정 생성 (posthog.com)
□ 프로젝트 생성
□ SDK 설치 (posthog-js)
□ Provider 구현 (PostHogProvider.tsx)
□ 환경 변수 설정
□ 추상화 레이어 구현
  □ src/lib/analytics/events.ts
  □ src/lib/analytics/index.ts
□ 이벤트 추적 포인트 구현
  □ user_signed_up
  □ project_created
  □ chapter_created
  □ chapter_saved
  □ sync_completed / sync_failed
  □ guest_converted
□ 대시보드 설정
  □ 핵심 지표 대시보드
  □ 퍼널 분석
  □ 리텐션 차트
□ 테스트
  □ 이벤트 캡처 확인
  □ 사용자 식별 확인
```

---

## 구현 우선순위

| 순서 | 작업 | 예상 시간 | 의존성 |
|------|------|-----------|--------|
| 1 | Sentry 설정 | 1시간 | 없음 |
| 2 | Discord 알림 설정 | 30분 | Sentry |
| 3 | GA4 설정 | 30분 | 없음 |
| 4 | Vercel Analytics | 10분 | 없음 |
| 5 | Analytics 추상화 | 1시간 | 없음 |
| 6 | PostHog 설정 | 1시간 | 추상화 레이어 |
| 7 | 커스텀 이벤트 추가 | 2시간 | PostHog |

---

## 완료 기준

### Phase 1 완료

```
✓ 프로덕션 에러 발생 시 5분 내 Discord 알림 수신
✓ GA4에서 유입 경로 확인 가능
✓ Vercel에서 Core Web Vitals 확인 가능
```

### Phase 2 완료

```
✓ PostHog에서 주요 이벤트 추적 확인
✓ 가입 → 첫 프로젝트 퍼널 시각화
✓ 7일 리텐션 차트 확인 가능
```

---

## 유지보수

### 주간

```
□ Sentry 미해결 이슈 리뷰
□ GA4 주간 트래픽 확인
```

### 월간

```
□ PostHog 리텐션 분석
□ 무료 한도 사용량 체크
□ 알림 규칙 효과 검토
```

### 분기

```
□ 추적 이벤트 정리 (불필요한 것 제거)
□ 대시보드 구성 리뷰
□ 도구 비용/효과 검토
```
