"use client";

import { FileText } from "lucide-react";

export function EmptyProjects() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">프로젝트가 없습니다</h3>
      <p className="text-muted-foreground max-w-sm">
        새 프로젝트를 만들어 소설 쓰기를 시작하세요.
      </p>
    </div>
  );
}
