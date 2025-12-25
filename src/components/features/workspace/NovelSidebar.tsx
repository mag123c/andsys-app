"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  FileText,
  Users,
  Link2,
  ArrowLeft,
  ChevronRight,
  User,
} from "lucide-react";
import type { Project, Chapter, Character } from "@/repositories/types";
import { cn } from "@/lib/utils";
import { formatCharacterCount, formatEpisodeNumber } from "@/lib/format";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { SidebarToggle } from "./SidebarToggle";

const MAX_LIST_ITEMS = 20;

// 메뉴별 색상 정의
const MENU_COLORS = {
  chapters: {
    icon: "text-slate-500",
    active: "bg-slate-100 dark:bg-slate-800",
  },
  synopsis: {
    icon: "text-emerald-500",
    active: "bg-emerald-100 dark:bg-emerald-900",
  },
  characters: {
    icon: "text-violet-500",
    active: "bg-violet-100 dark:bg-violet-900",
  },
  relationships: {
    icon: "text-rose-500",
    active: "bg-rose-100 dark:bg-rose-900",
  },
} as const;

interface NavItem {
  id: keyof typeof MENU_COLORS;
  label: string;
  icon: React.ElementType;
  href: string;
  expandable?: boolean;
}

interface NovelSidebarProps {
  project: Project;
  chapters: Chapter[];
  characters: Character[];
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
}

export function NovelSidebar({
  project,
  chapters,
  characters,
  collapsed,
  onToggle,
  className,
}: NovelSidebarProps) {
  const pathname = usePathname();
  const basePath = `/novels/${project.id}`;
  const { auth } = useAuth();

  const isLoading = auth.status === "loading";
  const isGuest = auth.status === "guest";
  const userName = auth.status === "authenticated" ? auth.user.displayName || auth.user.email : null;

  // 펼침 상태 (새로고침 시 초기화)
  const [expandedChapters, setExpandedChapters] = useState(false);
  const [expandedCharacters, setExpandedCharacters] = useState(false);
  const [showAllChapters, setShowAllChapters] = useState(false);
  const [showAllCharacters, setShowAllCharacters] = useState(false);

  const navItems: NavItem[] = [
    { id: "chapters", label: "회차 목록", icon: BookOpen, href: basePath, expandable: true },
    { id: "synopsis", label: "시놉시스", icon: FileText, href: `${basePath}/synopsis` },
    { id: "characters", label: "등장인물", icon: Users, href: `${basePath}/characters`, expandable: true },
    { id: "relationships", label: "관계도", icon: Link2, href: `${basePath}/relationships` },
  ];

  const isChaptersActive = pathname === basePath;
  const isCharactersActive = pathname === `${basePath}/characters`;

  // 해당 페이지 진입 시 자동 펼침
  useEffect(() => {
    if (isChaptersActive && chapters.length > 0) {
      setExpandedChapters(true); // eslint-disable-line react-hooks/set-state-in-effect -- 페이지 진입 시 자동 펼침을 위한 의도적 패턴
    }
    if (isCharactersActive && characters.length > 0) {
      setExpandedCharacters(true); // eslint-disable-line react-hooks/set-state-in-effect -- 페이지 진입 시 자동 펼침을 위한 의도적 패턴
    }
  }, [isChaptersActive, isCharactersActive, chapters.length, characters.length]);

  const getIsActive = (item: NavItem) => {
    if (item.id === "chapters") return isChaptersActive;
    return pathname === item.href;
  };

  const hasItems = (item: NavItem) => {
    if (item.id === "chapters") return chapters.length > 0;
    if (item.id === "characters") return characters.length > 0;
    return false;
  };

  const isExpanded = (item: NavItem) => {
    if (item.id === "chapters") return expandedChapters;
    if (item.id === "characters") return expandedCharacters;
    return false;
  };

  const toggleExpand = (item: NavItem) => {
    if (item.id === "chapters") setExpandedChapters((prev) => !prev);
    if (item.id === "characters") setExpandedCharacters((prev) => !prev);
  };

  // 표시할 아이템 (최대 20개 또는 전체)
  const displayChapters = showAllChapters ? chapters : chapters.slice(0, MAX_LIST_ITEMS);
  const displayCharacters = showAllCharacters ? characters : characters.slice(0, MAX_LIST_ITEMS);

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
            const isActive = getIsActive(item);
            const colors = MENU_COLORS[item.id];
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-md transition-colors",
                  isActive
                    ? cn(colors.active, "text-foreground")
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
                title={item.label}
              >
                <Icon className={cn("h-4 w-4", colors.icon)} />
              </Link>
            );
          })}
        </div>
        {/* 프로필 */}
        <div className="p-2 border-t flex flex-col items-center gap-2">
          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          ) : (
            <Link
              href={isGuest ? "/signup" : "/settings"}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-muted hover:bg-accent transition-colors"
              title={isGuest ? "회원가입" : userName ?? "프로필"}
            >
              <User className="h-4 w-4 text-muted-foreground" />
            </Link>
          )}
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
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = getIsActive(item);
            const colors = MENU_COLORS[item.id];
            const canExpand = item.expandable && hasItems(item);
            const expanded = isExpanded(item);

            return (
              <li key={item.id}>
                <div className="flex items-center">
                  {/* 메뉴 텍스트 - 페이지 이동 */}
                  <Link
                    href={item.href}
                    className={cn(
                      "flex-1 flex items-center gap-2 px-3 py-2 rounded-l-md text-sm transition-colors",
                      isActive
                        ? cn(colors.active, "text-foreground font-medium")
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                      !canExpand && "rounded-r-md"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", colors.icon)} />
                    <span>{item.label}</span>
                  </Link>

                  {/* 꺾쇠 - 펼침/접힘 */}
                  {canExpand && (
                    <button
                      type="button"
                      onClick={() => toggleExpand(item)}
                      className={cn(
                        "flex items-center justify-center w-8 h-9 rounded-r-md transition-colors",
                        isActive
                          ? cn(colors.active, "text-foreground")
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                      )}
                      aria-expanded={expanded}
                      aria-label={expanded ? "접기" : "펼치기"}
                    >
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          expanded && "rotate-90"
                        )}
                      />
                    </button>
                  )}
                </div>

                {/* 회차 목록 */}
                {item.id === "chapters" && expanded && (
                  <ul className="mt-1 ml-4 space-y-0.5">
                    {displayChapters.map((chapter) => {
                      const chapterPath = `${basePath}/chapters/${chapter.id}`;
                      const isActiveChapter = pathname === chapterPath;
                      return (
                        <li key={chapter.id}>
                          <Link
                            href={chapterPath}
                            className={cn(
                              "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors",
                              isActiveChapter
                                ? "bg-accent text-accent-foreground font-medium"
                                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                            )}
                          >
                            <span className="shrink-0 w-11 text-center whitespace-nowrap">
                              {formatEpisodeNumber(chapter.order)}
                            </span>
                            <span className="truncate flex-1">{chapter.title}</span>
                            <span className="shrink-0 text-muted-foreground">
                              {formatCharacterCount(chapter.wordCount)}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                    {chapters.length > MAX_LIST_ITEMS && !showAllChapters && (
                      <li>
                        <button
                          type="button"
                          onClick={() => setShowAllChapters(true)}
                          className="w-full px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors text-left"
                        >
                          더보기... (+{chapters.length - MAX_LIST_ITEMS})
                        </button>
                      </li>
                    )}
                  </ul>
                )}

                {/* 등장인물 목록 */}
                {item.id === "characters" && expanded && (
                  <ul className="mt-1 ml-4 space-y-0.5">
                    {displayCharacters.map((character) => (
                      <li key={character.id}>
                        <span className="block px-3 py-1 text-xs text-muted-foreground truncate">
                          {character.name}
                        </span>
                      </li>
                    ))}
                    {characters.length > MAX_LIST_ITEMS && !showAllCharacters && (
                      <li>
                        <button
                          type="button"
                          onClick={() => setShowAllCharacters(true)}
                          className="w-full px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors text-left"
                        >
                          더보기... (+{characters.length - MAX_LIST_ITEMS})
                        </button>
                      </li>
                    )}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 프로필 */}
      <div className="p-3 border-t">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted shrink-0">
            {isLoading ? null : <User className="h-4 w-4 text-muted-foreground" />}
          </div>
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            ) : isGuest ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">게스트</span>
                <Link href="/signup">
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    회원가입
                  </Button>
                </Link>
              </div>
            ) : (
              <span className="text-sm truncate block">{userName}</span>
            )}
          </div>
          <SidebarToggle collapsed={collapsed} onToggle={onToggle} side="left" />
        </div>
      </div>
    </aside>
  );
}
