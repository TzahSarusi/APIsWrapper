"use client";

import React, { useRef } from 'react';
import ReactFlow, {
  Controls,
  Background,
  Node,
  Edge,
  Connection,
  // MiniMap, // Already removed by user request
} from 'reactflow';

import 'reactflow/dist/style.css';
import ApiNode from './ApiNode'; // Assuming ApiNode.tsx is in the same directory

// This interface should match the structure of the 'apiDefinition' object
// that is stored in the node's data property.
// It's derived from the ApiDefinition in page.tsx but might be a subset or specifically for canvas nodes.
export interface CanvasApiNodeData {
  id: string; // Original ID of the API definition
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
  endpoint: string;
  description?: string;
  schema?: any; // Keep schema flexible or align with ApiDefinition['schema']
  isDummy?: boolean;
}

interface WorkflowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: any) => void; // Consider using NodeChange[] type from reactflow
  onEdgesChange: (changes: any) => void; // Consider using EdgeChange[] type from reactflow
  onConnect: (connection: Connection | Edge) => void;
  onNodeSelected: (nodeData: CanvasApiNodeData | null) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeSelected,
  onDrop,
  onDragOver,
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  return (
    <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }} onDragOver={onDragOver} onDrop={onDrop}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={{ apiNode: ApiNode }} // Register the custom node
        onNodeClick={(_event, node) => {
          if (node.data && node.data.apiDefinition) {
            // Pass the apiDefinition part of the node's data
            onNodeSelected(node.data.apiDefinition as CanvasApiNodeData);
          } else {
            onNodeSelected(null);
          }
        }}
        onPaneClick={() => onNodeSelected(null)} // Deselect when clicking on the pane
        attributionPosition="top-right"
        // fitView // Consider if this is needed or if it should be triggered manually
      >
        <Controls />
        <Background />
        {/* <MiniMap /> was removed as per your request */}
      </ReactFlow>
    </div>
  );
};

export default WorkflowCanvas;
