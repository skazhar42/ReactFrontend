import type { WorkflowEdge, WorkflowNode } from "../types/types";

export function propagateUpdates(
  changedNodeId: string,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
) {
  // Fast lookup
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Adjacency list
  const outgoingMap = new Map<string, WorkflowEdge[]>();

  for (const edge of edges) {
    if (!outgoingMap.has(edge.source)) {
      outgoingMap.set(edge.source, []);
    }

    outgoingMap.get(edge.source)!.push(edge);
  }

  // Prevent cycles
  const visited = new Set<string>();

  function updateNodeRecursively(nodeId: string) {
    if (visited.has(nodeId)) return;

    visited.add(nodeId);

    const outgoingEdges = outgoingMap.get(nodeId) || [];

    for (const edge of outgoingEdges) {
      // 1. Update edge
      updateEdge(edge, nodeMap);

      // 2. Update target node
      const targetNode = nodeMap.get(edge.target);

      if (targetNode) {
        updateNode(targetNode, edge);

        // 3. Continue propagation
        updateNodeRecursively(targetNode.id);
      }
    }
  }

  updateNodeRecursively(changedNodeId);

  return {
    nodes: Array.from(nodeMap.values()),
    edges,
  };
}

function updateEdge(
  edge: WorkflowEdge,
  nodeMap: Map<string, WorkflowNode>
) {
  const source = nodeMap.get(edge.source);

  // edge_XY.data.active = f(nodeX.data.result === edge_XY.data.expectedSourceResult, nodeX.data.state === "Success" )
    // nodeY.data.state = g(nodeY.data.result, edge_XY.data.active === true)

  console.log("updating edge", edge.id, source?.data);
  if(source?.data.result === edge.data?.expectedSourceResult && source?.data.state === "Success") {
    edge.data.active = true;
  }
}

function updateNode(
  node: WorkflowNode,
  incomingEdge: WorkflowEdge
) {
  node.data.result = incomingEdge?.data?.expectedSourceResult || "Pending";
}