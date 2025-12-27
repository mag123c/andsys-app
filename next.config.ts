import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
};

// Sentry 설정
const sentryConfig = {
  // 빌드 시 소스맵 업로드 (CI/CD에서 사용)
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // 빌드 로그 숨김
  silent: !process.env.CI,

  // 클라이언트 번들에서 소스맵 숨김
  hideSourceMaps: true,

  // Turbopack 호환성
  tunnelRoute: "/monitoring",

  // 번들 크기 최적화 (새 API)
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
    excludeReplayIframe: true,
    excludeReplayShadowDom: true,
  },
};

export default withSentryConfig(nextConfig, sentryConfig);
