import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 프로덕션에서만 활성화
  enabled: process.env.NODE_ENV === "production",

  // 샘플링 비율 (1.0 = 100%)
  tracesSampleRate: 1.0,

  // 개발 환경 리플레이 비활성화
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: process.env.NODE_ENV === "production" ? 1.0 : 0,

  // 디버그 모드 (개발 시에만)
  debug: false,

  // 환경 구분
  environment: process.env.NODE_ENV,
});
