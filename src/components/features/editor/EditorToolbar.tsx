"use client";

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
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { EDITOR_FONTS } from "./extensions";

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  const currentFont = editor.getAttributes("textStyle").fontFamily || "";

  return (
    <div className="flex items-center gap-1 p-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
      {/* 폰트 선택 */}
      <Select
        value={currentFont || "default"}
        onValueChange={(value) => {
          if (value === "default") {
            editor.chain().focus().unsetFontFamily().run();
          } else {
            editor.chain().focus().setFontFamily(value).run();
          }
        }}
      >
        <SelectTrigger className="h-8 w-[120px] text-xs">
          <SelectValue placeholder="폰트" />
        </SelectTrigger>
        <SelectContent>
          {EDITOR_FONTS.map((font) => (
            <SelectItem
              key={font.value || "default"}
              value={font.value || "default"}
              style={{ fontFamily: font.value || "inherit" }}
            >
              {font.name}
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
