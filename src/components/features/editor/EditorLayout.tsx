"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { JSONContent } from "@tiptap/core";
import { toast } from "sonner";
import { Menu, ArrowLeft, Download, Copy, MoreVertical } from "lucide-react";
import type { Project, Chapter } from "@/repositories/types";
import type { SaveStatus as SaveStatusType } from "@/hooks/useEditor";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { EditorSidebar } from "./EditorSidebar";
import { SaveStatus } from "./SaveStatus";
import { formatCharacterCount } from "@/lib/format";
import { extractText, countCharacters } from "@/lib/content-utils";
import { exportChapterAsText, copyChapterToClipboard } from "@/lib/export";

interface EditorLayoutProps {
  project: Project;
  chapters: Chapter[];
  currentChapter: Chapter;
  content: JSONContent | null;
  saveStatus: SaveStatusType;
  children: React.ReactNode;
}

export function EditorLayout({
  project,
  chapters,
  currentChapter,
  content,
  saveStatus,
  children,
}: EditorLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [includeSpaces, setIncludeSpaces] = useState(false);

  // 콘텐츠에서 글자수 계산
  const characterCount = useMemo(() => {
    const text = extractText(content);
    return countCharacters(text, includeSpaces);
  }, [content, includeSpaces]);

  const handleExportTxt = () => {
    exportChapterAsText(content, currentChapter.title);
    toast.success("TXT 파일로 내보내기 완료");
  };

  const handleCopyToClipboard = async () => {
    const success = await copyChapterToClipboard(content);
    if (success) {
      toast.success("클립보드에 복사되었습니다");
    } else {
      toast.error("클립보드 복사에 실패했습니다");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar - fixed */}
      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex-col lg:border-r lg:bg-background">
        <EditorSidebar
          project={project}
          chapters={chapters}
          currentChapterId={currentChapter.id}
        />
      </aside>

      {/* Mobile sidebar - Sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>회차 목록</SheetTitle>
          </SheetHeader>
          <EditorSidebar
            project={project}
            chapters={chapters}
            currentChapterId={currentChapter.id}
          />
        </SheetContent>
      </Sheet>

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto max-w-4xl px-4">
            <div className="flex h-14 items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden shrink-0"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">메뉴 열기</span>
                </Button>

                {/* Desktop back link */}
                <Link
                  href={`/novels/${project.id}`}
                  className="hidden lg:flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  <span>목록</span>
                </Link>

                {/* Chapter title */}
                <h1 className="font-medium truncate">{currentChapter.title}</h1>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setIncludeSpaces(!includeSpaces)}
                  className="text-sm text-muted-foreground hover:text-foreground hidden sm:inline transition-colors"
                  title={includeSpaces ? "공백 포함 (클릭: 공백 제외)" : "공백 제외 (클릭: 공백 포함)"}
                >
                  {formatCharacterCount(characterCount)}
                  <span className="ml-1 text-xs">
                    ({includeSpaces ? "공백 포함" : "공백 제외"})
                  </span>
                </button>
                <SaveStatus status={saveStatus} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">메뉴</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleExportTxt}>
                      <Download className="mr-2 h-4 w-4" />
                      TXT로 내보내기
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCopyToClipboard}>
                      <Copy className="mr-2 h-4 w-4" />
                      클립보드에 복사
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Editor content */}
        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
      </div>
    </div>
  );
}
