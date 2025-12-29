import { NextRequest, NextResponse } from "next/server";
import type { SpellCheckError, SpellCheckResult } from "@/lib/spellcheck";

// hanspell은 CommonJS 모듈
// eslint-disable-next-line @typescript-eslint/no-require-imports
const hanspell = require("hanspell");

interface HanspellResult {
  token: string;
  suggestions: string[];
  type?: string;
  context?: string;
  info?: string;
}

/**
 * hanspell의 callback 기반 API를 Promise로 래핑
 */
function spellCheckAsync(
  text: string,
  timeout = 10000
): Promise<SpellCheckError[]> {
  return new Promise((resolve, reject) => {
    const results: SpellCheckError[] = [];

    const onResult = (data: HanspellResult[]) => {
      results.push(
        ...data.map((item) => ({
          token: item.token,
          suggestions: item.suggestions,
          type: item.type,
          context: item.context,
          info: item.info,
        }))
      );
    };

    const onEnd = () => {
      resolve(results);
    };

    const onError = (err: Error) => {
      reject(err);
    };

    // DAUM 서비스 사용 (더 정확한 결과)
    hanspell.spellCheckByDAUM(text, timeout, onResult, onEnd, onError);
  });
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

    // 최대 5000자 제한 (API 부하 방지)
    const truncatedText = text.slice(0, 5000);

    const errors = await spellCheckAsync(truncatedText);

    // 중복 제거 (같은 token이 여러 번 나올 수 있음)
    const uniqueErrors = errors.reduce<SpellCheckError[]>((acc, error) => {
      const exists = acc.some((e) => e.token === error.token);
      if (!exists) {
        acc.push(error);
      }
      return acc;
    }, []);

    const result: SpellCheckResult = {
      success: true,
      errors: uniqueErrors,
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
