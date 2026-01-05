"use client";

import { useEffect, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import { createEditorExtensions } from "./extensions";
import { EditorToolbar } from "./EditorToolbar";
import { cn } from "@/lib/utils";

interface EditorProps {
  initialContent?: JSONContent;
  onUpdate?: (content: JSONContent) => void;
  className?: string;
  editable?: boolean;
  showToolbar?: boolean;
  /** 회차별 글꼴 (Chapter.fontFamily) */
  chapterFont?: string | null;
  /** 기본 글꼴 (사용자 설정에서 가져옴) */
  defaultFont?: string;
  /** 회차 글꼴 변경 콜백 */
  onChapterFontChange?: (fontFamily: string | null) => void;
}

export function Editor({
  initialContent,
  onUpdate,
  className,
  editable = true,
  showToolbar = true,
  chapterFont,
  defaultFont,
  onChapterFontChange,
}: EditorProps) {
  // 확장 기능을 useMemo로 안정화하여 중복 등록 방지
  const extensions = useMemo(() => createEditorExtensions(), []);

  const editor = useEditor({
    extensions,
    content: initialContent,
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-lg dark:prose-invert max-w-none",
          "focus:outline-none",
          "min-h-[500px] px-4 pt-8 pb-4"
        ),
      },
    },
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getJSON());
    },
  });

  // 외부에서 content가 변경되면 에디터에 반영
  useEffect(() => {
    if (editor && initialContent) {
      const currentContent = editor.getJSON();
      if (JSON.stringify(currentContent) !== JSON.stringify(initialContent)) {
        editor.commands.setContent(initialContent);
      }
    }
  }, [editor, initialContent]);

  // 폰트 우선순위: 회차별 글꼴 > 전역 기본 글꼴
  const effectiveFont = chapterFont || defaultFont;

  return (
    <div className={cn("flex flex-col", className)}>
      {showToolbar && editable && (
        <EditorToolbar
          editor={editor}
          defaultFont={defaultFont}
          chapterFont={chapterFont}
          onChapterFontChange={onChapterFontChange}
        />
      )}
      <EditorContent
        editor={editor}
        className="flex-1 overflow-auto"
        style={effectiveFont ? { fontFamily: effectiveFont } : undefined}
      />
    </div>
  );
}
