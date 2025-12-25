"use client";

import Link from "next/link";
import { User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarToggle } from "./SidebarToggle";

interface SidebarProfileProps {
  isLoading: boolean;
  isGuest: boolean;
  userName: string | null;
  collapsed: boolean;
  onToggle?: () => void;
  showToggle?: boolean;
}

export function SidebarProfile({
  isLoading,
  isGuest,
  userName,
  collapsed,
  onToggle,
  showToggle = true,
}: SidebarProfileProps) {
  if (collapsed) {
    return (
      <div className="p-2 border-t flex flex-col items-center gap-2">
        {isLoading ? (
          <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
        ) : (
          <>
            <Link
              href={isGuest ? "/signup" : "/settings"}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-muted hover:bg-accent transition-colors"
              title={isGuest ? "회원가입" : userName ?? "프로필"}
            >
              <User className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              href="/settings"
              className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-accent transition-colors"
              title="설정"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
            </Link>
          </>
        )}
        {showToggle && onToggle && (
          <SidebarToggle collapsed={collapsed} onToggle={onToggle} side="left" />
        )}
      </div>
    );
  }

  return (
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
        <Link
          href="/settings"
          className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-accent transition-colors shrink-0"
          title="설정"
        >
          <Settings className="h-4 w-4 text-muted-foreground" />
        </Link>
        {showToggle && onToggle && (
          <SidebarToggle collapsed={collapsed} onToggle={onToggle} side="left" />
        )}
      </div>
    </div>
  );
}
