"use client";

import { Users } from "lucide-react";

export function EmptyCharacters() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="rounded-full bg-muted p-4">
        <Users className="h-8 w-8 text-muted-foreground" />
      </div>
      <div>
        <h3 className="font-medium">등장인물이 없습니다</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          &quot;+ 추가&quot; 버튼을 눌러 등장인물을 추가해보세요.
        </p>
      </div>
    </div>
  );
}
