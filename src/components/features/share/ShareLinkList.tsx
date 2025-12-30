"use client";

import { Link2 } from "lucide-react";
import { ShareLinkCard } from "./ShareLinkCard";
import type { SharedChapterListItem } from "@/repositories/types";

interface ShareLinkListProps {
  items: SharedChapterListItem[];
  onDelete: (id: string) => Promise<void>;
}

export function ShareLinkList({ items, onDelete }: ShareLinkListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mx-auto mb-4">
          <Link2 className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-medium mb-1">공유 링크가 없습니다</h3>
        <p className="text-sm text-muted-foreground">
          에디터에서 회차를 공유하면 여기에 표시됩니다.
        </p>
      </div>
    );
  }

  // 활성 링크와 만료 링크 분리
  const activeItems = items.filter((item) => {
    if (!item.isActive) return false;
    if (item.expiresAt && new Date(item.expiresAt) < new Date()) return false;
    return true;
  });

  const expiredItems = items.filter((item) => {
    if (!item.isActive) return true;
    if (item.expiresAt && new Date(item.expiresAt) < new Date()) return true;
    return false;
  });

  return (
    <div className="space-y-6">
      {activeItems.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            활성 링크 ({activeItems.length})
          </h2>
          <div className="space-y-2">
            {activeItems.map((item) => (
              <ShareLinkCard key={item.id} item={item} onDelete={onDelete} />
            ))}
          </div>
        </div>
      )}

      {expiredItems.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            만료된 링크 ({expiredItems.length})
          </h2>
          <div className="space-y-2">
            {expiredItems.map((item) => (
              <ShareLinkCard key={item.id} item={item} onDelete={onDelete} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
