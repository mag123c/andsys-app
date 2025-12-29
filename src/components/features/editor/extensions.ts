import { Extension } from "@tiptap/core";

/**
 * 폰트 크기 확장 (TextStyle 기반)
 */
export const FontSize = Extension.create({
  name: "fontSize",

  addOptions() {
    return {
      types: ["textStyle"],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) =>
              element.style.fontSize?.replace(/['"]+/g, "") || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }) => {
          return chain().setMark("textStyle", { fontSize }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run();
        },
    };
  },
});

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

/**
 * 에디터에서 사용 가능한 폰트 크기 목록
 */
export const EDITOR_FONT_SIZES = [
  { name: "9", value: "9pt" },
  { name: "10", value: "10pt" },
  { name: "11", value: "11pt" },
  { name: "12", value: "12pt" },
  { name: "14", value: "14pt" },
  { name: "16", value: "16pt" },
  { name: "18", value: "18pt" },
  { name: "20", value: "20pt" },
  { name: "24", value: "24pt" },
] as const;

/** 기본 폰트 크기 */
export const DEFAULT_FONT_SIZE = "12pt";
