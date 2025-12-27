# 구현 가이드

## 설치 순서

```
1. Sentry (에러 + 알림) - 필수
2. GA4 (유입 분석)
3. Vercel Analytics (성능)
4. PostHog (제품 분석) - Phase 2
```

---

## 1. Sentry 설정

### 설치

```bash
pnpm add @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### 자동 생성 파일

```
├── sentry.client.config.ts
├── sentry.server.config.ts
├── sentry.edge.config.ts
└── next.config.ts (수정됨)
```

### 환경 변수

```env
# .env.local
SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=4ndsys

# 소스맵 업로드용 (CI/CD)
SENTRY_AUTH_TOKEN=your-auth-token
```

### 커스텀 에러 캡처

```typescript
// src/lib/error.ts
import * as Sentry from '@sentry/nextjs';

export function captureError(error: Error, context?: Record<string, unknown>) {
  console.error(error);

  Sentry.captureException(error, {
    extra: context,
  });
}

// 사용 예시
try {
  await syncToServer();
} catch (error) {
  captureError(error as Error, {
    action: 'sync',
    userId: user.id,
  });
}
```

### 사용자 식별

```typescript
// src/components/providers/AuthProvider.tsx
import * as Sentry from '@sentry/nextjs';

useEffect(() => {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
    });
  } else {
    Sentry.setUser(null);
  }
}, [user]);
```

---

## 2. GA4 설정

### Google Analytics 계정 생성

```
1. analytics.google.com 접속
2. 계정 생성 → 속성 생성
3. 데이터 스트림 → 웹 선택
4. 측정 ID 복사 (G-XXXXXXXXXX)
```

### 스크립트 삽입

```typescript
// src/app/layout.tsx
import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 환경 변수

```env
# .env.local
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### 이벤트 전송 (선택)

```typescript
// src/lib/analytics/ga.ts
export function trackEvent(action: string, category: string, label?: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
    });
  }
}
```

---

## 3. Vercel Analytics 설정

### 활성화

```
Vercel Dashboard → Project → Analytics → Enable
```

### 패키지 설치

```bash
pnpm add @vercel/analytics
```

### 컴포넌트 추가

```typescript
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## 4. PostHog 설정 (Phase 2)

### 설치

```bash
pnpm add posthog-js
```

### Provider 생성

```typescript
// src/components/providers/PostHogProvider.tsx
'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      capture_pageview: true,
      capture_pageleave: true,
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
```

### 환경 변수

```env
# .env.local
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

## 5. Analytics 추상화 레이어

### 이벤트 타입 정의

```typescript
// src/lib/analytics/events.ts
export type AnalyticsEvent =
  | { name: 'user_signed_up'; properties: { method: 'google' | 'email' } }
  | { name: 'project_created'; properties: { isGuest: boolean } }
  | { name: 'chapter_created'; properties: { projectId: string } }
  | { name: 'chapter_saved'; properties: { wordCount: number; duration: number } }
  | { name: 'sync_completed'; properties: { itemCount: number; duration: number } }
  | { name: 'sync_failed'; properties: { error: string } }
  | { name: 'guest_converted'; properties: { projectCount: number } };
```

### 통합 트래커

```typescript
// src/lib/analytics/index.ts
import posthog from 'posthog-js';
import type { AnalyticsEvent } from './events';

export function track<T extends AnalyticsEvent>(event: T): void {
  const { name, properties } = event;

  // 개발 환경 로깅
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', name, properties);
  }

  // PostHog (Phase 2)
  if (typeof window !== 'undefined' && posthog.__loaded) {
    posthog.capture(name, properties);
  }

  // GA4 (선택적)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, properties);
  }
}

export function identify(userId: string, traits?: Record<string, unknown>): void {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    posthog.identify(userId, traits);
  }
}

export function reset(): void {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    posthog.reset();
  }
}
```

### 사용 예시

```typescript
// 프로젝트 생성 시
import { track } from '@/lib/analytics';

async function createProject() {
  const project = await projectRepository.create({ title: 'New Project' });

  track({
    name: 'project_created',
    properties: { isGuest: !user },
  });

  return project;
}
```

---

## 파일 구조

```
src/lib/analytics/
├── index.ts          # 통합 트래커 (track, identify, reset)
├── events.ts         # 이벤트 타입 정의
├── ga.ts             # GA4 전용 함수 (선택)
└── posthog.ts        # PostHog 전용 함수 (선택)
```

---

## 환경 변수 총정리

```env
# .env.local

# Sentry
SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=4ndsys
SENTRY_AUTH_TOKEN=your-auth-token

# GA4
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# PostHog (Phase 2)
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

## 테스트 체크리스트

```
□ Sentry 에러 캡처 테스트
  □ 의도적 에러 발생 → Sentry 대시보드 확인
  □ Discord 알림 수신 확인

□ GA4 테스트
  □ 실시간 보고서에서 방문 확인
  □ 이벤트 전송 확인

□ Vercel Analytics 테스트
  □ 대시보드에서 방문 확인
  □ Web Vitals 데이터 확인

□ PostHog 테스트 (Phase 2)
  □ 이벤트 캡처 확인
  □ 사용자 식별 확인
```
