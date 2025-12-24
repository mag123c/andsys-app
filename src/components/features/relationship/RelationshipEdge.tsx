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
          <div
            className="px-2 py-0.5 rounded text-xs font-medium bg-background border shadow-sm"
            style={{ borderColor: color, color }}
          >
            {label}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const RelationshipEdge = memo(RelationshipEdgeComponent);
