/**
 * 맞춤법 검사 관련 타입 및 클라이언트 유틸리티
 */

/** 맞춤법 오류 항목 */
export interface SpellCheckError {
  /** 오류 단어 */
  token: string;
  /** 수정 제안 목록 */
  suggestions: string[];
  /** 오류 유형 (DAUM: space, spell 등) */
  type?: string;
  /** 문맥 (DAUM) */
  context?: string;
  /** 설명 (PNU) */
  info?: string;
}

/** 맞춤법 검사 결과 */
export interface SpellCheckResult {
  /** 성공 여부 */
  success: boolean;
  /** 오류 목록 */
  errors: SpellCheckError[];
  /** 에러 메시지 (실패 시) */
  message?: string;
  /** 텍스트가 잘렸는지 여부 */
  truncated?: boolean;
  /** 검사된 텍스트 길이 */
  checkedLength?: number;
  /** 전체 텍스트 길이 */
  totalLength?: number;
}

/**
 * 맞춤법 검사 API 호출
 * @param text 검사할 텍스트
 * @returns 맞춤법 검사 결과
 */
export async function checkSpelling(text: string): Promise<SpellCheckResult> {
  if (!text.trim()) {
    return { success: true, errors: [] };
  }

  const response = await fetch("/api/spellcheck", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    return {
      success: false,
      errors: [],
      message: error.message || "맞춤법 검사에 실패했습니다.",
    };
  }

  return response.json();
}
