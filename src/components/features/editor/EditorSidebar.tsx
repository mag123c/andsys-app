"use client";

import Link from "next/link";
import { FileText, FolderOpen } from "lucide-react";
import type { Project } from "@/repositories/types";
import type { Chapter } from "@/repositories/types";
import { cn } from "@/lib/utils";
import { formatWordCount } from "@/lib/format";

interface EditorSidebarProps {
  project: Project;
  chapters: Chapter[];
  currentChapterId: string;
  className?: string;
}

export function EditorSidebar({
  project,
  chapters,
  currentChapterId,
  className,
}: EditorSidebarProps) {
  return (
    <aside className={cn("flex flex-col h-full", className)}>
      <div className="p-4 border-b">
        <Link
          href={`/projects/${project.id}`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <FolderOpen className="h-4 w-4" />
          <span className="font-medium truncate">{project.title}</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {chapters.map((chapter) => {
            const isActive = chapter.id === currentChapterId;
            return (
              <li key={chapter.id}>
                <Link
                  href={`/projects/${project.id}/chapters/${chapter.id}`}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  <span className="truncate flex-1">{chapter.title}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatWordCount(chapter.wordCount)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t text-xs text-muted-foreground">
        <p>
          총 {chapters.length}개 챕터 ·{" "}
          {formatWordCount(chapters.reduce((sum, ch) => sum + ch.wordCount, 0))}
        </p>
      </div>
    </aside>
  );
}
