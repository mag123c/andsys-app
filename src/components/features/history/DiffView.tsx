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

  // 변경된 라인만 표시 (컨텍스트 없이)
  const changedLines = lines.filter((l) => l.type !== "unchanged");

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground">
        내용 변경
      </h4>
      <div className="rounded-lg border overflow-hidden">
        {changedLines.map((line, idx) => (
          <div
            key={idx}
            className={cn(
              "px-4 py-2 flex items-start gap-3",
              line.type === "added" && "bg-green-50 dark:bg-green-900/20",
              line.type === "removed" && "bg-red-50 dark:bg-red-900/20"
            )}
          >
            <span
              className={cn(
                "shrink-0 select-none font-medium text-sm",
                line.type === "added" && "text-green-600 dark:text-green-400",
                line.type === "removed" && "text-red-600 dark:text-red-400"
              )}
            >
              {line.type === "added" ? "추가" : "삭제"}
            </span>
            <span
              className={cn(
                "flex-1 text-sm whitespace-pre-wrap break-words",
                line.type === "added" && "text-green-700 dark:text-green-300",
                line.type === "removed" && "text-red-700 dark:text-red-300"
              )}
            >
              {line.content || "(빈 줄)"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// JSON 객체 필드는 소설 작가에게 불필요하므로 필터링
const HIDDEN_FIELDS = ["content", "snapshot"];

function isSimpleValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return true;
  if (typeof value === "number") return true;
  if (typeof value === "boolean") return true;
  return false;
}

function FieldDiffBlock({ fields }: { fields: FieldDiff[] }) {
  // JSON 객체 필드와 숨김 필드 제외
  const visibleFields = fields.filter(
    (f) =>
      !HIDDEN_FIELDS.includes(f.field) &&
      isSimpleValue(f.oldValue) &&
      isSimpleValue(f.newValue)
  );

  if (visibleFields.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground">변경된 항목</h4>
      <div className="space-y-2">
        {visibleFields.map((field, idx) => (
          <div key={idx} className="rounded-lg border p-3 space-y-2">
            <div className="text-sm font-medium">{getFieldLabel(field.field)}</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">이전</span>
                <div className="p-2 rounded-md bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
                  {formatFieldValue(field.oldValue)}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">이후</span>
                <div className="p-2 rounded-md bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
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
