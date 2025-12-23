/**
 * Tiptap JSONContent에서 평문 텍스트 추출
 */
export function extractText(content: unknown): string {
  if (!content || typeof content !== "object") return "";

  const node = content as { type?: string; text?: string; content?: unknown[] };

  if (node.type === "text" && node.text) {
    return node.text;
  }

  if (Array.isArray(node.content)) {
    return node.content.map(extractText).join("");
  }

  return "";
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

