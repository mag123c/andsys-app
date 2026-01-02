"use client";

import { useState } from "react";
import type { JSONContent } from "@tiptap/core";
import { FileText, Users, BookOpen, PanelRightClose, PanelRight } from "lucide-react";
import type { Synopsis, Character, Relationship, Chapter, CreateRelationshipInput } from "@/repositories/types";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { RightSidebarSynopsis } from "./RightSidebarSynopsis";
import { RightSidebarCharacters } from "./RightSidebarCharacters";
import { RightSidebarChapters } from "./RightSidebarChapters";

type TabType = "synopsis" | "characters" | "chapters";

interface RightSidebarProps {
  synopsis: Synopsis | null;
  synopsisLoading: boolean;
  onSynopsisChange?: (content: JSONContent) => Promise<void>;
  characters: Character[];
  relationships: Relationship[];
  onCharacterUpdate?: (id: string, data: import("@/repositories/types").UpdateCharacterInput) => Promise<void>;
  onCharacterDelete?: (id: string) => Promise<void>;
  onCharacterAdd?: () => void;
  onRelationshipCreate?: (data: CreateRelationshipInput) => Promise<void>;
  onRelationshipDelete?: (id: string) => Promise<void>;
  chapters: Chapter[];
  currentChapterId: string;
  collapsed: boolean;
  onToggle: () => void;
  defaultFont?: string;
  className?: string;
}

export function RightSidebar({
  synopsis,
  synopsisLoading,
  onSynopsisChange,
  characters,
  relationships,
  onCharacterUpdate,
  onCharacterDelete,
  onCharacterAdd,
  onRelationshipCreate,
  onRelationshipDelete,
  chapters,
  currentChapterId,
  collapsed,
  onToggle,
  defaultFont,
  className,
}: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>("synopsis");

  return (
    <>
      {collapsed ? (
        <aside
          className={cn(
            "flex flex-col items-center py-4 gap-2 border-l bg-background w-12",
            className
          )}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onToggle}
                aria-label="사이드바 펼치기"
              >
                <PanelRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">펼치기</TooltipContent>
          </Tooltip>
          <div className="flex flex-col gap-2 mt-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setActiveTab("synopsis");
                    onToggle();
                  }}
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">시놉시스</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setActiveTab("characters");
                    onToggle();
                  }}
                >
                  <Users className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">등장인물</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setActiveTab("chapters");
                    onToggle();
                  }}
                >
                  <BookOpen className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">다른 회차</TooltipContent>
            </Tooltip>
          </div>
        </aside>
      ) : (
        <aside
          className={cn(
            "flex flex-col border-l bg-background w-[50vw] h-full",
            className
          )}
        >
          {/* Header with tabs - icon only with tooltips */}
          <div className="flex items-center justify-between p-2 border-b">
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTab === "synopsis" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setActiveTab("synopsis")}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">시놉시스</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTab === "characters" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setActiveTab("characters")}
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">등장인물</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTab === "chapters" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setActiveTab("chapters")}
                  >
                    <BookOpen className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">다른 회차</TooltipContent>
              </Tooltip>
              {/* 선택된 탭 라벨 표시 */}
              <span className="text-xs text-muted-foreground ml-1">
                {activeTab === "synopsis" && "시놉시스"}
                {activeTab === "characters" && "등장인물"}
                {activeTab === "chapters" && "다른 회차"}
              </span>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={onToggle}
                  aria-label="사이드바 접기"
                >
                  <PanelRightClose className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">접기</TooltipContent>
            </Tooltip>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === "synopsis" && (
              <RightSidebarSynopsis
                synopsis={synopsis}
                isLoading={synopsisLoading}
                onContentChange={onSynopsisChange}
                defaultFont={defaultFont}
                className="h-full"
              />
            )}
            {activeTab === "characters" && (
              <RightSidebarCharacters
                characters={characters}
                relationships={relationships}
                onCharacterUpdate={onCharacterUpdate}
                onCharacterDelete={onCharacterDelete}
                onCharacterAdd={onCharacterAdd}
                onRelationshipCreate={onRelationshipCreate}
                onRelationshipDelete={onRelationshipDelete}
                className="h-full"
              />
            )}
            {activeTab === "chapters" && (
              <RightSidebarChapters
                chapters={chapters}
                currentChapterId={currentChapterId}
                className="h-full"
              />
            )}
          </div>
        </aside>
      )}
    </>
  );
}
