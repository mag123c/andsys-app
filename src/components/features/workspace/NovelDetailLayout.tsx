"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Menu } from "lucide-react";
import { useProject } from "@/hooks/useProject";
import { useChapters } from "@/hooks/useChapters";
import { useCharacters } from "@/hooks/useCharacters";
import { useRelationships } from "@/hooks/useRelationships";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NovelSidebar } from "./NovelSidebar";
import { RelationshipGraph } from "@/components/features/relationship";
import { useLocalStorageBoolean } from "@/hooks/useLocalStorage";

const SIDEBAR_COLLAPSED_KEY = "4ndsys:novel-sidebar-collapsed";

interface NovelDetailLayoutProps {
  children: React.ReactNode;
}

export function NovelDetailLayout({ children }: NovelDetailLayoutProps) {
  const params = useParams();
  const projectId = params.id as string;

  const { project } = useProject(projectId);
  const { chapters } = useChapters(projectId);
  const { characters } = useCharacters(projectId);
  const { relationships } = useRelationships(projectId);

  // useSyncExternalStore로 SSR/hydration 안전하게 localStorage 처리
  const [collapsed, setCollapsed] = useLocalStorageBoolean(SIDEBAR_COLLAPSED_KEY, false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [relationshipDialogOpen, setRelationshipDialogOpen] = useState(false);

  const handleToggle = () => {
    setCollapsed(!collapsed);
  };

  // 프로젝트 로딩 중이면 사이드바 없이 렌더링
  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:block">
        <NovelSidebar
          project={project}
          chapters={chapters}
          characters={characters}
          collapsed={collapsed}
          onToggle={handleToggle}
          onRelationshipClick={() => setRelationshipDialogOpen(true)}
        />
      </div>

      {/* Mobile sidebar - Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>네비게이션</SheetTitle>
          </SheetHeader>
          <NovelSidebar
            project={project}
            chapters={chapters}
            characters={characters}
            collapsed={false}
            onToggle={() => setMobileOpen(false)}
            onRelationshipClick={() => {
              setMobileOpen(false);
              setRelationshipDialogOpen(true);
            }}
          />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div
        className={
          collapsed
            ? "lg:pl-12 transition-[padding] duration-200"
            : "lg:pl-64 transition-[padding] duration-200"
        }
      >
        {/* Mobile menu button */}
        <div className="lg:hidden sticky top-0 z-10 border-b bg-background px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileOpen(true)}
            className="gap-2"
          >
            <Menu className="h-4 w-4" />
            <span className="truncate">{project.title}</span>
          </Button>
        </div>

        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </div>

      {/* 관계도 모달 */}
      <Dialog open={relationshipDialogOpen} onOpenChange={setRelationshipDialogOpen}>
        <DialogContent className="max-w-[1270px] h-[80vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
            <DialogTitle>관계도</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 px-6 pb-6">
            <RelationshipGraph
              characters={characters}
              relationships={relationships}
              readonly
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
