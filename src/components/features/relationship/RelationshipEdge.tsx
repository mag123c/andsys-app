"use client";

import { memo } from "react";
import {
  BaseEdge,
  getBezierPath,
  type Edge,
  type EdgeProps,
} from "@xyflow/react";

export interface RelationshipEdgeData extends Record<string, unknown> {
  color: string;
}

export type RelationshipEdgeType = Edge<RelationshipEdgeData, "relationship">;

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
  selected,
}: EdgeProps<RelationshipEdgeType>) {
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
    <>
      {/* 클릭 영역 확대를 위한 투명한 두꺼운 선 */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        style={{ cursor: "pointer", pointerEvents: "stroke" }}
        className="react-flow__edge-interaction"
      />
      {/* 선택 시 글로우 효과 */}
      {selected && (
        <path
          d={edgePath}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeOpacity={0.3}
          style={{ pointerEvents: "none" }}
        />
      )}
      <BaseEdge
        id={id}
        path={edgePath}
        markerStart={markerStart}
        markerEnd={markerEnd}
        style={{
          stroke: color,
          strokeWidth: selected ? 3 : 2,
        }}
      />
    </>
  );
}

export const RelationshipEdge = memo(RelationshipEdgeComponent);
