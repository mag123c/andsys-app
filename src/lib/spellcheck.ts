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

/**
 * 텍스트에서 오류를 수정하여 새 텍스트 반환
 * @param text 원본 텍스트
 * @param error 수정할 오류
 * @param suggestionIndex 사용할 제안 인덱스 (기본: 0)
 */
export function applyCorrection(
  text: string,
  error: SpellCheckError,
  suggestionIndex = 0
): string {
  const suggestion = error.suggestions[suggestionIndex];
  if (!suggestion) return text;

  // 모든 occurrence를 교체
  return text.split(error.token).join(suggestion);
}

/**
 * 여러 오류를 한 번에 수정
 * @param text 원본 텍스트
 * @param errors 수정할 오류 목록
 */
export function applyAllCorrections(
  text: string,
  errors: SpellCheckError[]
): string {
  let result = text;

  // 긴 토큰부터 먼저 교체 (겹치는 경우 방지)
  const sortedErrors = [...errors].sort(
    (a, b) => b.token.length - a.token.length
  );

  for (const error of sortedErrors) {
    if (error.suggestions[0]) {
      result = result.split(error.token).join(error.suggestions[0]);
    }
  }

  return result;
}
