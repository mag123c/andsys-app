/**
 * PWA 설치 프롬프트 dismiss 상태 관리
 * 24시간 만료 정책 적용
 */

const STORAGE_KEY = "pwa-prompt-dismissed";
const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000; // 24시간

interface DismissData {
  timestamp: number;
}

/**
 * dismiss 상태 확인 (만료 체크 포함)
 * 24시간 경과 시 자동으로 해제
 */
export function isPromptDismissed(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;

    const data: DismissData = JSON.parse(raw);
    const now = Date.now();
    const expired = now - data.timestamp > DISMISS_DURATION_MS;

    if (expired) {
      localStorage.removeItem(STORAGE_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * dismiss 저장 (타임스탬프 기반)
 * "오늘 하루 보지 않기" 클릭 시 호출
 */
export function setPromptDismissed(): void {
  try {
    const data: DismissData = { timestamp: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage 접근 불가 시 무시
  }
}

/**
 * dismiss 상태 해제
 */
export function clearPromptDismissed(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 무시
  }
}
