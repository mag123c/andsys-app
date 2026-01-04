"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ChevronDown, FileText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useLocalStorageBoolean } from "@/hooks/useLocalStorage";

const PLOT_EXPANDED_KEY = "4ndsys:editor-plot-expanded";

interface PlotMemoProps {
  plot: string | null;
  onPlotChange?: (plot: string | null) => void;
  className?: string;
}

export function PlotMemo({
  plot,
  onPlotChange,
  className,
}: PlotMemoProps) {
  const [expanded, setExpanded] = useLocalStorageBoolean(PLOT_EXPANDED_KEY, false);
  const [draft, setDraft] = useState(plot ?? "");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // 최신 값 참조용 ref (cleanup에서 사용)
  const draftRef = useRef(draft);
  const plotRef = useRef(plot);
  const onPlotChangeRef = useRef(onPlotChange);

  // ref 동기화
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    plotRef.current = plot;
  }, [plot]);

  useEffect(() => {
    onPlotChangeRef.current = onPlotChange;
  }, [onPlotChange]);

  // 외부 plot이 변경되면 draft 동기화
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 외부 prop → 내부 state 동기화 패턴
    setDraft(plot ?? "");
  }, [plot]);

  // debounced save
  const handleChange = useCallback(
    (value: string) => {
      setDraft(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        if (onPlotChange) {
          onPlotChange(value.trim() || null);
        }
      }, 500);
    },
    [onPlotChange]
  );

  // cleanup on unmount - 저장되지 않은 내용 저장
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // 저장되지 않은 내용이 있으면 즉시 저장
      const currentDraft = draftRef.current.trim() || null;
      const currentPlot = plotRef.current;
      if (onPlotChangeRef.current && currentDraft !== currentPlot) {
        onPlotChangeRef.current(currentDraft);
      }
    };
  }, []);

  const hasContent = !!plot?.trim();

  return (
    <div className={cn("border-b", className)}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-2 text-sm transition-colors",
          "hover:bg-accent/50",
          expanded && "bg-accent/30"
        )}
      >
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">플롯 메모</span>
          {!expanded && hasContent && (
            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
              - {plot}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            expanded && "rotate-180"
          )}
        />
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          <Textarea
            value={draft}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="이 회차에서 일어날 일, 주요 사건, 메모 등을 적어보세요..."
            className="min-h-[100px] text-sm resize-none"
            disabled={!onPlotChange}
          />
          <p className="mt-1 text-xs text-muted-foreground text-right">
            자동 저장됨
          </p>
        </div>
      )}
    </div>
  );
}
