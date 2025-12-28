import "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      /**
       * 폰트 크기 설정
       */
      setFontSize: (fontSize: string) => ReturnType;
      /**
       * 폰트 크기 해제
       */
      unsetFontSize: () => ReturnType;
    };
  }
}
