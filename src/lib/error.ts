import * as Sentry from "@sentry/nextjs";

/**
 * 에러를 Sentry에 캡처하고 콘솔에 로깅
 */
export function captureError(
  error: Error,
  context?: Record<string, unknown>
): void {
  // 콘솔에 로깅 (개발 환경 디버깅용)
  console.error("[Error]", error.message, context);

  // Sentry에 에러 전송
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * 동기화 관련 에러 캡처
 */
export function captureSyncError(
  error: Error,
  context: {
    action: "push" | "pull" | "sync";
    entityType?: string;
    entityId?: string;
    retryCount?: number;
  }
): void {
  captureError(error, {
    category: "sync",
    ...context,
  });
}

/**
 * 인증 관련 에러 캡처
 */
export function captureAuthError(
  error: Error,
  context: {
    action: "signIn" | "signOut" | "session" | "migration";
    provider?: string;
  }
): void {
  captureError(error, {
    category: "auth",
    ...context,
  });
}

/**
 * 저장소 관련 에러 캡처
 */
export function captureStorageError(
  error: Error,
  context: {
    storage: "indexedDB" | "supabase";
    operation: "read" | "write" | "delete";
    table?: string;
  }
): void {
  captureError(error, {
    category: "storage",
    ...context,
  });
}

/**
 * 사용자 정의 메시지 캡처 (에러가 아닌 이벤트)
 */
export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
  context?: Record<string, unknown>
): void {
  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}
