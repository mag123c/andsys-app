"use client";

import Link from "next/link";
import { User, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarToggle } from "./SidebarToggle";

interface SidebarProfileProps {
  isLoading: boolean;
  isGuest: boolean;
  userName: string | null;
  avatarUrl: string | null;
  collapsed: boolean;
  onToggle?: () => void;
  showToggle?: boolean;
}

export function SidebarProfile({
  isLoading,
  isGuest,
  userName,
  avatarUrl,
  collapsed,
  onToggle,
  showToggle = true,
}: SidebarProfileProps) {
  const initials = userName?.charAt(0).toUpperCase() ?? "?";

  if (collapsed) {
    return (
      <div className="p-2 border-t flex flex-col items-center gap-2">
        {isLoading ? (
          <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
        ) : (
          <>
            <Link
              href={isGuest ? "/signup" : "/settings"}
              title={isGuest ? "회원가입" : userName ?? "프로필"}
            >
              <Avatar className="h-8 w-8">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={userName ?? "프로필"} />}
                <AvatarFallback className="text-xs">
                  {isGuest ? <User className="h-4 w-4" /> : initials}
                </AvatarFallback>
              </Avatar>
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
        <Link
          href={isGuest ? "/signup" : "/settings"}
          className="shrink-0"
          title={isGuest ? "회원가입" : userName ?? "프로필"}
        >
          <Avatar className="h-8 w-8">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={userName ?? "프로필"} />}
            <AvatarFallback className="text-xs">
              {isGuest ? <User className="h-4 w-4" /> : initials}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          ) : (
            <span className="text-sm text-muted-foreground truncate block">
              {isGuest ? "게스트" : userName}
            </span>
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
