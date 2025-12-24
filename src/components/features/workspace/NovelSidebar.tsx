"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  FileText,
  Users,
  Link2,
  ArrowLeft,
} from "lucide-react";
import type { Project } from "@/repositories/types";
import type { Chapter } from "@/repositories/types";
import { cn } from "@/lib/utils";
import { formatCharacterCount, formatEpisodeNumber } from "@/lib/format";
import { SidebarToggle } from "./SidebarToggle";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
}

interface NovelSidebarProps {
  project: Project;
  chapters: Chapter[];
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
}

export function NovelSidebar({
  project,
  chapters,
  collapsed,
  onToggle,
  className,
}: NovelSidebarProps) {
  const pathname = usePathname();
  const basePath = `/novels/${project.id}`;

  const navItems: NavItem[] = [
    { id: "chapters", label: "회차 목록", icon: BookOpen, href: basePath },
    { id: "synopsis", label: "시놉시스", icon: FileText, href: `${basePath}/synopsis` },
    { id: "characters", label: "등장인물", icon: Users, href: `${basePath}/characters` },
    { id: "relationships", label: "관계도", icon: Link2, href: `${basePath}/relationships` },
  ];

  const isChaptersActive = pathname === basePath;
  const isChapterEditing = pathname.includes("/chapters/");
  const totalWordCount = chapters.reduce((sum, ch) => sum + ch.wordCount, 0);

  if (collapsed) {
    return (
      <aside
        className={cn(
          "flex flex-col border-r bg-background h-full w-12",
          className
        )}
      >
        <div className="flex-1 flex flex-col items-center py-4 gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.id === "chapters" && isChaptersActive);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-md transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
                title={item.label}
              >
                <Icon className="h-4 w-4" />
              </Link>
            );
          })}
        </div>
        <div className="p-2 border-t flex justify-center">
          <SidebarToggle collapsed={collapsed} onToggle={onToggle} side="left" />
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-background h-full w-64",
        className
      )}
    >
      {/* 헤더 */}
      <div className="p-4 border-b">
        <Link
          href="/novels"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>소설 목록</span>
        </Link>
        <h2 className="mt-2 font-semibold truncate">{project.title}</h2>
      </div>

      {/* 네비게이션 */}
      <nav className="p-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.id === "chapters" && isChaptersActive);
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 회차 목록 - 회차 페이지나 회차 편집 중일 때 표시 */}
      {(isChaptersActive || isChapterEditing) && chapters.length > 0 && (
        <div className="flex-1 overflow-y-auto border-t">
          <div className="p-2">
            <p className="px-3 py-2 text-xs text-muted-foreground font-medium">
              회차 ({chapters.length})
            </p>
            <ul className="space-y-1">
              {chapters.map((chapter) => {
                const chapterPath = `${basePath}/chapters/${chapter.id}`;
                const isActiveChapter = pathname === chapterPath;
                return (
                  <li key={chapter.id}>
                    <Link
                      href={chapterPath}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors",
                        isActiveChapter
                          ? "bg-accent text-accent-foreground font-medium"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                      )}
                    >
                      <span className="text-xs shrink-0 w-10 text-center">
                        {formatEpisodeNumber(chapter.order)}
                      </span>
                      <span className="truncate flex-1">{chapter.title}</span>
                      <span className="text-xs shrink-0">
                        {formatCharacterCount(chapter.wordCount)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {/* 푸터 */}
      <div className="p-4 border-t flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {chapters.length}개 회차 · {formatCharacterCount(totalWordCount)}
        </span>
        <SidebarToggle collapsed={collapsed} onToggle={onToggle} side="left" />
      </div>
    </aside>
  );
}
