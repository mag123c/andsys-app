import dagre from "dagre";
import type { Node, Edge } from "@xyflow/react";

export interface LayoutOptions {
  direction?: "TB" | "BT" | "LR" | "RL";
  nodeWidth?: number;
  nodeHeight?: number;
  rankSep?: number;
  nodeSep?: number;
}

const DEFAULT_OPTIONS: Required<LayoutOptions> = {
  direction: "TB",
  nodeWidth: 150,
  nodeHeight: 80,
  rankSep: 80,
  nodeSep: 50,
};

/**
 * dagre를 사용하여 노드 위치를 자동 계산합니다.
 */
export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
): { nodes: Node[]; edges: Edge[] } {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = opts.direction === "LR" || opts.direction === "RL";
  dagreGraph.setGraph({
    rankdir: opts.direction,
    ranksep: opts.rankSep,
    nodesep: opts.nodeSep,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: opts.nodeWidth,
      height: opts.nodeHeight,
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - opts.nodeWidth / 2,
        y: nodeWithPosition.y - opts.nodeHeight / 2,
      },
      targetPosition: isHorizontal ? "left" : "top",
      sourcePosition: isHorizontal ? "right" : "bottom",
    } as Node;
  });

  return { nodes: layoutedNodes, edges };
}
