"use client";

import { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  type Edge,
  type Position,
} from "@xyflow/react";

export interface RelationshipEdgeData extends Record<string, unknown> {
  label: string;
  reverseLabel?: string | null;
  color: string;
  bidirectional?: boolean;
  isReverse?: boolean;
  parentId?: string;
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
  sourcePosition: _sourcePosition,
  targetPosition: _targetPosition,
  data,
  markerEnd,
}: RelationshipEdgeProps) {
  const isReverse = data?.isReverse ?? false;

  // 양방향 관계의 경우 곡률 조정 (정방향: 위로 곡선, 역방향: 아래로 곡선)
  const curvature = data?.bidirectional ? (isReverse ? -0.25 : 0.25) : 0;

  // 중점 계산
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  // 수직 방향 벡터
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const len = Math.sqrt(dx * dx + dy * dy);

  // 곡선 제어점 오프셋 (노드 사이 거리에 비례)
  const offset = len * curvature;
  const normalX = -dy / len;
  const normalY = dx / len;

  const controlX = midX + normalX * offset;
  const controlY = midY + normalY * offset;

  // 커스텀 Bezier 패스 (2차 베지어)
  const edgePath = `M ${sourceX} ${sourceY} Q ${controlX} ${controlY} ${targetX} ${targetY}`;

  // 라벨 위치 (곡선 중앙)
  const labelX = (sourceX + 2 * controlX + targetX) / 4;
  const labelY = (sourceY + 2 * controlY + targetY) / 4;

  const color = data?.color || "#6B7280";
  const label = data?.label || "";

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
            type="button"
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
