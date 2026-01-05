"use client";

import { useState } from "react";
import Image from "next/image";
import { Book, Check, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";
import { usePWAMode } from "@/hooks/usePWAMode";
import { SidebarProfile } from "./SidebarProfile";
import { SettingsModal } from "@/components/features/settings";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { OpenInAppButton } from "@/components/features/pwa";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Discord 공식 로고 아이콘
function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

interface NovelsListSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
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
    iconColor: "text-emerald-500",
    href: "https://guide.4ndsys.net",
    external: true,
  },
  {
    id: "discord",
    label: "디스코드",
    icon: DiscordIcon,
    iconColor: "text-[#5865F2]",
    href: "https://discord.gg/Rb8D4JhMhA",
    external: true,
  },
];

export function NovelsListSidebar({
  collapsed,
  onToggle,
  className,
}: NovelsListSidebarProps) {
  const { auth } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { canInstall, isInstalled, install, showInstallButton } = usePWAInstall();
  const isPwaMode = usePWAMode();

  // 클라우드 환경 = 회원 + 브라우저 (자동 동기화)
  // 로컬 환경 = 비회원, 또는 PWA (수동 동기화)
  const isCloud = auth.status === "authenticated" && !isPwaMode;

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
        {/* 로고 + 환경 표시 */}
        <div className="flex items-center justify-center py-4 border-b">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative">
                <Image
                  src="/icons/icon-192.png"
                  alt="4ndSYS"
                  width={24}
                  height={24}
                  className="rounded"
                />
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background",
                    isCloud ? "bg-sky-500" : "bg-amber-500"
                  )}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              {isCloud ? "클라우드 환경" : "로컬 환경"}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* 빈 공간 */}
        <div className="flex-1" />

        {/* 메뉴 - 프로필 바로 위 */}
        <nav className="flex flex-col items-center py-2 gap-2 border-t">
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
                className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-accent/50 transition-colors"
                title={item.label}
              >
                <Icon className={cn("h-4 w-4", item.iconColor)} />
              </a>
            );
          })}
          {showInstallButton && (
            isInstalled ? (
              <>
                <span
                  className="flex items-center justify-center w-8 h-8 rounded-md text-emerald-500"
                  title="앱 설치됨"
                >
                  <Check className="h-4 w-4" />
                </span>
                <OpenInAppButton
                  collapsed
                  className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-accent/50 transition-colors"
                />
              </>
            ) : (
              <button
                onClick={canInstall ? install : undefined}
                disabled={!canInstall}
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-md transition-colors",
                  canInstall
                    ? "hover:bg-accent/50 cursor-pointer"
                    : "opacity-50 cursor-not-allowed"
                )}
                title={
                  canInstall
                    ? "앱 다운로드"
                    : "이 브라우저에서는 앱 설치를 지원하지 않습니다"
                }
              >
                <Download className="h-4 w-4 text-sky-500" />
              </button>
            )
          )}
        </nav>

        <SidebarProfile
          isLoading={isLoading}
          isGuest={isGuest}
          userName={userName}
          avatarUrl={avatarUrl}
          collapsed={collapsed}
          onToggle={onToggle}
          onSettingsClick={() => setSettingsOpen(true)}
        />

        <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
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
      {/* 헤더: 로고 + 앱명 + 환경 뱃지 */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Image
            src="/icons/icon-192.png"
            alt="4ndSYS"
            width={32}
            height={32}
            className="rounded"
          />
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">4ndSYS</span>
            <Badge
              variant="secondary"
              className={cn(
                "text-xs px-1.5 py-0",
                isCloud ? "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              )}
            >
              {isCloud ? "클라우드" : "로컬"}
            </Badge>
          </div>
        </div>
      </div>

      {/* 빈 공간 */}
      <div className="flex-1" />

      {/* 메뉴 - 프로필 바로 위 */}
      <nav className="p-2 border-t">
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
                  <Icon className={cn("h-4 w-4", item.iconColor)} />
                  <span>{item.label}</span>
                </a>
              </li>
            );
          })}
          {showInstallButton && (
            <li>
              {isInstalled ? (
                <>
                  <span className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-emerald-600 dark:text-emerald-400">
                    <Check className="h-4 w-4" />
                    <span>앱 설치됨</span>
                  </span>
                  <OpenInAppButton
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm w-full text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
                  />
                </>
              ) : (
                <button
                  onClick={canInstall ? install : undefined}
                  disabled={!canInstall}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm w-full transition-colors",
                    canInstall
                      ? "text-muted-foreground hover:bg-accent/50 hover:text-foreground cursor-pointer"
                      : "text-muted-foreground/50 cursor-not-allowed"
                  )}
                  title={
                    !canInstall
                      ? "이 브라우저에서는 앱 설치를 지원하지 않습니다"
                      : undefined
                  }
                >
                  <Download className="h-4 w-4 text-sky-500" />
                  <span>앱 다운로드</span>
                </button>
              )}
            </li>
          )}
        </ul>
      </nav>

      <SidebarProfile
        isLoading={isLoading}
        isGuest={isGuest}
        userName={userName}
        avatarUrl={avatarUrl}
        collapsed={collapsed}
        onToggle={onToggle}
        onSettingsClick={() => setSettingsOpen(true)}
      />

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </aside>
  );
}
