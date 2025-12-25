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
  type Connection,
  type OnConnect,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import type { Character, Relationship } from "@/repositories/types";
import { RELATIONSHIP_TYPES } from "@/repositories/types";
import { getLayoutedElements } from "@/lib/graph-utils";
import { CharacterNode, type CharacterNodeData } from "./CharacterNode";
import { RelationshipEdge, type RelationshipEdgeData } from "./RelationshipEdge";
import { GraphLegend } from "./GraphLegend";
import { CharacterPanel } from "./CharacterPanel";

interface RelationshipGraphProps {
  characters: Character[];
  relationships: Relationship[];
  onDelete?: (id: string) => void;
  onCreate?: (fromCharacterId: string, toCharacterId: string) => void;
  /** 읽기 전용 모드 (회차 상세에서 사용) */
  readonly?: boolean;
}

const nodeTypes: NodeTypes = {
  character: CharacterNode,
};

const edgeTypes: EdgeTypes = {
  relationship: RelationshipEdge,
};

// 노드 크기 상수
const NODE_WIDTH = 120;
const NODE_HEIGHT = 60;

function RelationshipGraphInner({
  characters,
  relationships,
  onDelete,
  onCreate,
  readonly = false,
}: RelationshipGraphProps) {
  const { screenToFlowPosition } = useReactFlow();
  const reactFlowRef = useRef<HTMLDivElement>(null);

  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    RELATIONSHIP_TYPES.map((t) => t.type)
  );
  const [showMiniMap, setShowMiniMap] = useState(true);
  const miniMapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 그래프에 있는 노드 ID들
  const [graphNodeIds, setGraphNodeIds] = useState<Set<string>>(new Set());

  // 수동으로 배치된 노드 위치 (드래그 드롭으로 추가된 노드)
  const manualPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  // 노드 삭제로 인해 무시할 엣지 ID들 (노드 삭제 시 연결된 엣지도 삭제되지만 IndexedDB에는 반영 안 함)
  const deletingEdgeIdsRef = useRef<Set<string>>(new Set());

  // 초기화 여부 추적 (초기 로드 시에만 관계가 있는 캐릭터를 그래프에 추가)
  const isInitializedRef = useRef(false);
  // 이전 relationships 추적 (새로 추가된 관계만 감지)
  const prevRelationshipsRef = useRef<Relationship[]>([]);

  // MiniMap 자동 숨김 (3초 비활동 후)
  const handleViewportChange = useCallback(() => {
    setShowMiniMap(true);
    if (miniMapTimeoutRef.current) {
      clearTimeout(miniMapTimeoutRef.current);
    }
    miniMapTimeoutRef.current = setTimeout(() => {
      setShowMiniMap(false);
    }, 3000);
  }, []);

  useEffect(() => {
    miniMapTimeoutRef.current = setTimeout(() => {
      setShowMiniMap(false);
    }, 3000);
    return () => {
      if (miniMapTimeoutRef.current) {
        clearTimeout(miniMapTimeoutRef.current);
      }
    };
  }, []);

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

  // 관계가 있는 캐릭터들을 그래프에 추가 (초기화 또는 새 관계 추가 시)
  useEffect(() => {
    if (!isInitializedRef.current) {
      // 초기화: 모든 관계의 캐릭터를 추가
      const connectedIds = new Set<string>();
      relationships.forEach((r) => {
        connectedIds.add(r.fromCharacterId);
        connectedIds.add(r.toCharacterId);
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 초기화 시 관계가 있는 캐릭터를 그래프에 추가하기 위한 의도적 패턴
      setGraphNodeIds(connectedIds);
      isInitializedRef.current = true;
    } else {
      // 새로 추가된 관계만 처리 (삭제된 관계는 무시 - 노드 유지)
      const prevIds = new Set(prevRelationshipsRef.current.map((r) => r.id));
      const newRelationships = relationships.filter((r) => !prevIds.has(r.id));

      if (newRelationships.length > 0) {
        const newCharacterIds = new Set<string>();
        newRelationships.forEach((r) => {
          newCharacterIds.add(r.fromCharacterId);
          newCharacterIds.add(r.toCharacterId);
        });
        // 새 캐릭터만 추가 (기존 노드는 유지)
        // eslint-disable-next-line react-hooks/set-state-in-effect -- 새 관계 추가 시 관련 캐릭터를 그래프에 추가하기 위한 의도적 패턴
        setGraphNodeIds((prev) => new Set([...prev, ...newCharacterIds]));
      }
    }

    prevRelationshipsRef.current = relationships;
  }, [relationships]);

  const { initialNodes, initialEdges } = useMemo(() => {
    // 그래프에 있는 캐릭터만 노드로 생성
    const nodes: Node<CharacterNodeData>[] = characters
      .filter((c) => graphNodeIds.has(c.id))
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

    // 관계를 단일 엣지로 생성 (양방향은 양쪽 화살표)
    const edges: Edge<RelationshipEdgeData>[] = [];

    filteredRelationships.forEach((relationship) => {
      const typeConfig = RELATIONSHIP_TYPES.find((t) => t.type === relationship.type);
      const color = typeConfig?.color || "#6B7280";

      edges.push({
        id: relationship.id,
        source: relationship.fromCharacterId,
        target: relationship.toCharacterId,
        type: "relationship",
        // 양방향이면 양쪽 화살표
        ...(relationship.bidirectional && {
          markerStart: {
            type: MarkerType.ArrowClosed,
            color,
          },
        }),
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color,
        },
        data: {
          color,
        },
      });
    });

    // dagre 레이아웃 적용 (수동 배치된 노드는 제외)
    if (nodes.length > 0) {
      // 수동 위치가 없는 노드만 dagre 레이아웃 적용
      // 모든 노드가 수동 배치인 경우 nodesForLayout은 빈 배열이 되어 dagre 스킵
      const nodesForLayout = nodes.filter((n) => !manualPositionsRef.current.has(n.id));
      const manualNodes = nodes.filter((n) => manualPositionsRef.current.has(n.id));

      let layoutedNodes: Node<CharacterNodeData>[] = [];

      // 자동 레이아웃이 필요한 노드가 있을 때만 dagre 적용
      if (nodesForLayout.length > 0) {
        const { nodes: dagredNodes } = getLayoutedElements(
          nodesForLayout,
          edges,
          { direction: "TB", rankSep: 150, nodeSep: 100 }
        );
        layoutedNodes = dagredNodes as Node<CharacterNodeData>[];
      }

      // 수동 위치가 있는 노드는 저장된 위치 적용
      const manualLayoutedNodes = manualNodes.map((node) => ({
        ...node,
        position: manualPositionsRef.current.get(node.id) || node.position,
      }));

      return {
        initialNodes: [...layoutedNodes, ...manualLayoutedNodes],
        initialEdges: edges,
      };
    }

    return { initialNodes: nodes, initialEdges: edges };
  }, [characters, filteredRelationships, graphNodeIds]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // 데이터 변경 시 노드/엣지 업데이트
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // 드래그 앤 드롭으로 노드 추가
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const characterId = event.dataTransfer.getData("application/character-id");
      if (!characterId) return;

      const character = characters.find((c) => c.id === characterId);
      if (!character) return;

      // 이미 그래프에 있으면 무시
      if (graphNodeIds.has(characterId)) return;

      // 드롭 위치 계산 - React Flow 컨테이너 기준으로 변환
      if (!reactFlowRef.current) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // 새 노드 추가 (노드 크기의 절반만큼 오프셋 적용하여 마우스 위치 중심에 배치)
      const nodePosition = {
        x: position.x - NODE_WIDTH / 2,
        y: position.y - NODE_HEIGHT / 2,
      };

      // 수동 위치 저장 (dagre 레이아웃 덮어쓰기 방지)
      manualPositionsRef.current.set(character.id, nodePosition);

      const newNode: Node<CharacterNodeData> = {
        id: character.id,
        type: "character",
        position: nodePosition,
        data: {
          name: character.name,
          imageUrl: character.imageUrl,
          nickname: character.nickname,
          occupation: character.occupation,
        },
      };

      setNodes((nds) => [...nds, newNode]);
      setGraphNodeIds((prev) => new Set([...prev, characterId]));
    },
    [characters, graphNodeIds, screenToFlowPosition, setNodes]
  );

  // 드래그 시작 핸들러 (CharacterPanel에서 사용)
  const handleDragStart = useCallback(
    (event: React.DragEvent, character: Character) => {
      event.dataTransfer.setData("application/character-id", character.id);
      event.dataTransfer.effectAllowed = "move";
    },
    []
  );

  // 엣지 연결 시 관계 생성 다이얼로그 열기
  const handleConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      if (connection.source === connection.target) return;

      // 이미 관계가 있는지 확인
      const existingRelationship = relationships.find(
        (r) =>
          (r.fromCharacterId === connection.source && r.toCharacterId === connection.target) ||
          (r.fromCharacterId === connection.target && r.toCharacterId === connection.source)
      );

      // 기존 관계가 없으면 새 관계 생성
      if (!existingRelationship) {
        onCreate?.(connection.source, connection.target);
      }
    },
    [relationships, onCreate]
  );

  // 노드 삭제 시 그래프에서만 제거 (관계 데이터는 IndexedDB에 유지)
  const handleNodesDelete = useCallback(
    (deletedNodes: Node[]) => {
      const deletedIds = new Set(deletedNodes.map((n) => n.id));

      // 삭제될 엣지 ID들을 미리 저장 (연결된 엣지)
      deletingEdgeIdsRef.current = new Set(
        edges
          .filter((e) => deletedIds.has(e.source) || deletedIds.has(e.target))
          .map((e) => e.id)
      );

      // 그래프에서 노드 제거
      setGraphNodeIds((prev) => {
        const next = new Set(prev);
        deletedIds.forEach((id) => next.delete(id));
        return next;
      });

      // 수동 위치 정보도 제거
      deletedIds.forEach((id) => manualPositionsRef.current.delete(id));
    },
    [edges]
  );

  // 엣지(관계) 삭제 시 IndexedDB에서도 삭제
  const handleEdgesDelete = useCallback(
    (deletedEdges: Edge[]) => {
      // 노드 삭제로 인한 엣지는 무시 (관계 데이터 유지)
      const edgesToDelete = deletedEdges.filter(
        (e) => !deletingEdgeIdsRef.current.has(e.id)
      );

      // 삭제 실패해도 UI에서는 이미 제거됨 (새로고침 시 복원)
      edgesToDelete.forEach((edge) => {
        onDelete?.(edge.id);
      });

      // 무시 목록 초기화
      deletingEdgeIdsRef.current = new Set();
    },
    [onDelete]
  );

  // 그래프에 있는 노드 ID (CharacterPanel용 메모이제이션)
  const nodesOnGraph = useMemo(() => new Set(nodes.map((n) => n.id)), [nodes]);

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      {/* 그래프 영역 */}
      <div className="flex-1 flex flex-col">
        <GraphLegend
          selectedTypes={selectedTypes}
          onToggleType={handleToggleType}
        />
        <div ref={reactFlowRef} className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodesDelete={readonly ? undefined : handleNodesDelete}
            onEdgesDelete={readonly ? undefined : handleEdgesDelete}
            onConnect={readonly ? undefined : handleConnect}
            onMove={handleViewportChange}
            onDrop={readonly ? undefined : onDrop}
            onDragOver={readonly ? undefined : onDragOver}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
            minZoom={0.1}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
            connectionLineStyle={{ stroke: "#6B7280", strokeWidth: 2 }}
            edgesFocusable={!readonly}
            nodesDraggable={!readonly}
            nodesConnectable={!readonly}
            elementsSelectable={!readonly}
            deleteKeyCode={readonly ? null : "Delete"}
            defaultEdgeOptions={{
              type: "relationship",
              selectable: !readonly,
              focusable: !readonly,
            }}
          >
            <Background gap={16} size={1} />
            <Controls
              showInteractive={false}
              className="!bg-background !border-border !shadow-md [&>button]:!bg-background [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-muted"
            />
            <MiniMap
              nodeColor="#6B7280"
              maskColor="rgb(0, 0, 0, 0.1)"
              className="bg-background transition-opacity duration-300"
              style={{ opacity: showMiniMap ? 1 : 0, pointerEvents: showMiniMap ? "auto" : "none" }}
            />
          </ReactFlow>

          {/* 빈 상태 */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-muted-foreground">
                <p className="text-lg mb-2">관계도가 비어있습니다</p>
                {!readonly && (
                  <p className="text-sm">우측 패널에서 캐릭터를 드래그하여 추가하세요</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 캐릭터 패널 - 읽기 전용일 때 숨김 */}
      {!readonly && (
        <CharacterPanel
          characters={characters}
          nodesOnGraph={nodesOnGraph}
          onDragStart={handleDragStart}
        />
      )}
    </div>
  );
}

export function RelationshipGraph(props: RelationshipGraphProps) {
  return (
    <ReactFlowProvider>
      <RelationshipGraphInner {...props} />
    </ReactFlowProvider>
  );
}
