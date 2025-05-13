"use client";

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

// Define the expected structure of the data prop for ApiNode
interface ApiNodeData {
  label: string; // e.g., "GET Get User Profile"
  apiDefinition: { // The full API definition object
    name: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
    endpoint: string;
    description?: string;
    // Potentially other fields from ApiDefinition if needed for display
  };
}

// Ensure that NodeProps is generic over ApiNodeData
const ApiNode: React.FC<NodeProps<ApiNodeData>> = ({ data, isConnectable }) => {
  const { label, apiDefinition } = data;

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'bg-green-500';
      case 'POST': return 'bg-blue-500';
      case 'PUT': return 'bg-yellow-500';
      case 'DELETE': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-md shadow-lg p-3 w-60">
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="!bg-teal-500" />
      
      <div className="flex items-center mb-2">
        <span className={`px-2 py-0.5 text-xs font-bold text-white rounded-full mr-2 ${getMethodColor(apiDefinition.method)}`}>
          {apiDefinition.method}
        </span>
        <div className="font-semibold text-sm text-white truncate" title={apiDefinition.name}>
          {apiDefinition.name}
        </div>
      </div>
      <p className="text-xs text-gray-400 truncate" title={apiDefinition.endpoint}>
        {apiDefinition.endpoint}
      </p>
      {/* {apiDefinition.description && (
        <p className="text-xs text-gray-500 mt-1 truncate" title={apiDefinition.description}>
          {apiDefinition.description}
        </p>
      )} */}
      
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} className="!bg-teal-500" />
    </div>
  );
};

export default ApiNode;
