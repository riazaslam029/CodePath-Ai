import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  ReactFlowProvider,
  useReactFlow
} from '@xyflow/react';
import dagre from 'dagre';
import CustomNode from './CustomNode';
import GraphControls from './GraphControls';

const nodeTypes = {
  codeFile: CustomNode
};

const NODE_WIDTH = 240;
const NODE_HEIGHT = 120;

function getLayoutedElements(nodes, edges, direction = 'TB') {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 60,
    ranksep: 90,
    marginx: 40,
    marginy: 40
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
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
        x: nodeWithPosition ? nodeWithPosition.x - NODE_WIDTH / 2 : 0,
        y: nodeWithPosition ? nodeWithPosition.y - NODE_HEIGHT / 2 : 0
      }
    };
  });

  return { nodes: layoutedNodes, edges };
}

function GraphView({
  graphData,
  selectedNodeId,
  onSelectNode,
  tracedFiles = [],
  onClearTrace
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const { zoomIn, zoomOut, fitView } = useReactFlow();

  // Create lookup for trace step numbers (1-indexed)
  const traceMap = useMemo(() => {
    const map = new Map();
    if (tracedFiles && Array.isArray(tracedFiles)) {
      tracedFiles.forEach((fileId, index) => {
        map.set(fileId, index + 1);
        // Also map basename for flexibility
        const base = fileId.split('/').pop();
        map.set(base, index + 1);
      });
    }
    return map;
  }, [tracedFiles]);

  // Construct React Flow elements from graphData
  useEffect(() => {
    if (!graphData || !graphData.nodes) return;

    const rawNodes = graphData.nodes
      .filter((node) => {
        if (activeFilter !== 'all' && node.type !== activeFilter) {
          return false;
        }
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          return (
            node.label.toLowerCase().includes(query) ||
            node.path.toLowerCase().includes(query) ||
            node.role.toLowerCase().includes(query)
          );
        }
        return true;
      })
      .map((node) => {
        const stepNum = traceMap.get(node.id) || traceMap.get(node.label) || null;
        return {
          id: node.id,
          type: 'codeFile',
          data: {
            ...node,
            traceStep: stepNum
          },
          selected: node.id === selectedNodeId,
          position: { x: 0, y: 0 }
        };
      });

    const activeNodeIds = new Set(rawNodes.map((n) => n.id));

    const rawEdges = (graphData.edges || [])
      .filter((e) => activeNodeIds.has(e.source) && activeNodeIds.has(e.target))
      .map((e, index) => {
        const isTracedEdge =
          traceMap.has(e.source) &&
          traceMap.has(e.target) &&
          traceMap.get(e.source) + 1 === traceMap.get(e.target);

        return {
          id: `edge-${e.source}-${e.target}-${index}`,
          source: e.source,
          target: e.target,
          type: 'smoothstep',
          animated: isTracedEdge,
          label: isTracedEdge ? `Step ${traceMap.get(e.source)} ➔ ${traceMap.get(e.target)}` : (e.type === 'api_call' ? 'calls API' : undefined),
          style: {
            stroke: isTracedEdge ? '#818cf8' : '#334155',
            strokeWidth: isTracedEdge ? 3 : 1.5,
            opacity: isTracedEdge ? 1 : 0.65
          },
          labelStyle: {
            fill: '#c7d2fe',
            fontWeight: 600,
            fontSize: 10,
            fontFamily: 'monospace'
          },
          labelBgStyle: {
            fill: '#1e1b4b',
            fillOpacity: 0.9,
            rx: 4,
            ry: 4
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isTracedEdge ? '#818cf8' : '#475569',
            width: 14,
            height: 14
          }
        };
      });

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      rawNodes,
      rawEdges,
      'TB'
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);

    // Smoothly focus view
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 400 });
    }, 50);
  }, [graphData, selectedNodeId, traceMap, activeFilter, searchQuery, fitView, setNodes, setEdges]);

  const handleNodeClick = useCallback(
    (_, node) => {
      if (onSelectNode) {
        onSelectNode(node.data);
      }
    },
    [onSelectNode]
  );

  const handleResetLayout = useCallback(() => {
    setSearchQuery('');
    setActiveFilter('all');
    if (onClearTrace) onClearTrace();
    fitView({ padding: 0.2, duration: 300 });
  }, [fitView, onClearTrace]);

  return (
    <div className="relative w-full h-full bg-[#080c14] select-none">
      <GraphControls
        onZoomIn={() => zoomIn({ duration: 250 })}
        onZoomOut={() => zoomOut({ duration: 250 })}
        onFitView={() => fitView({ padding: 0.2, duration: 300 })}
        onResetLayout={handleResetLayout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        activeTraceCount={tracedFiles.length}
        onClearTrace={onClearTrace}
      />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        minZoom={0.15}
        maxZoom={2.0}
        defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1e293b" gap={24} size={1} />
        <Controls showInteractive={false} className="!bottom-4 !left-4" />
        <MiniMap
          nodeColor={(node) => {
            if (node.data?.traceStep) return '#818cf8';
            if (node.data?.type === 'component') return '#0ea5e9';
            if (node.data?.type === 'api') return '#10b981';
            if (node.data?.type === 'service') return '#6366f1';
            if (node.data?.type === 'database') return '#f43f5e';
            return '#475569';
          }}
          maskColor="rgba(8, 12, 20, 0.75)"
          className="!bottom-4 !right-4 !bg-[#0d1424] !border !border-slate-800 !rounded-xl !overflow-hidden"
        />
      </ReactFlow>
    </div>
  );
}

export default function CodeGraph(props) {
  return (
    <ReactFlowProvider>
      <GraphView {...props} />
    </ReactFlowProvider>
  );
}
