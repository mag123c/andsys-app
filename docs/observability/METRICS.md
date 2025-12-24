# 추적 메트릭 정의

## 메트릭 분류

```
비즈니스 메트릭  → 제품 성공 지표 (PM)
기술 메트릭      → 시스템 안정성 (개발자)
인프라 메트릭    → 리소스 사용량 (DevOps)
```

---

## 비즈니스 메트릭 (PostHog + GA4)

### 핵심 지표 (North Star)

| 메트릭 | 정의 | 목표 |
|--------|------|------|
| **WAU** | 주간 활성 사용자 | 성장 추이 |
| **리텐션** | 30일 후 재방문율 | 40%+ |
| **전환율** | 게스트 → 회원 | 20%+ |

### 유입 분석 (GA4)

| 메트릭 | 측정 도구 | 용도 |
|--------|-----------|------|
| 유입 경로 | GA4 | SEO vs SNS 효과 비교 |
| 검색 키워드 | GA4 + Search Console | SEO 최적화 |
| 랜딩 페이지 이탈률 | GA4 | 페이지 개선 |
| UTM 캠페인 성과 | GA4 | SNS 홍보 효과 |

### 제품 사용 (PostHog)

| 이벤트 | 속성 | 용도 |
|--------|------|------|
| `user_signed_up` | `method: 'google' \| 'email'` | 가입 방법 분석 |
| `project_created` | `isGuest: boolean` | 게스트 활동 |
| `chapter_created` | `projectId` | 프로젝트당 챕터 수 |
| `chapter_saved` | `wordCount`, `duration` | 글쓰기 패턴 |
| `guest_converted` | `projectCount` | 전환 시점 |

### 퍼널 분석 (PostHog)

```
1. 랜딩 페이지 방문
   ↓ (전환율 A)
2. 회원가입 / 게스트 시작
   ↓ (전환율 B)
3. 첫 프로젝트 생성
   ↓ (전환율 C)
4. 첫 챕터 작성
   ↓ (전환율 D)
5. 1000자 이상 작성
```

### 리텐션 코호트 (PostHog)

| 기간 | 정의 | 건강한 수치 |
|------|------|-------------|
| D1 | 가입 다음날 재방문 | 30%+ |
| D7 | 7일 후 재방문 | 20%+ |
| D30 | 30일 후 재방문 | 10%+ |

---

## 기술 메트릭 (Sentry + Vercel)

### 에러 메트릭 (Sentry)

| 메트릭 | 알림 조건 | 심각도 |
|--------|-----------|--------|
| Error Rate | > 1% | Critical |
| New Issue | 신규 에러 발생 | Warning |
| Regression | 해결된 이슈 재발 | Critical |

### 성능 메트릭 (Vercel Analytics)

| 메트릭 | 좋음 | 개선 필요 | 나쁨 |
|--------|------|-----------|------|
| **LCP** | < 2.5s | 2.5-4s | > 4s |
| **FID** | < 100ms | 100-300ms | > 300ms |
| **CLS** | < 0.1 | 0.1-0.25 | > 0.25 |
| **TTFB** | < 200ms | 200-500ms | > 500ms |

### 동기화 메트릭 (커스텀)

| 이벤트 | 속성 | 알림 조건 |
|--------|------|-----------|
| `sync_completed` | `duration`, `itemCount` | - |
| `sync_failed` | `error`, `retryCount` | 실패율 > 5% |
| `offline_duration` | `duration` | - |

---

## 인프라 메트릭 (기본 제공)

### Vercel

```
- Edge Function 실행 시간
- 대역폭 사용량
- 배포 성공/실패
```

### Supabase

```
- DB 연결 수
- 쿼리 실행 시간
- 스토리지 사용량
- Auth 요청 수
```

---

## 이벤트 스키마

### TypeScript 정의

```typescript
// src/lib/analytics/events.ts

export type AnalyticsEvent =
  // 인증
  | { name: 'user_signed_up'; properties: { method: 'google' | 'email' } }
  | { name: 'user_signed_in'; properties: { method: 'google' | 'email' } }
  | { name: 'guest_converted'; properties: { projectCount: number; chapterCount: number } }

  // 프로젝트
  | { name: 'project_created'; properties: { isGuest: boolean } }
  | { name: 'project_deleted'; properties: { chapterCount: number } }

  // 챕터
  | { name: 'chapter_created'; properties: { projectId: string } }
  | { name: 'chapter_saved'; properties: { wordCount: number; duration: number } }
  | { name: 'chapter_deleted'; properties: { wordCount: number } }

  // 동기화
  | { name: 'sync_completed'; properties: { itemCount: number; duration: number } }
  | { name: 'sync_failed'; properties: { error: string; retryCount: number } }

  // 에디터
  | { name: 'editor_opened'; properties: { chapterId: string } }
  | { name: 'editor_font_changed'; properties: { font: string } }
  | { name: 'editor_session_ended'; properties: { duration: number; wordsWritten: number } };
```

### 이벤트 네이밍 규칙

```
- 소문자 + 언더스코어 (snake_case)
- 동사_명사 형태 (user_signed_up, chapter_created)
- 과거형 사용 (created, completed, failed)
```

---

## 대시보드 구성 (PostHog)

### 핵심 대시보드

```
1. Overview
   - WAU/DAU 추이
   - 신규 가입자 수
   - 활성 프로젝트 수

2. Acquisition (GA4 연동)
   - 유입 경로 비율
   - 캠페인별 성과

3. Activation
   - 가입 → 첫 프로젝트 퍼널
   - 시간대별 가입 분포

4. Retention
   - 코호트 리텐션 차트
   - 이탈 구간 분석

5. Technical
   - 에러율 추이
   - 동기화 성공률
   - 페이지 로딩 속도
```
