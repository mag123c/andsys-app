"use client";

import { RELATIONSHIP_TYPES } from "@/repositories/types";

interface GraphLegendProps {
  selectedTypes: string[];
  onToggleType: (type: string) => void;
}

export function GraphLegend({ selectedTypes, onToggleType }: GraphLegendProps) {
  return (
    <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg border">
      <span className="text-xs text-muted-foreground mr-2 self-center">
        필터:
      </span>
      {RELATIONSHIP_TYPES.map((config) => {
        const isSelected = selectedTypes.includes(config.type);
        return (
          <button
            key={config.type}
            onClick={() => onToggleType(config.type)}
            className="flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all"
            style={{
              backgroundColor: isSelected ? config.color + "20" : "transparent",
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: isSelected ? config.color : "transparent",
              opacity: isSelected ? 1 : 0.5,
            }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: config.color }}
            />
            <span>{config.label}</span>
          </button>
        );
      })}
    </div>
  );
}
