import type { JSONContent } from "@tiptap/core";

/**
 * Tiptap JSONContent를 텍스트로 변환 (개행 포함)
 */
export function jsonContentToText(content: JSONContent | null | undefined): string {
  if (!content) return "";

  const lines: string[] = [];

  function processNode(node: JSONContent): string {
    if (node.type === "text") {
      return node.text ?? "";
    }

    if (node.type === "hardBreak") {
      return "\n";
    }

    return node.content?.map(processNode).join("") ?? "";
  }

  if (content.content) {
    for (const node of content.content) {
      const text = processNode(node);
      lines.push(text);
    }
  }

  return lines.join("\n\n").trim();
}

/**
 * 텍스트를 TXT 파일로 다운로드
 */
export function downloadAsText(text: string, filename: string): void {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".txt") ? filename : `${filename}.txt`;
  link.click();

  URL.revokeObjectURL(url);
}

/**
 * 텍스트를 클립보드에 복사
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback: execCommand (deprecated but useful for older browsers)
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * 챕터 내용을 TXT로 내보내기
 */
export function exportChapterAsText(
  content: JSONContent | null | undefined,
  chapterTitle: string
): void {
  const text = jsonContentToText(content);
  const safeFilename = chapterTitle.replace(/[/\\?%*:|"<>]/g, "-");
  downloadAsText(text, safeFilename);
}

/**
 * 챕터 내용을 클립보드에 복사
 */
export async function copyChapterToClipboard(
  content: JSONContent | null | undefined
): Promise<boolean> {
  const text = jsonContentToText(content);
  return copyToClipboard(text);
}

/**
 * 백업 데이터 타입
 */
export interface BackupData {
  version: string;
  exportedAt: string;
  projects: BackupProject[];
}

export interface BackupProject {
  id: string;
  title: string;
  description: string | null;
  genre: string | null;
  createdAt: string;
  updatedAt: string;
  chapters: BackupChapter[];
}

export interface BackupChapter {
  id: string;
  title: string;
  content: JSONContent;
  wordCount: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * JSON을 파일로 다운로드
 */
export function downloadAsJson(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".json") ? filename : `${filename}.json`;
  link.click();

  URL.revokeObjectURL(url);
}

/**
 * 전체 데이터를 백업 JSON으로 내보내기
 */
export function exportBackup(backup: BackupData): void {
  const date = new Date().toISOString().split("T")[0];
  downloadAsJson(backup, `andsys-backup-${date}`);
}
