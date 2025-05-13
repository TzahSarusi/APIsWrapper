"use client"; 

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import ApiImportForm from '@/components/ApiImport/ApiImportForm';
import WorkflowCanvas, { CanvasApiNodeData } from '@/components/WorkflowBuilder/WorkflowCanvas';
import {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  Node as FlowNode, // Renamed to avoid conflict with DOM Node type
  Edge,
  Connection,
} from 'reactflow';

export interface ApiDefinition {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
  endpoint: string;
  description?: string;
  category?: string;
  iconName?: string;
  isDummy?: boolean;
  schema?: {
    pathParams?: Array<{ name: string; type: string; description?: string; required?: boolean }>;
    queryParams?: Array<{ name: string; type: string; description?: string; required?: boolean }>;
    requestBody?: any;
    responsePreview?: {
      [statusCode: string]: any;
    };
  };
}

interface WorkflowListItem {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

interface FullWorkflow extends WorkflowListItem {
  nodes: FlowNode[]; // Use renamed FlowNode
  edges: Edge[];
}

const SAMPLE_APIS: ApiDefinition[] = [
  {
    id: 'dummy-1',
    name: 'Get User Profile',
    description: 'Retrieve user profile details',
    method: 'GET',
    endpoint: '/api/users/{id}',
    category: 'users',
    iconName: 'User',
    isDummy: true,
    schema: {
      pathParams: [{ name: 'id', type: 'string', description: 'User ID', required: true }],
      responsePreview: {
        "200": { status: 200, data: { id: "uuid-1234", name: "John Doe", email: "john@example.com", role: "user", created_at: "2025-05-13T14:01:03.917Z" } }
      }
    }
  },
  {
    id: 'dummy-2',
    name: 'Create User',
    description: 'Create a new user account',
    method: 'POST',
    endpoint: '/api/users',
    category: 'users',
    iconName: 'User',
    isDummy: true,
    schema: {
      requestBody: { username: "newuser", email: "new@example.com", password: "securepassword123" },
      responsePreview: {
        "201": { status: 201, data: { id: "uuid-5678", username: "newuser", email: "new@example.com", created_at: "2025-05-13T14:05:00.000Z" } }
      }
    }
  },
  {
    id: 'dummy-3',
    name: 'List Products',
    description: 'Get all available products',
    method: 'GET',
    endpoint: '/api/products',
    category: 'products',
    iconName: 'Package',
    isDummy: true,
    schema: {
      responsePreview: {
        "200": { status: 200, data: [ { id: "prod-001", name: "Laptop Pro", price: 1200.00 }, { id: "prod-002", name: "Wireless Mouse", price: 25.00 } ] }
      }
    }
  },
];

function Home() {
  const [apiDefs, setApiDefs] = useState<ApiDefinition[]>([]);
  const [isLoadingApis, setIsLoadingApis] = useState<boolean>(true);
  const [errorLoadingApis, setErrorLoadingApis] = useState<string | null>(null);
  const [selectedApiForConfig, setSelectedApiForConfig] = useState<ApiDefinition | CanvasApiNodeData | null>(null);

  // Define a type for the data property of our API nodes
  interface ApiNodeDataType {
    label: string;
    apiDefinition: ApiDefinition;
  }
  const [nodes, setNodes, onNodesChange] = useNodesState<ApiNodeDataType>([]); // Use the new type
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  const [savedWorkflows, setSavedWorkflows] = useState<WorkflowListItem[]>([]);
  const [isLoadingSavedWorkflows, setIsLoadingSavedWorkflows] = useState<boolean>(false);

  const nodeIdCounter = useRef(0);
  const getNewNodeId = () => `dndnode_${nodeIdCounter.current++}`;
  
  const reactFlowInstance = useReactFlow();

  const fetchApiDefinitions = async () => {
    setIsLoadingApis(true);
    setErrorLoadingApis(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/definitions`);
      if (!response.ok) throw new Error(`Failed to fetch API definitions: ${response.statusText}`);
      const data = await response.json();
      setApiDefs(data);
    } catch (error: any) {
      console.error("Error fetching API definitions:", error);
      setErrorLoadingApis(error.message);
    } finally {
      setIsLoadingApis(false);
    }
  };

  const fetchSavedWorkflows = async () => {
    setIsLoadingSavedWorkflows(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/workflows`);
      if (!response.ok) throw new Error(`Failed to fetch saved workflows: ${response.statusText}`);
      const data = await response.json();
      setSavedWorkflows(data);
    } catch (error: any) {
      console.error("Error fetching saved workflows:", error);
    } finally {
      setIsLoadingSavedWorkflows(false);
    }
  };

  useEffect(() => {
    fetchApiDefinitions();
    fetchSavedWorkflows();
  }, []);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) return;
      try {
        const apiData: ApiDefinition = JSON.parse(type);
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });
        const newNode: FlowNode<CanvasApiNodeData> = { // Use FlowNode and specify data type
          id: getNewNodeId(), type: 'apiNode', position,
          data: { label: `${apiData.method} ${apiData.name}`, apiDefinition: apiData } as any, // Cast data for now
        };
        setNodes((nds) => nds.concat(newNode as any)); // Cast node for now
      } catch (error) { console.error("Failed to parse dropped JSON or create node:", error); }
    },
    [reactFlowInstance, setNodes]
  );
  
  const handleNodeSelectedForConfig = useCallback((nodeData: CanvasApiNodeData | null) => {
    console.log("Node selected on canvas, data received in page.tsx:", nodeData); // Debug log
    setSelectedApiForConfig(nodeData);
  }, []);

  const handleSaveWorkflow = async () => {
    const workflowName = prompt("Enter workflow name:");
    if (!workflowName) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/workflows`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: workflowName, nodes: nodes, edges: edges }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Failed to save workflow: ${response.statusText}`);
      }
      alert('Workflow saved successfully!');
      fetchSavedWorkflows();
    } catch (error: any) {
      console.error("Error saving workflow:", error);
      alert(`Error saving workflow: ${error.message}`);
    }
  };

  const handleLoadWorkflow = async (workflowId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/workflows/${workflowId}`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Failed to load workflow: ${response.statusText}`);
      }
      const workflowData: FullWorkflow = await response.json();
      setNodes(workflowData.nodes || []);
      setEdges(workflowData.edges || []);
      alert(`Workflow "${workflowData.name}" loaded successfully!`);
    } catch (error: any) {
      console.error("Error loading workflow:", error);
      alert(`Error loading workflow: ${error.message}`);
    }
  };

  const handleExportWorkflow = () => {
    if (nodes.length === 0) {
      alert("Canvas is empty. Add some API nodes to export.");
      return;
    }
    // Basic export: just the apiDefinition from each node
    // More advanced: determine order from edges
    const exportedApiDefinitions = nodes.map(node => node.data.apiDefinition); // This should now work correctly
    
    const jsonString = JSON.stringify(exportedApiDefinitions, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "workflow.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    alert("Workflow exported as workflow.json");
  };

  return (
    <main className="flex h-screen flex-col bg-gray-900 text-white">
      <header className="bg-gray-800 p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-semibold">API Workflow Builder</h1>
        <div className="flex space-x-2">
          <button onClick={handleSaveWorkflow} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md">
            Save Workflow
          </button>
          <button onClick={handleExportWorkflow} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md">
            Export Workflow
          </button>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-1/4 bg-gray-800 p-4 overflow-y-auto space-y-6">
          <div>
            <h2 className="text-lg font-medium mb-2">Import APIs</h2>
            <ApiImportForm onImportSuccess={fetchApiDefinitions} />
          </div>
          <div>
            <h2 className="text-lg font-medium mb-2">Available APIs</h2>
            {isLoadingApis && <p className="text-gray-400">Loading APIs...</p>}
            {errorLoadingApis && <p className="text-red-400">Error: {errorLoadingApis}</p>}
            {!isLoadingApis && !errorLoadingApis && apiDefs.length === 0 && SAMPLE_APIS.length === 0 && (
              <p className="text-gray-400">No APIs available.</p>
            )}
            <div className="space-y-2">
              {apiDefs.map((api) => (
                <div key={api.id} className="p-3 bg-gray-700 rounded-md hover:bg-gray-600 cursor-pointer"
                  onClick={() => setSelectedApiForConfig(api)} draggable={true}
                  onDragStart={(event) => { event.dataTransfer.setData('application/reactflow', JSON.stringify(api)); event.dataTransfer.effectAllowed = 'move'; }}>
                  <h4 className="font-semibold text-sm">{api.name}</h4>
                  <p className="text-xs text-gray-300">
                    <span className={`font-bold ${ api.method === 'GET' ? 'text-green-400' : api.method === 'POST' ? 'text-blue-400' : api.method === 'PUT' ? 'text-yellow-400' : api.method === 'DELETE' ? 'text-red-400' : 'text-gray-400'}`}>{api.method}</span> {api.endpoint}
                  </p>
                  {api.description && <p className="text-xs text-gray-400 mt-1">{api.description}</p>}
                </div>
              ))}
              {SAMPLE_APIS.length > 0 && apiDefs.length > 0 && <hr className="my-4 border-gray-600" />}
              {SAMPLE_APIS.length > 0 && <h3 className="text-sm font-semibold text-gray-400 mt-2 mb-1">Test Data:</h3>}
              {SAMPLE_APIS.map((api) => (
                <div key={api.id} className="p-3 bg-gray-650 rounded-md hover:bg-gray-600 cursor-pointer border border-dashed border-gray-500"
                  onClick={() => setSelectedApiForConfig(api)} draggable={true}
                  onDragStart={(event) => { event.dataTransfer.setData('application/reactflow', JSON.stringify(api)); event.dataTransfer.effectAllowed = 'move'; }}>
                  <h4 className="font-semibold text-sm">{api.name} <span className="text-xs text-yellow-400">(Test)</span></h4>
                  <p className="text-xs text-gray-300">
                    <span className={`font-bold ${ api.method === 'GET' ? 'text-green-400' : api.method === 'POST' ? 'text-blue-400' : api.method === 'PUT' ? 'text-yellow-400' : api.method === 'DELETE' ? 'text-red-400' : 'text-gray-400'}`}>{api.method}</span> {api.endpoint}
                  </p>
                  {api.description && <p className="text-xs text-gray-400 mt-1">{api.description}</p>}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6">
            <h2 className="text-lg font-medium mb-2">Saved Workflows</h2>
            {isLoadingSavedWorkflows && <p className="text-gray-400">Loading saved workflows...</p>}
            {!isLoadingSavedWorkflows && savedWorkflows.length === 0 && <p className="text-gray-400">No workflows saved yet.</p>}
            <div className="space-y-2">
              {savedWorkflows.map(wf => (
                <div key={wf.id} className="p-3 bg-gray-700 rounded-md hover:bg-gray-600 cursor-pointer"
                  onClick={() => handleLoadWorkflow(wf.id)}>
                  <h4 className="font-semibold text-sm">{wf.name}</h4>
                  {wf.description && <p className="text-xs text-gray-400 mt-1">{wf.description}</p>}
                  <p className="text-xs text-gray-500 mt-1">Saved: {new Date(wf.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
        <section className="flex-1 bg-gray-700 flex flex-col items-stretch">
          <div className="flex-grow p-1">
            <WorkflowCanvas nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
              onConnect={onConnect} onNodeSelected={handleNodeSelectedForConfig} onDrop={onDrop} onDragOver={onDragOver} />
          </div>
        </section>
        <aside className="w-1/4 bg-gray-800 p-4 overflow-y-auto">
          <h2 className="text-lg font-medium mb-4">Configuration Panel</h2>
          {selectedApiForConfig ? (
            <div className="text-sm">
              <h3 className="font-semibold text-md mb-1">{selectedApiForConfig.name} {selectedApiForConfig.isDummy && <span className="text-xs text-yellow-400">(Test Data)</span>}</h3>
              <p className="text-gray-300"><strong className="text-gray-200">Method:</strong> {selectedApiForConfig.method}</p>
              <p className="text-gray-300"><strong className="text-gray-200">Endpoint:</strong> {selectedApiForConfig.endpoint}</p>
              {selectedApiForConfig.description && <p className="text-gray-300 mt-1"><strong className="text-gray-200">Description:</strong> {selectedApiForConfig.description}</p>}
              {selectedApiForConfig.schema?.pathParams && selectedApiForConfig.schema.pathParams.length > 0 && (
                <div className="mt-3">
                  <h4 className="font-semibold text-gray-200">Path Parameters:</h4>
                  <ul className="list-disc list-inside pl-2 text-gray-300">
                    {selectedApiForConfig.schema.pathParams.map((p: { name: string; type: string; required?: boolean }) => <li key={p.name}>{p.name}: {p.type} {p.required && '(required)'}</li>)}
                  </ul>
                </div>
              )}
              <div className="mt-4">
                <h4 className="font-semibold text-gray-200 mb-1">Request Preview:</h4>
                <pre className="bg-gray-900 p-2 rounded-md text-xs text-gray-300 overflow-x-auto">
                  {`Method: ${selectedApiForConfig.method}\nURL: ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${selectedApiForConfig.endpoint}\nHeaders: {\n  "Content-Type": "application/json",\n  "Authorization": "Bearer \${workflow.auth_token}"\n}`}
                  {selectedApiForConfig.schema?.requestBody && `\nBody:\n${JSON.stringify(selectedApiForConfig.schema.requestBody, null, 2)}`}
                </pre>
              </div>
              {selectedApiForConfig.schema?.responsePreview && selectedApiForConfig.schema.responsePreview["200"] && (
                <div className="mt-3">
                  <h4 className="font-semibold text-gray-200 mb-1">Response Preview (200 OK):</h4>
                  <pre className="bg-gray-900 p-2 rounded-md text-xs text-gray-300 overflow-x-auto">
                    {JSON.stringify(selectedApiForConfig.schema.responsePreview["200"], null, 2)}
                  </pre>
                </div>
              )}
               {selectedApiForConfig.schema?.responsePreview && selectedApiForConfig.schema.responsePreview["201"] && (
                <div className="mt-3">
                  <h4 className="font-semibold text-gray-200 mb-1">Response Preview (201 Created):</h4>
                  <pre className="bg-gray-900 p-2 rounded-md text-xs text-gray-300 overflow-x-auto">
                    {JSON.stringify(selectedApiForConfig.schema.responsePreview["201"], null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-400">Select an API block to configure its properties.</p>
          )}
        </aside>
      </div>
    </main>
  );
}

const HomePageWithProvider = () => (
  <ReactFlowProvider>
    <Home />
  </ReactFlowProvider>
);

export default HomePageWithProvider;
