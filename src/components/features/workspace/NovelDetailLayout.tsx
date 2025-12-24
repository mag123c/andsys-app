"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Menu } from "lucide-react";
import { useProject } from "@/hooks/useProject";
import { useChapters } from "@/hooks/useChapters";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { NovelSidebar } from "./NovelSidebar";

const SIDEBAR_COLLAPSED_KEY = "andsys:novel-sidebar-collapsed";

interface NovelDetailLayoutProps {
  children: React.ReactNode;
}

export function NovelDetailLayout({ children }: NovelDetailLayoutProps) {
  const params = useParams();
  const projectId = params.id as string;

  const { project } = useProject(projectId);
  const { chapters } = useChapters(projectId);

  // 서버/클라이언트 일관성을 위해 초기값은 false, 클라이언트에서 localStorage 읽기
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (saved === "true") {
      setCollapsed(true);
    }
  }, []);

  const handleToggle = () => {
    const newValue = !collapsed;
    setCollapsed(newValue);
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(newValue));
  };

  // 프로젝트 로딩 중이면 사이드바 없이 렌더링
  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:block lg:pt-14">
        <NovelSidebar
          project={project}
          chapters={chapters}
          collapsed={collapsed}
          onToggle={handleToggle}
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
            collapsed={false}
            onToggle={() => setMobileOpen(false)}
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
        <div className="lg:hidden sticky top-14 z-10 border-b bg-background px-4 py-2">
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

        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
      </div>
    </div>
  );
}
