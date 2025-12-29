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

/**
 * 맞춤법 검사 API 호출
 * 현재 바른한글 API 서비스 점검 중으로 일시 중단
 * TODO: 바른AI API 키 발급 후 연동 예정
 * @param text 검사할 텍스트
 * @returns 맞춤법 검사 결과
 */
export async function checkSpelling(text: string): Promise<SpellCheckResult> {
  if (!text.trim()) {
    return { success: true, errors: [] };
  }

  return {
    success: false,
    errors: [],
    message: "맞춤법 검사 서비스가 현재 점검 중입니다. 빠른 시일 내에 복구하겠습니다.",
  };
}
