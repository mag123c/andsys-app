"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, ArrowLeft } from "lucide-react";
import type { Project, Chapter } from "@/repositories/types";
import type { SaveStatus as SaveStatusType } from "@/hooks/useEditor";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { EditorSidebar } from "./EditorSidebar";
import { SaveStatus } from "./SaveStatus";
import { formatWordCount } from "@/lib/format";

interface EditorLayoutProps {
  project: Project;
  chapters: Chapter[];
  currentChapter: Chapter;
  saveStatus: SaveStatusType;
  children: React.ReactNode;
}

export function EditorLayout({
  project,
  chapters,
  currentChapter,
  saveStatus,
  children,
}: EditorLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
            <SheetTitle>챕터 목록</SheetTitle>
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
                  href={`/projects/${project.id}`}
                  className="hidden lg:flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  <span>목록</span>
                </Link>

                {/* Chapter title */}
                <h1 className="font-medium truncate">{currentChapter.title}</h1>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {formatWordCount(currentChapter.wordCount)}
                </span>
                <SaveStatus status={saveStatus} />
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
