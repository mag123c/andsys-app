"use client";

import { useState } from "react";
import { FileText, Users, Network, PanelRightClose, PanelRight } from "lucide-react";
import type { Synopsis, Character, Relationship } from "@/repositories/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { RightSidebarSynopsis } from "./RightSidebarSynopsis";
import { RightSidebarCharacters } from "./RightSidebarCharacters";
import { RelationshipGraph } from "@/components/features/relationship";

type TabType = "synopsis" | "characters";

interface RightSidebarProps {
  synopsis: Synopsis | null;
  synopsisLoading: boolean;
  characters: Character[];
  relationships: Relationship[];
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
}

export function RightSidebar({
  synopsis,
  synopsisLoading,
  characters,
  relationships,
  collapsed,
  onToggle,
  className,
}: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>("synopsis");
  const [relationshipDialogOpen, setRelationshipDialogOpen] = useState(false);

  return (
    <>
      {collapsed ? (
        <aside
          className={cn(
            "flex flex-col items-center py-4 gap-2 border-l bg-background w-12",
            className
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onToggle}
            aria-label="사이드바 펼치기"
          >
            <PanelRight className="h-4 w-4" />
          </Button>
          <div className="flex flex-col gap-2 mt-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                setActiveTab("synopsis");
                onToggle();
              }}
              title="시놉시스"
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                setActiveTab("characters");
                onToggle();
              }}
              title="등장인물"
            >
              <Users className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setRelationshipDialogOpen(true)}
              title="관계도"
            >
              <Network className="h-4 w-4" />
            </Button>
          </div>
        </aside>
      ) : (
        <aside
          className={cn(
            "flex flex-col border-l bg-background w-72 h-full",
            className
          )}
        >
          {/* Header with tabs */}
          <div className="flex items-center justify-between p-2 border-b">
            <div className="flex gap-1">
              <Button
                variant={activeTab === "synopsis" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setActiveTab("synopsis")}
              >
                <FileText className="h-3 w-3 mr-1" />
                시놉시스
              </Button>
              <Button
                variant={activeTab === "characters" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setActiveTab("characters")}
              >
                <Users className="h-3 w-3 mr-1" />
                등장인물
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setRelationshipDialogOpen(true)}
              >
                <Network className="h-3 w-3 mr-1" />
                관계도
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onToggle}
              aria-label="사이드바 접기"
            >
              <PanelRightClose className="h-4 w-4" />
            </Button>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === "synopsis" ? (
              <div className="h-full overflow-y-auto">
                <RightSidebarSynopsis
                  synopsis={synopsis}
                  isLoading={synopsisLoading}
                />
              </div>
            ) : (
              <RightSidebarCharacters characters={characters} className="h-full" />
            )}
          </div>
        </aside>
      )}

      {/* Relationship Dialog - 한 번만 렌더링 */}
      <Dialog open={relationshipDialogOpen} onOpenChange={setRelationshipDialogOpen}>
        <DialogContent className="max-w-6xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>관계도</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            <RelationshipGraph
              characters={characters}
              relationships={relationships}
              readonly
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
