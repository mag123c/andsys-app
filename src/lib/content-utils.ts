/**
 * Tiptap JSONContent에서 평문 텍스트 추출
 * @param content Tiptap JSONContent
 * @param separator 블록 사이 구분자 (기본: "")
 */
export function extractText(content: unknown, separator = ""): string {
  if (!content || typeof content !== "object") return "";

  const node = content as { type?: string; text?: string; content?: unknown[] };

  if (node.type === "text" && node.text) {
    return node.text;
  }

  if (Array.isArray(node.content)) {
    // paragraph, heading 등 블록 요소는 separator로 구분
    const isBlockParent = node.type === "doc";
    const joiner = isBlockParent ? separator : "";
    return node.content.map((child) => extractText(child, separator)).join(joiner);
  }

  return "";
}

/**
 * 맞춤법 검사용 텍스트 추출 (개행을 공백으로 변환)
 * @param content Tiptap JSONContent
 */
export function extractTextForSpellCheck(content: unknown): string {
  // 블록 사이에 공백 추가하여 추출
  return extractText(content, " ").replace(/\s+/g, " ").trim();
}

/**
 * 텍스트의 글자수 계산
 * @param text 텍스트
 * @param includeSpaces 공백 포함 여부 (기본: false)
 */
export function countCharacters(text: string, includeSpaces = false): number {
  if (includeSpaces) {
    return text.length;
  }
  return text.replace(/\s/g, "").length;
}

interface TextNode {
  type: "text";
  text: string;
  marks?: unknown[];
}

interface ContentNode {
  type: string;
  content?: ContentNode[];
  text?: string;
  marks?: unknown[];
}

/**
 * JSONContent에서 특정 토큰을 교체 (마크 보존)
 * @param content Tiptap JSONContent
 * @param token 찾을 문자열
 * @param replacement 대체할 문자열
 */
export function replaceTextInContent(
  content: unknown,
  token: string,
  replacement: string
): unknown {
  if (!content || typeof content !== "object") return content;

  const node = content as ContentNode;

  // 텍스트 노드인 경우
  if (node.type === "text" && node.text) {
    return {
      ...node,
      text: node.text.split(token).join(replacement),
    } as TextNode;
  }

  // 자식 노드가 있는 경우 재귀 처리
  if (Array.isArray(node.content)) {
    return {
      ...node,
      content: node.content.map((child) =>
        replaceTextInContent(child, token, replacement)
      ) as ContentNode[],
    };
  }

  return content;
}

/**
 * 여러 토큰을 한 번에 교체
 * @param content Tiptap JSONContent
 * @param replacements 교체 목록 [{ from, to }]
 */
export function replaceMultipleInContent(
  content: unknown,
  replacements: Array<{ from: string; to: string }>
): unknown {
  // 긴 문자열부터 먼저 교체 (겹치는 경우 방지)
  const sorted = [...replacements].sort((a, b) => b.from.length - a.from.length);

  let result = content;
  for (const { from, to } of sorted) {
    result = replaceTextInContent(result, from, to);
  }
  return result;
}

