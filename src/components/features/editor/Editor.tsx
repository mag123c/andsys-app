"use client";

import { useEffect, useRef } from "react";
import type { JSONContent } from "@tiptap/core";
import {
  EditorRoot,
  EditorContent,
  type EditorInstance,
} from "novel";
import { defaultExtensions } from "./extensions";
import { cn } from "@/lib/utils";

interface EditorProps {
  initialContent?: JSONContent;
  onUpdate?: (content: JSONContent) => void;
  className?: string;
  editable?: boolean;
}

export function Editor({
  initialContent,
  onUpdate,
  className,
  editable = true,
}: EditorProps) {
  const editorRef = useRef<EditorInstance | null>(null);

  useEffect(() => {
    if (editorRef.current && initialContent) {
      const currentContent = editorRef.current.getJSON();
      if (JSON.stringify(currentContent) !== JSON.stringify(initialContent)) {
        editorRef.current.commands.setContent(initialContent);
      }
    }
  }, [initialContent]);

  return (
    <EditorRoot>
      <EditorContent
        className={cn(
          "prose prose-lg dark:prose-invert max-w-none",
          "min-h-[500px] w-full",
          "focus:outline-none",
          className
        )}
        extensions={defaultExtensions}
        initialContent={initialContent}
        editable={editable}
        onCreate={({ editor }) => {
          editorRef.current = editor;
        }}
        onUpdate={({ editor }) => {
          onUpdate?.(editor.getJSON());
        }}
        editorProps={{
          attributes: {
            class: cn(
              "prose prose-lg dark:prose-invert max-w-none",
              "focus:outline-none",
              "min-h-[500px]"
            ),
          },
        }}
      />
    </EditorRoot>
  );
}
