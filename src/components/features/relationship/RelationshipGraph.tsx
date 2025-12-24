"use client";

import { useMemo, useCallback, useState, useEffect } from "react";
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

import type { Character, Relationship } from "@/repositories/types";
import { RELATIONSHIP_TYPES } from "@/repositories/types";
import { getLayoutedElements } from "@/lib/graph-utils";
import { CharacterNode, type CharacterNodeData } from "./CharacterNode";
import { RelationshipEdge, type RelationshipEdgeData } from "./RelationshipEdge";
import { GraphLegend } from "./GraphLegend";

interface RelationshipGraphProps {
  characters: Character[];
  relationships: Relationship[];
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
}: RelationshipGraphProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    RELATIONSHIP_TYPES.map((t) => t.type)
  );

  const handleToggleType = useCallback((type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  }, []);

  const filteredRelationships = useMemo(
    () => relationships.filter((r) => selectedTypes.includes(r.type)),
    [relationships, selectedTypes]
  );

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
  }, [characters, filteredRelationships]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when data changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  if (characters.length === 0 || relationships.length === 0) {
    return (
      <div className="flex items-center justify-center h-[500px] border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">
          표시할 관계가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <GraphLegend
        selectedTypes={selectedTypes}
        onToggleType={handleToggleType}
      />
      <div className="h-[600px] border rounded-lg overflow-hidden">
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
      </div>
    </div>
  );
}
