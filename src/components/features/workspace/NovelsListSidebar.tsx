"use client";

import Image from "next/image";
import { Book, MessageCircle, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";
import { SidebarProfile } from "./SidebarProfile";

interface NovelsListSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: typeof Book;
  href: string;
  external: boolean;
  disabled?: boolean;
  badge?: string;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: "guide",
    label: "가이드북",
    icon: Book,
    href: "https://guide.4ndsys.net",
    external: true,
  },
  {
    id: "discord",
    label: "디스코드",
    icon: MessageCircle,
    href: "https://discord.gg/Rb8D4JhMhA",
    external: true,
  },
  {
    id: "desktop",
    label: "데스크톱 앱",
    icon: Download,
    href: "#", // TODO: PWA 설치 또는 다운로드 링크
    external: false,
    disabled: true,
    badge: "준비중",
  },
];

export function NovelsListSidebar({
  collapsed,
  onToggle,
  className,
}: NovelsListSidebarProps) {
  const { auth } = useAuth();

  const isLoading = auth.status === "loading";
  const isGuest = auth.status === "guest";
  const userName =
    auth.status === "authenticated"
      ? auth.user.displayName || auth.user.email
      : null;
  const avatarUrl = auth.status === "authenticated" ? auth.user.avatarUrl : null;

  if (collapsed) {
    return (
      <aside
        className={cn(
          "flex flex-col border-r bg-background h-full w-12",
          className
        )}
      >
        {/* 로고 */}
        <div className="flex items-center justify-center py-4 border-b">
          <Image
            src="/icons/icon.svg"
            alt="4ndSYS"
            width={24}
            height={24}
            className="rounded"
          />
        </div>

        {/* 메뉴 */}
        <nav className="flex-1 flex flex-col items-center py-4 gap-2">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            if (item.disabled) {
              return (
                <span
                  key={item.id}
                  className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground/50 cursor-not-allowed"
                  title={`${item.label} (${item.badge})`}
                >
                  <Icon className="h-4 w-4" />
                </span>
              );
            }
            return (
              <a
                key={item.id}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
                title={item.label}
              >
                <Icon className="h-4 w-4" />
              </a>
            );
          })}
        </nav>

        <SidebarProfile
          isLoading={isLoading}
          isGuest={isGuest}
          userName={userName}
          avatarUrl={avatarUrl}
          collapsed={collapsed}
          onToggle={onToggle}
        />
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
      {/* 헤더: 로고 + 앱명 */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Image
            src="/icons/icon.svg"
            alt="4ndSYS"
            width={32}
            height={32}
            className="rounded"
          />
          <span className="font-semibold text-lg">4ndSYS</span>
        </div>
      </div>

      {/* 메뉴 */}
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            if (item.disabled) {
              return (
                <li key={item.id}>
                  <span
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground/50 cursor-not-allowed"
                    title={item.badge}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">
                        {item.badge}
                      </span>
                    )}
                  </span>
                </li>
              );
            }
            return (
              <li key={item.id}>
                <a
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <SidebarProfile
        isLoading={isLoading}
        isGuest={isGuest}
        userName={userName}
        avatarUrl={avatarUrl}
        collapsed={collapsed}
        onToggle={onToggle}
      />
    </aside>
  );
}
