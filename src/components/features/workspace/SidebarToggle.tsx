"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarToggleProps {
  collapsed: boolean;
  onToggle: () => void;
  side?: "left" | "right";
  className?: string;
}

export function SidebarToggle({
  collapsed,
  onToggle,
  side = "left",
  className,
}: SidebarToggleProps) {
  const Icon = side === "left"
    ? collapsed ? ChevronRight : ChevronLeft
    : collapsed ? ChevronLeft : ChevronRight;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggle}
      className={cn(
        "h-8 w-8 p-0",
        className
      )}
      aria-expanded={!collapsed}
      aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}
