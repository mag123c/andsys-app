"use client";

import { FileText } from "lucide-react";

export function EmptyChapters() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
        <FileText className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-medium">회차가 없습니다</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        새 회차를 추가해 글쓰기를 시작하세요.
      </p>
    </div>
  );
}
