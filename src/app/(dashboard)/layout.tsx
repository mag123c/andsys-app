"use client";

import { usePathname } from "next/navigation";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

/** 헤더 숨김 페이지: /novels 및 /novels/[id] 이하 */
const HEADER_HIDDEN_PATTERN = /^\/novels(\/|$)/;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideHeader = HEADER_HIDDEN_PATTERN.test(pathname);

  if (hideHeader) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
