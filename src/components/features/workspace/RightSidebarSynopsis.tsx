"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { FileText, Check, Loader2 } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import FontFamily from "@tiptap/extension-font-family";
import { TextStyle } from "@tiptap/extension-text-style";
import type { Synopsis } from "@/repositories/types";
import { cn } from "@/lib/utils";
import { formatCharacterCount } from "@/lib/format";
import { EditorToolbar } from "@/components/features/editor/EditorToolbar";
import { FontSize } from "@/components/features/editor/extensions";

const DEBOUNCE_MS = 500;

type SaveStatus = "saved" | "saving" | "unsaved";

interface RightSidebarSynopsisProps {
  synopsis: Synopsis | null;
  isLoading: boolean;
  onContentChange?: (content: JSONContent) => Promise<void>;
  className?: string;
  defaultFont?: string;
}

export function RightSidebarSynopsis({
  synopsis,
  isLoading,
  onContentChange,
  className,
  defaultFont,
}: RightSidebarSynopsisProps) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingContentRef = useRef<JSONContent | null>(null);
  const synopsisIdRef = useRef<string | null>(null);

  // Tiptap 확장 기능
  const extensions = useMemo(
    () => [
      StarterKit.configure({
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
        dropcursor: {
          color: "#DBEAFE",
          width: 4,
        },
      }),
      Placeholder.configure({
        placeholder: "이 소설의 전체 줄거리를 작성하세요...",
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
      FontSize,
    ],
    []
  );

  const editor = useEditor({
    extensions,
    content: synopsis?.content,
    editable: !!onContentChange,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm dark:prose-invert max-w-none",
          "focus:outline-none",
          "min-h-[200px] p-3"
        ),
      },
    },
    onUpdate: ({ editor }) => {
      if (!onContentChange) return;

      const content = editor.getJSON();
      pendingContentRef.current = content;
      setSaveStatus("unsaved");

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        if (pendingContentRef.current) {
          save(pendingContentRef.current);
          pendingContentRef.current = null;
        }
      }, DEBOUNCE_MS);
    },
  });

  // synopsis ID 추적
  useEffect(() => {
    synopsisIdRef.current = synopsis?.id ?? null;
  }, [synopsis?.id]);

  // synopsis 변경 시 에디터 콘텐츠 동기화
  useEffect(() => {
    if (editor && synopsis?.content) {
      const currentContent = editor.getJSON();
      if (JSON.stringify(currentContent) !== JSON.stringify(synopsis.content)) {
        editor.commands.setContent(synopsis.content);
      }
    }
    setSaveStatus("saved");
  }, [editor, synopsis?.id, synopsis?.content]);

  const save = useCallback(async (content: JSONContent) => {
    if (!onContentChange) return;
    setSaveStatus("saving");
    try {
      await onContentChange(content);
      setSaveStatus("saved");
    } catch {
      setSaveStatus("saved"); // 에러 시에도 UI 복구
    }
  }, [onContentChange]);

  // 언마운트 시 저장
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (pendingContentRef.current && onContentChange) {
        onContentChange(pendingContentRef.current).catch(() => {});
      }
    };
  }, [onContentChange]);

  if (isLoading) {
    return (
      <div className={cn("p-4", className)}>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">시놉시스</span>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded animate-pulse" />
          <div className="h-3 bg-muted rounded animate-pulse w-4/5" />
          <div className="h-3 bg-muted rounded animate-pulse w-3/5" />
        </div>
      </div>
    );
  }

  const wordCount = synopsis?.wordCount ?? 0;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">시놉시스</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {formatCharacterCount(wordCount)}
          </span>
          {saveStatus === "saving" && (
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          )}
          {saveStatus === "saved" && wordCount > 0 && (
            <Check className="h-3 w-3 text-green-500" />
          )}
        </div>
      </div>

      {/* Toolbar */}
      {onContentChange && (
        <EditorToolbar editor={editor} defaultFont={defaultFont} />
      )}

      {/* Editable Content */}
      <div className="flex-1 overflow-auto min-h-0">
        <EditorContent
          editor={editor}
          className="h-full"
          style={defaultFont ? { fontFamily: defaultFont } : undefined}
        />
      </div>
    </div>
  );
}
