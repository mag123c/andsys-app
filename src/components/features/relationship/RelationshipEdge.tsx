"use client";

import { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type Edge,
} from "@xyflow/react";
import type { Position } from "@xyflow/react";

export interface RelationshipEdgeData extends Record<string, unknown> {
  label: string;
  reverseLabel?: string | null;
  color: string;
  bidirectional?: boolean;
  onLabelClick?: (edgeId: string, position: { x: number; y: number }) => void;
}

export type RelationshipEdgeType = Edge<RelationshipEdgeData, "relationship">;

interface RelationshipEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  data?: RelationshipEdgeData;
  markerEnd?: string;
}

function RelationshipEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}: RelationshipEdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const color = data?.color || "#6B7280";
  const label = data?.label || "";

  const handleLabelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data?.onLabelClick) {
      // 뷰포트 기준 좌표 전달
      data.onLabelClick(id, { x: e.clientX, y: e.clientY });
    }
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: color,
          strokeWidth: 2,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          <button
            onClick={handleLabelClick}
            className="px-2 py-1 rounded text-xs font-medium bg-background border shadow-sm cursor-pointer hover:bg-accent transition-colors"
            style={{ borderColor: color, color }}
          >
            {label}
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const RelationshipEdge = memo(RelationshipEdgeComponent);
