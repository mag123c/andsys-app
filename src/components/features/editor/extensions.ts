import {
  TiptapUnderline,
  StarterKit,
  Placeholder,
} from "novel";

/**
 * 소설 에디터용 확장 설정
 *
 * 유지: paragraph, bold, italic, hardBreak, history, underline
 * 제거: heading, list, blockquote, code, strike (마크다운/코드 기능)
 *
 * 이유: HWP/TXT/Word 내보내기 호환성, 소설 작성에 불필요한 기능 제거
 */
export const defaultExtensions = [
  StarterKit.configure({
    // 마크다운 기능 비활성화 (소설 에디터에 불필요)
    heading: false,
    bulletList: false,
    orderedList: false,
    listItem: false,
    blockquote: false,
    codeBlock: false,
    code: false,
    strike: false,
    horizontalRule: false,
    gapcursor: false,

    // 기본 기능 유지 (설정 생략 시 자동 활성화)
    // paragraph, bold, italic, hardBreak, history
    dropcursor: {
      color: "#DBEAFE",
      width: 4,
    },
  }),
  Placeholder.configure({
    placeholder: "글을 작성하세요...",
    includeChildren: true,
  }),
  TiptapUnderline,
];
