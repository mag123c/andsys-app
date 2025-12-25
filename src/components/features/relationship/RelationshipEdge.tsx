"use client";

import { memo } from "react";
import {
  BaseEdge,
  getBezierPath,
  type Edge,
  type Position,
} from "@xyflow/react";

export interface RelationshipEdgeData extends Record<string, unknown> {
  color: string;
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
  markerStart?: string;
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
  markerStart,
  markerEnd,
}: RelationshipEdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const color = data?.color || "#6B7280";

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerStart={markerStart}
      markerEnd={markerEnd}
      style={{
        stroke: color,
        strokeWidth: 2,
      }}
    />
  );
}

export const RelationshipEdge = memo(RelationshipEdgeComponent);
