"use client";

import { usePathname } from "next/navigation";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // novels/[id] 이후 페이지에서는 헤더 숨김 (자체 사이드바 레이아웃 사용)
  const isNovelDetailPage = /^\/novels\/[^/]+/.test(pathname);

  if (isNovelDetailPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
