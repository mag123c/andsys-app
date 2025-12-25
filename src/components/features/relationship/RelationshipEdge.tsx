"use client";

import { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type Edge,
  type Position,
} from "@xyflow/react";

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
  // 베지어 곡선 경로 (React Flow 기본 연결선과 동일)
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
  const reverseLabel = data?.reverseLabel;
  const bidirectional = data?.bidirectional ?? false;

  // 양방향이고 역라벨이 다른 경우 두 라벨 표시
  const showBothLabels = bidirectional && reverseLabel && reverseLabel !== label;

  const handleLabelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data?.onLabelClick) {
      data.onLabelClick(id, { x: e.clientX, y: e.clientY });
    }
  };

  return (
    <>
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
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          {showBothLabels ? (
            // 양방향 + 다른 라벨: 두 라벨을 세로로 표시
            <button
              type="button"
              onClick={handleLabelClick}
              className="flex flex-col gap-0.5 px-2 py-1 rounded text-xs font-medium bg-background border shadow-sm cursor-pointer hover:bg-accent transition-colors"
              style={{ borderColor: color, color }}
            >
              <span>{label}</span>
              <span className="border-t pt-0.5" style={{ borderColor: color }}>{reverseLabel}</span>
            </button>
          ) : (
            // 단방향 또는 동일 라벨: 하나의 라벨
            <button
              type="button"
              onClick={handleLabelClick}
              className="px-2 py-1 rounded text-xs font-medium bg-background border shadow-sm cursor-pointer hover:bg-accent transition-colors"
              style={{ borderColor: color, color }}
            >
              {label}
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const RelationshipEdge = memo(RelationshipEdgeComponent);
