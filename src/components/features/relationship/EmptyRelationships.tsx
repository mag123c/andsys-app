"use client";

import { Network } from "lucide-react";

interface EmptyRelationshipsProps {
  hasCharacters: boolean;
}

export function EmptyRelationships({ hasCharacters }: EmptyRelationshipsProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="rounded-full bg-muted p-4">
        <Network className="h-8 w-8 text-muted-foreground" />
      </div>
      <div>
        <h3 className="font-medium">관계가 없습니다</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {hasCharacters
            ? '"+ 관계 추가" 버튼을 눌러 등장인물 간의 관계를 설정해보세요.'
            : "먼저 등장인물을 추가한 후 관계를 설정할 수 있습니다."}
        </p>
      </div>
    </div>
  );
}
