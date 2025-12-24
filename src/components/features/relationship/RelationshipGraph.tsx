"use client";

import { useMemo, useCallback, useState, useEffect, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Pencil, Trash2, X } from "lucide-react";

import type { Character, Relationship } from "@/repositories/types";
import { RELATIONSHIP_TYPES } from "@/repositories/types";
import { getLayoutedElements } from "@/lib/graph-utils";
import { Button } from "@/components/ui/button";
import { CharacterNode, type CharacterNodeData } from "./CharacterNode";
import { RelationshipEdge, type RelationshipEdgeData } from "./RelationshipEdge";
import { GraphLegend } from "./GraphLegend";

interface RelationshipGraphProps {
  characters: Character[];
  relationships: Relationship[];
  onEdit?: (relationship: Relationship) => void;
  onDelete?: (id: string) => void;
}

interface PopoverState {
  relationshipId: string;
  position: { x: number; y: number };
}

const nodeTypes: NodeTypes = {
  character: CharacterNode,
};

const edgeTypes: EdgeTypes = {
  relationship: RelationshipEdge,
};

export function RelationshipGraph({
  characters,
  relationships,
  onEdit,
  onDelete,
}: RelationshipGraphProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    RELATIONSHIP_TYPES.map((t) => t.type)
  );
  const [popover, setPopover] = useState<PopoverState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleToggleType = useCallback((type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  }, []);

  const handleLabelClick = useCallback(
    (edgeId: string, position: { x: number; y: number }) => {
      setPopover({ relationshipId: edgeId, position });
    },
    []
  );

  const handleClosePopover = useCallback(() => {
    setPopover(null);
  }, []);

  const handleEdit = useCallback(() => {
    if (popover && onEdit) {
      const relationship = relationships.find((r) => r.id === popover.relationshipId);
      if (relationship) {
        onEdit(relationship);
      }
    }
    setPopover(null);
  }, [popover, onEdit, relationships]);

  const handleDelete = useCallback(() => {
    if (popover && onDelete) {
      onDelete(popover.relationshipId);
    }
    setPopover(null);
  }, [popover, onDelete]);

  const filteredRelationships = useMemo(
    () => relationships.filter((r) => selectedTypes.includes(r.type)),
    [relationships, selectedTypes]
  );

  const selectedRelationship = useMemo(() => {
    if (!popover) return null;
    return relationships.find((r) => r.id === popover.relationshipId) || null;
  }, [popover, relationships]);

  const { initialNodes, initialEdges } = useMemo(() => {
    // Create nodes for characters that have relationships
    const connectedCharacterIds = new Set<string>();
    filteredRelationships.forEach((r) => {
      connectedCharacterIds.add(r.fromCharacterId);
      connectedCharacterIds.add(r.toCharacterId);
    });

    const nodes: Node<CharacterNodeData>[] = characters
      .filter((c) => connectedCharacterIds.has(c.id))
      .map((character) => ({
        id: character.id,
        type: "character",
        position: { x: 0, y: 0 },
        data: {
          name: character.name,
          imageUrl: character.imageUrl,
          nickname: character.nickname,
          occupation: character.occupation,
        },
      }));

    const edges: Edge<RelationshipEdgeData>[] = filteredRelationships.map(
      (relationship) => {
        const typeConfig = RELATIONSHIP_TYPES.find(
          (t) => t.type === relationship.type
        );
        const color = typeConfig?.color || "#6B7280";

        return {
          id: relationship.id,
          source: relationship.fromCharacterId,
          target: relationship.toCharacterId,
          type: "relationship",
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color,
          },
          data: {
            label: relationship.label,
            reverseLabel: relationship.reverseLabel,
            color,
            bidirectional: relationship.bidirectional,
            onLabelClick: handleLabelClick,
          },
        };
      }
    );

    // Apply dagre layout
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges,
      { direction: "TB", rankSep: 100, nodeSep: 80 }
    );

    return { initialNodes: layoutedNodes, initialEdges: layoutedEdges };
  }, [characters, filteredRelationships, handleLabelClick]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when data changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (popover && !target.closest("[data-popover]")) {
        setPopover(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [popover]);

  if (characters.length === 0 || relationships.length === 0) {
    return (
      <div className="flex items-center justify-center h-[500px] border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">
          표시할 관계가 없습니다.
        </p>
      </div>
    );
  }

  // 캐릭터 이름 찾기
  const getCharacterName = (id: string) => {
    return characters.find((c) => c.id === id)?.name || "알 수 없음";
  };

  return (
    <div className="space-y-4">
      <GraphLegend
        selectedTypes={selectedTypes}
        onToggleType={handleToggleType}
      />
      <div ref={containerRef} className="relative h-[600px] border rounded-lg overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={16} size={1} />
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor="#6B7280"
            maskColor="rgb(0, 0, 0, 0.1)"
            className="bg-background"
          />
        </ReactFlow>

        {/* 관계 팝오버 */}
        {popover && selectedRelationship && (
          <div
            data-popover
            className="fixed z-50 bg-background border rounded-lg shadow-lg p-4 min-w-[200px]"
            style={{
              left: popover.position.x,
              top: popover.position.y,
              transform: "translate(-50%, 8px)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-sm">관계 정보</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleClosePopover}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">관계</span>
                <span className="font-medium">{selectedRelationship.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">대상</span>
                <span>
                  {getCharacterName(selectedRelationship.fromCharacterId)} → {getCharacterName(selectedRelationship.toCharacterId)}
                </span>
              </div>
              {selectedRelationship.bidirectional && selectedRelationship.reverseLabel && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">역관계</span>
                  <span>{selectedRelationship.reverseLabel}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleEdit}
              >
                <Pencil className="h-3 w-3 mr-1" />
                편집
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-destructive hover:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                삭제
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
