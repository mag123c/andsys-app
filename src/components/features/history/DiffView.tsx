"use client";

import type { Version, LineDiff, FieldDiff } from "@/repositories/types";
import { getFieldLabel } from "@/lib/diff-utils";
import { cn } from "@/lib/utils";

interface DiffViewProps {
  version: Version;
  className?: string;
}

function LineDiffBlock({ lines }: { lines: LineDiff[] }) {
  if (lines.length === 0) return null;

  // unchanged만 있으면 표시하지 않음
  const hasChanges = lines.some((l) => l.type !== "unchanged");
  if (!hasChanges) return null;

  return (
    <div className="space-y-1">
      <h4 className="text-xs font-medium text-muted-foreground mb-2">
        텍스트 변경
      </h4>
      <div className="font-mono text-xs rounded-md border overflow-hidden">
        {lines.map((line, idx) => (
          <div
            key={idx}
            className={cn(
              "px-2 py-0.5 flex",
              line.type === "added" && "bg-green-100 dark:bg-green-900/30",
              line.type === "removed" && "bg-red-100 dark:bg-red-900/30"
            )}
          >
            <span
              className={cn(
                "w-4 shrink-0 select-none",
                line.type === "added" && "text-green-600 dark:text-green-400",
                line.type === "removed" && "text-red-600 dark:text-red-400",
                line.type === "unchanged" && "text-muted-foreground"
              )}
            >
              {line.type === "added" && "+"}
              {line.type === "removed" && "-"}
              {line.type === "unchanged" && " "}
            </span>
            <span
              className={cn(
                "flex-1 whitespace-pre-wrap break-all",
                line.type === "unchanged" && "text-muted-foreground"
              )}
            >
              {line.content || " "}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FieldDiffBlock({ fields }: { fields: FieldDiff[] }) {
  if (fields.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-muted-foreground">필드 변경</h4>
      <div className="space-y-2">
        {fields.map((field, idx) => (
          <div key={idx} className="rounded-md border p-2 space-y-1">
            <div className="text-xs font-medium">{getFieldLabel(field.field)}</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <span className="text-muted-foreground">이전</span>
                <div className="p-1.5 rounded bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 break-words">
                  {formatFieldValue(field.oldValue)}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">이후</span>
                <div className="p-1.5 rounded bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 break-words">
                  {formatFieldValue(field.newValue)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatFieldValue(value: unknown): string {
  if (value === null || value === undefined) return "(없음)";
  if (typeof value === "string") return value || "(빈 값)";
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "예" : "아니오";
  if (Array.isArray(value)) {
    if (value.length === 0) return "(비어있음)";
    return JSON.stringify(value, null, 2);
  }
  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

export function DiffView({ version, className }: DiffViewProps) {
  const diff = version.diff;

  if (!diff) {
    return (
      <div className={cn("text-center py-8 text-muted-foreground", className)}>
        <p className="text-sm">초기 버전입니다.</p>
        <p className="text-xs mt-1">이전 버전과 비교할 내용이 없습니다.</p>
      </div>
    );
  }

  const hasLineDiff = diff.lines && diff.lines.some((l) => l.type !== "unchanged");
  const hasFieldDiff = diff.fields && diff.fields.length > 0;

  if (!hasLineDiff && !hasFieldDiff) {
    return (
      <div className={cn("text-center py-8 text-muted-foreground", className)}>
        <p className="text-sm">변경사항이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {diff.lines && <LineDiffBlock lines={diff.lines} />}
      {diff.fields && <FieldDiffBlock fields={diff.fields} />}
    </div>
  );
}
