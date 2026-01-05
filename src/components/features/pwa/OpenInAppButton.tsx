"use client";

import { ExternalLink } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

interface OpenInAppButtonProps {
  className?: string;
  collapsed?: boolean;
}

export function OpenInAppButton({
  className,
  collapsed = false,
}: OpenInAppButtonProps) {
  const { isInstalled, isPwaMode, openInApp } = usePWAInstall();

  // PWA 모드면 이미 앱 안에 있으므로 표시 안함
  // 설치되지 않았으면 표시 안함
  if (isPwaMode || !isInstalled) return null;

  if (collapsed) {
    return (
      <button
        onClick={openInApp}
        className={className}
        title="앱에서 열기"
      >
        <ExternalLink className="h-4 w-4 text-emerald-500" />
      </button>
    );
  }

  return (
    <button
      onClick={openInApp}
      className={className}
    >
      <ExternalLink className="h-4 w-4 text-emerald-500" />
      <span>앱에서 열기</span>
    </button>
  );
}
