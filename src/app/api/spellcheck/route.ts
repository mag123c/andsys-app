import { NextRequest, NextResponse } from "next/server";
import type { SpellCheckError, SpellCheckResult } from "@/lib/spellcheck";

/** 맞춤법 검사 설정 */
const SPELLCHECK_CONFIG = {
  /** 최대 검사 길이 (API 부하 방지) */
  maxLength: 2000,
  /** API 타임아웃 (ms) */
  timeout: 10000,
} as const;

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

/**
 * 바른한글 API 호출
 */
async function checkWithNaraSpeller(text: string): Promise<SpellCheckError[]> {
  const response = await fetch("https://www.nara-speller.co.kr/api/check", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      isStrictCheck: true,
    }),
    signal: AbortSignal.timeout(SPELLCHECK_CONFIG.timeout),
  });

  if (!response.ok) {
    throw new Error(`바른한글 API 오류: ${response.status}`);
  }

  const data: NaraSpellerResponse = await response.json();

  return data.errInfo.map((err) => ({
    token: err.orgStr,
    suggestions: [err.candWord],
    type: err.help.includes("띄어") ? "space" : "spell",
    info: err.help,
  }));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { success: false, errors: [], message: "텍스트가 필요합니다." },
        { status: 400 }
      );
    }

    const isTruncated = text.length > SPELLCHECK_CONFIG.maxLength;
    const truncatedText = text.slice(0, SPELLCHECK_CONFIG.maxLength);

    const errors = await checkWithNaraSpeller(truncatedText);

    // 중복 제거 (같은 token이 여러 번 나올 수 있음)
    const seen = new Set<string>();
    const uniqueErrors = errors.filter((error) => {
      if (seen.has(error.token)) return false;
      seen.add(error.token);
      return true;
    });

    const result: SpellCheckResult = {
      success: true,
      errors: uniqueErrors,
      truncated: isTruncated,
      checkedLength: truncatedText.length,
      totalLength: text.length,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Spell check error:", error);

    return NextResponse.json(
      {
        success: false,
        errors: [],
        message:
          error instanceof Error
            ? error.message
            : "맞춤법 검사 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
