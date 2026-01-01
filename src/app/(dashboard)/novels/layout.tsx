"use client";

import { usePathname } from "next/navigation";
import { NovelsListLayout } from "@/components/features/workspace";

interface NovelsLayoutProps {
  children: React.ReactNode;
}

export default function NovelsLayout({ children }: NovelsLayoutProps) {
  const pathname = usePathname();

  // /novels/[id] 이하는 NovelDetailLayout에서 처리
  // 여기서는 /novels 목록 페이지만 처리
  const isNovelsListPage = pathname === "/novels";

  if (isNovelsListPage) {
    return <NovelsListLayout>{children}</NovelsListLayout>;
  }

  // 소설 상세 이하는 기존 레이아웃 유지 (NovelDetailLayout에서 처리)
  return <>{children}</>;
}
