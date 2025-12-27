"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import { editorExtensions } from "./extensions";
import { EditorToolbar } from "./EditorToolbar";
import { cn } from "@/lib/utils";

interface EditorProps {
  initialContent?: JSONContent;
  onUpdate?: (content: JSONContent) => void;
  className?: string;
  editable?: boolean;
  showToolbar?: boolean;
  /** 기본 글꼴 (사용자 설정에서 가져옴) */
  defaultFont?: string;
}

export function Editor({
  initialContent,
  onUpdate,
  className,
  editable = true,
  showToolbar = true,
  defaultFont,
}: EditorProps) {
  const editor = useEditor({
    extensions: editorExtensions,
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

  return (
    <div className={cn("flex flex-col", className)}>
      {showToolbar && editable && (
        <EditorToolbar editor={editor} defaultFont={defaultFont} />
      )}
      <EditorContent
        editor={editor}
        className="flex-1 overflow-auto"
        style={defaultFont ? { fontFamily: defaultFont } : undefined}
      />
    </div>
  );
}
