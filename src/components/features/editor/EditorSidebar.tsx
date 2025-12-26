"use client";

import Link from "next/link";
import { FolderOpen } from "lucide-react";
import type { Project, Chapter } from "@/repositories/types";
import { cn } from "@/lib/utils";
import { formatCharacterCount, formatEpisodeNumber } from "@/lib/format";
import { useAuth } from "@/components/providers/AuthProvider";
import { SidebarProfile } from "@/components/features/workspace";

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
  const { auth } = useAuth();

  const isLoading = auth.status === "loading";
  const isGuest = auth.status === "guest";
  const userName = auth.status === "authenticated" ? auth.user.displayName || auth.user.email : null;
  const avatarUrl = auth.status === "authenticated" ? auth.user.avatarUrl : null;

  return (
    <aside className={cn("flex flex-col h-full", className)}>
      <div className="p-4 border-b">
        <Link
          href={`/novels/${project.id}`}
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
                  href={`/novels/${project.id}/chapters/${chapter.id}`}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <span className="text-xs shrink-0 w-10 text-center">
                    {formatEpisodeNumber(chapter.order)}
                  </span>
                  <span className="truncate flex-1">{chapter.title}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatCharacterCount(chapter.wordCount)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <SidebarProfile
        isLoading={isLoading}
        isGuest={isGuest}
        userName={userName}
        avatarUrl={avatarUrl}
        collapsed={false}
        showToggle={false}
      />
    </aside>
  );
}
