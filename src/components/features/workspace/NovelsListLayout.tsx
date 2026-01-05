"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { NovelsListSidebar } from "./NovelsListSidebar";
import { useLocalStorageBoolean } from "@/hooks/useLocalStorage";

const SIDEBAR_COLLAPSED_KEY = "4ndsys:novels-list-sidebar-collapsed";

interface NovelsListLayoutProps {
  children: React.ReactNode;
}

export function NovelsListLayout({ children }: NovelsListLayoutProps) {
  const [collapsed, setCollapsed] = useLocalStorageBoolean(SIDEBAR_COLLAPSED_KEY, false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggle = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:block">
        <NovelsListSidebar
          collapsed={collapsed}
          onToggle={handleToggle}
        />
      </div>

      {/* Mobile sidebar - Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>메뉴</SheetTitle>
          </SheetHeader>
          <NovelsListSidebar
            collapsed={false}
            onToggle={() => setMobileOpen(false)}
            className="border-r-0"
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
            <span>4ndSYS</span>
          </Button>
        </div>

        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </div>
    </div>
  );
}
