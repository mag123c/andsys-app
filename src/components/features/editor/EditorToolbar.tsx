"use client";

import { useState, useEffect } from "react";
import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  Undo,
  Redo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { EDITOR_FONTS, EDITOR_FONT_SIZES, DEFAULT_FONT_SIZE } from "./extensions";

interface EditorToolbarProps {
  editor: Editor | null;
  /** 기본 글꼴 (사용자 설정에서 가져옴) */
  defaultFont?: string;
  /** 회차별 글꼴 (Chapter.fontFamily) */
  chapterFont?: string | null;
  /** 회차 글꼴 변경 콜백 */
  onChapterFontChange?: (fontFamily: string | null) => void;
}

export function EditorToolbar({
  editor,
  defaultFont,
  chapterFont,
  onChapterFontChange,
}: EditorToolbarProps) {
  // 선택 변경 시 툴바 리렌더 트리거
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (!editor) return;

    // selectionUpdate만 구독 - transaction은 매 키 입력마다 발생하여 과도한 리렌더링 유발
    const handleSelectionUpdate = () => forceUpdate((n) => n + 1);
    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor]);

  if (!editor) return null;

  // 폰트 우선순위: Tiptap 선택 텍스트 > 회차별 글꼴 > 전역 기본 글꼴
  const tiptapFont = editor.getAttributes("textStyle").fontFamily || "";
  const effectiveChapterFont = chapterFont || defaultFont || "";
  const currentFont = tiptapFont || effectiveChapterFont;

  // 현재 폰트의 표시 이름
  const currentFontName = EDITOR_FONTS.find((f) => f.value === currentFont)?.name || "폰트";

  // 현재 폰트 크기 (설정된 값이 없으면 기본값 12pt)
  const rawFontSize = editor.getAttributes("textStyle").fontSize;
  const currentFontSize = EDITOR_FONT_SIZES.some((s) => s.value === rawFontSize)
    ? rawFontSize
    : DEFAULT_FONT_SIZE;
  const currentFontSizeName = EDITOR_FONT_SIZES.find((s) => s.value === currentFontSize)?.name || "12";


  return (
    <div className="flex items-center gap-1 p-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
      {/* 폰트 선택 - 회차 기본 글꼴로 저장 */}
      <Select
        value={currentFont || undefined}
        onValueChange={(value) => {
          // 회차 기본 글꼴로 저장
          onChapterFontChange?.(value);
        }}
      >
        <SelectTrigger className="h-8 min-w-[100px] px-2 text-sm font-sans">
          <span className="truncate flex-1 text-left">{currentFontName}</span>
        </SelectTrigger>
        <SelectContent>
          {EDITOR_FONTS.map((font) => (
            <SelectItem
              key={font.value}
              value={font.value}
              style={{ fontFamily: font.value }}
            >
              {font.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 폰트 크기 선택 */}
      <Select
        value={currentFontSize || undefined}
        onValueChange={(value) => {
          editor.chain().focus().setFontSize(value).run();
        }}
      >
        <SelectTrigger className="h-8 min-w-[60px] px-2 text-sm font-sans">
          <span className="truncate flex-1 text-left">{currentFontSizeName}</span>
        </SelectTrigger>
        <SelectContent>
          {EDITOR_FONT_SIZES.map((size) => (
            <SelectItem key={size.value} value={size.value}>
              {size.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* 서식 버튼 */}
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", editor.isActive("bold") && "bg-accent")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="굵게 (Ctrl+B)"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", editor.isActive("italic") && "bg-accent")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="기울임 (Ctrl+I)"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", editor.isActive("underline") && "bg-accent")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="밑줄 (Ctrl+U)"
      >
        <Underline className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* 정렬 버튼 */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8",
          editor.isActive({ textAlign: "left" }) && "bg-accent"
        )}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        title="왼쪽 정렬"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8",
          editor.isActive({ textAlign: "center" }) && "bg-accent"
        )}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        title="가운데 정렬"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Undo / Redo */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="실행 취소 (Ctrl+Z)"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="다시 실행 (Ctrl+Y)"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
}
