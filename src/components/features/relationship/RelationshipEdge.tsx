"use client";

import { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  type Edge,
  type EdgeProps,
} from "@xyflow/react";
import { Trash2 } from "lucide-react";

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
  const { deleteElements } = useReactFlow();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const color = data?.color || "#6B7280";

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElements({ edges: [{ id }] });
  };

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
      {/* 삭제 버튼 - 선택 시에만 표시 */}
      {selected && (
        <EdgeLabelRenderer>
          <button
            onClick={handleDelete}
            className="absolute p-1.5 rounded-md bg-background border border-border shadow-md hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors pointer-events-auto"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
            title="삭제 (Delete)"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const RelationshipEdge = memo(RelationshipEdgeComponent);
