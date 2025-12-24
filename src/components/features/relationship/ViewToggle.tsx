"use client";

import { List, Network } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type ViewMode = "list" | "graph";

interface ViewToggleProps {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => v && onChange(v as ViewMode)}
    >
      <ToggleGroupItem value="list" aria-label="리스트 뷰" size="sm">
        <List className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="graph" aria-label="그래프 뷰" size="sm">
        <Network className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
