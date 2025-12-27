import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import FontFamily from "@tiptap/extension-font-family";
import { TextStyle } from "@tiptap/extension-text-style";

/**
 * 소설 에디터용 Tiptap 확장 설정
 *
 * 유지: paragraph, bold, italic, hardBreak, history, underline
 * 추가: textAlign, fontFamily, textStyle (툴바 기능)
 * 제거: heading, list, blockquote, code, strike (마크다운/코드 기능)
 *
 * 이유: HWP/TXT/Word 내보내기 호환성, 소설 작성에 불필요한 기능 제거
 */
export const editorExtensions = [
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

    // 기본 기능 유지 (명시적 설정 불필요 - 기본값 사용)
    dropcursor: {
      color: "#DBEAFE",
      width: 4,
    },
  }),
  Placeholder.configure({
    placeholder: "글을 작성하세요...",
  }),
  Underline,
  TextStyle,
  FontFamily.configure({
    types: ["textStyle"],
  }),
  TextAlign.configure({
    types: ["paragraph"],
    alignments: ["left", "center"],
  }),
];

/**
 * 에디터에서 사용 가능한 폰트 목록
 * (웹폰트로 로드된 폰트만 포함)
 *
 * 명조체: 리디바탕 (기본), Noto Serif KR, 마루 부리
 * 고딕체: Pretendard, Noto Sans KR, 나눔스퀘어 네오, Gmarket Sans
 */
export const EDITOR_FONTS = [
  // 명조체 (기본: 리디바탕)
  { name: "리디바탕", value: "RIDIBatang" },
  { name: "본명조", value: "Noto Serif KR" },
  { name: "마루 부리", value: "MaruBuri" },
  // 고딕체
  { name: "Pretendard", value: "Pretendard" },
  { name: "본고딕", value: "Noto Sans KR" },
  { name: "나눔스퀘어 네오", value: "NanumSquareNeo" },
  { name: "Gmarket Sans", value: "GmarketSansMedium" },
] as const;

/** 기본 폰트 (리디바탕) */
export const DEFAULT_EDITOR_FONT = "RIDIBatang";
