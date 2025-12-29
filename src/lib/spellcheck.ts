/**
 * 맞춤법 검사 관련 타입 및 클라이언트 유틸리티
 */

/** 맞춤법 오류 항목 */
export interface SpellCheckError {
  /** 오류 단어 */
  token: string;
  /** 수정 제안 목록 */
  suggestions: string[];
  /** 오류 유형 (space, spell 등) */
  type?: string;
  /** 문맥 */
  context?: string;
  /** 설명 */
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

/** 바른한글 API 응답 타입 */
interface NaraSpellerError {
  errorIdx: number;
  correctMethod: number;
  start: number;
  end: number;
  orgStr: string;
  candWord: string;
  help: string;
}

interface NaraSpellerResponse {
  str: string;
  errInfo: NaraSpellerError[];
  totalPageCnt: number;
  remaningText: string;
}

const MAX_LENGTH = 2000;

/**
 * 바른한글 API 직접 호출 (클라이언트 사이드)
 */
async function checkWithNaraSpeller(text: string): Promise<SpellCheckResult> {
  const isTruncated = text.length > MAX_LENGTH;
  const truncatedText = text.slice(0, MAX_LENGTH);

  const response = await fetch("https://www.nara-speller.co.kr/api/check", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: truncatedText,
      isStrictCheck: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`바른한글 API 오류: ${response.status}`);
  }

  const data: NaraSpellerResponse = await response.json();

  // 중복 제거
  const seen = new Set<string>();
  const errors = data.errInfo
    .map((err) => ({
      token: err.orgStr,
      suggestions: [err.candWord],
      type: err.help.includes("띄어") ? "space" : "spell",
      info: err.help,
    }))
    .filter((error) => {
      if (seen.has(error.token)) return false;
      seen.add(error.token);
      return true;
    });

  return {
    success: true,
    errors,
    truncated: isTruncated,
    checkedLength: truncatedText.length,
    totalLength: text.length,
  };
}

/**
 * 서버 API 호출 (DAUM 폴백)
 */
async function checkWithServerApi(text: string): Promise<SpellCheckResult> {
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
 * 맞춤법 검사 API 호출
 * 1차: 바른한글 API 직접 호출 (클라이언트)
 * 2차: 서버 API 폴백 (DAUM)
 * @param text 검사할 텍스트
 * @returns 맞춤법 검사 결과
 */
export async function checkSpelling(text: string): Promise<SpellCheckResult> {
  if (!text.trim()) {
    return { success: true, errors: [] };
  }

  // 1차: 바른한글 API 직접 호출 시도
  try {
    return await checkWithNaraSpeller(text);
  } catch {
    // CORS 또는 기타 오류 시 서버 API로 폴백
    console.warn("바른한글 API 호출 실패, 서버 API로 폴백");
  }

  // 2차: 서버 API 폴백
  return checkWithServerApi(text);
}
