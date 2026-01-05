"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * 프로젝트 카드 스켈레톤
 * ProjectCard와 동일한 레이아웃의 로딩 상태 표시
 */
export function ProjectCardSkeleton() {
  return (
    <Card className="group">
      <div className="flex p-4 gap-4">
        {/* Cover Image Skeleton - 100x150 */}
        <Skeleton className="w-[100px] h-[150px] shrink-0 rounded" />

        {/* Content - 이미지 높이에 맞춤 */}
        <div className="flex-1 min-w-0 h-[150px] flex flex-col">
          {/* Title + Genre */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>

          {/* Description - 3줄 */}
          <div className="flex-1 mt-2 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
          </div>

          {/* Date - 하단 고정 */}
          <div className="mt-auto pt-2">
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>
    </Card>
  );
}
