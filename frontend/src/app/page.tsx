"use client"; // Required for useState and useEffect

import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import Image from 'next/image';
import ApiImportForm from '@/components/ApiImport/ApiImportForm';
import WorkflowCanvas from '@/components/WorkflowBuilder/WorkflowCanvas'; // Import the canvas

// Define a type for the API definition structure
interface ApiDefinition {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD'; // More specific methods
  endpoint: string; // Corresponds to 'path' in your example
  description?: string;
  category?: string; // Optional
  iconName?: string; // Optional, for potential future icon display
  isDummy?: boolean; // To distinguish test data
  schema?: { // For request/response previews and configuration
    pathParams?: Array<{ name: string; type: string; description?: string; required?: boolean }>;
    queryParams?: Array<{ name: string; type: string; description?: string; required?: boolean }>;
    requestBody?: any; // Example or JSON schema for request body
    responsePreview?: { // Example responses
      [statusCode: string]: any;
    };
  };
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
        "200": {
          status: 200,
          data: {
            id: "uuid-1234",
            name: "John Doe",
            email: "john@example.com",
            role: "user",
            created_at: "2025-05-13T14:01:03.917Z"
          }
        }
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
      requestBody: {
        username: "newuser",
        email: "new@example.com",
        password: "securepassword123"
      },
      responsePreview: {
        "201": {
          status: 201,
          data: {
            id: "uuid-5678",
            username: "newuser",
            email: "new@example.com",
            created_at: "2025-05-13T14:05:00.000Z"
          }
        }
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
        "200": {
          status: 200,
          data: [
            { id: "prod-001", name: "Laptop Pro", price: 1200.00 },
            { id: "prod-002", name: "Wireless Mouse", price: 25.00 }
          ]
        }
      }
    }
  },
];


export default function Home() {
  const [apiDefs, setApiDefs] = useState<ApiDefinition[]>([]); // For APIs from backend
  const [isLoadingApis, setIsLoadingApis] = useState<boolean>(true);
  const [errorLoadingApis, setErrorLoadingApis] = useState<string | null>(null);
  const [selectedApi, setSelectedApi] = useState<ApiDefinition | null>(null); // For configuration panel

  const fetchApiDefinitions = async () => {
    setIsLoadingApis(true);
    setErrorLoadingApis(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/definitions`);
      if (!response.ok) {
        throw new Error(`Failed to fetch API definitions: ${response.statusText}`);
      }
      const data = await response.json();
      setApiDefs(data);
    } catch (error: any) {
      console.error("Error fetching API definitions:", error);
      setErrorLoadingApis(error.message);
    } finally {
      setIsLoadingApis(false);
    }
  };

  useEffect(() => {
    fetchApiDefinitions();
  }, []); // Fetch on initial component mount

  return (
    <main className="flex h-screen flex-col bg-gray-900 text-white">
      <header className="bg-gray-800 p-4 shadow-md">
        <h1 className="text-xl font-semibold">API Workflow Builder</h1>
      </header>
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: API Explorer */}
        <aside className="w-1/4 bg-gray-800 p-4 overflow-y-auto space-y-6">
          <div>
            <h2 className="text-lg font-medium mb-2">Import APIs</h2>
            <ApiImportForm onImportSuccess={fetchApiDefinitions} /> {/* Pass the callback */}
          </div>
          <div>
            <h2 className="text-lg font-medium mb-2">Available APIs</h2>
            {isLoadingApis && <p className="text-gray-400">Loading APIs...</p>}
            {errorLoadingApis && <p className="text-red-400">Error: {errorLoadingApis}</p>}
            {!isLoadingApis && !errorLoadingApis && apiDefs.length === 0 && (
              <p className="text-gray-400">No APIs imported yet.</p>
            )}
            <div className="space-y-2">
              {/* Display Real APIs */}
              {apiDefs.map((api) => (
                <div 
                  key={api.id} 
                  className="p-3 bg-gray-700 rounded-md hover:bg-gray-600 cursor-pointer"
                  onClick={() => setSelectedApi(api)}
                >
                  <h4 className="font-semibold text-sm">{api.name}</h4>
                  <p className="text-xs text-gray-300">
                    <span className={`font-bold ${
                      api.method === 'GET' ? 'text-green-400' :
                      api.method === 'POST' ? 'text-blue-400' :
                      api.method === 'PUT' ? 'text-yellow-400' :
                      api.method === 'DELETE' ? 'text-red-400' : 'text-gray-400'
                    }`}>{api.method}</span> {api.endpoint}
                  </p>
                  {api.description && <p className="text-xs text-gray-400 mt-1">{api.description}</p>}
                </div>
              ))}
              {/* Separator or Title for Dummy APIs */}
              {SAMPLE_APIS.length > 0 && apiDefs.length > 0 && <hr className="my-4 border-gray-600" />}
              {SAMPLE_APIS.length > 0 && <h3 className="text-sm font-semibold text-gray-400 mt-2 mb-1">Test Data:</h3>}
              {/* Display Dummy APIs */}
              {SAMPLE_APIS.map((api) => (
                <div 
                  key={api.id} 
                  className="p-3 bg-gray-650 rounded-md hover:bg-gray-600 cursor-pointer border border-dashed border-gray-500" // Visual distinction
                  onClick={() => setSelectedApi(api)}
                >
                  <h4 className="font-semibold text-sm">{api.name} <span className="text-xs text-yellow-400">(Test)</span></h4>
                  <p className="text-xs text-gray-300">
                    <span className={`font-bold ${
                      api.method === 'GET' ? 'text-green-400' :
                      api.method === 'POST' ? 'text-blue-400' :
                      api.method === 'PUT' ? 'text-yellow-400' :
                      api.method === 'DELETE' ? 'text-red-400' : 'text-gray-400'
                    }`}>{api.method}</span> {api.endpoint}
                  </p>
                  {api.description && <p className="text-xs text-gray-400 mt-1">{api.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Center Panel: Workflow Builder */}
        <section className="flex-1 bg-gray-700 flex flex-col items-stretch">
          <div className="flex-grow p-1">
            <WorkflowCanvas />
          </div>
        </section>

        {/* Right Panel: Configuration Panel */}
        <aside className="w-1/4 bg-gray-800 p-4 overflow-y-auto">
          <h2 className="text-lg font-medium mb-4">Configuration Panel</h2>
          {selectedApi ? (
            <div className="text-sm">
              <h3 className="font-semibold text-md mb-1">{selectedApi.name} {selectedApi.isDummy && <span className="text-xs text-yellow-400">(Test Data)</span>}</h3>
              <p className="text-gray-300"><strong className="text-gray-200">Method:</strong> {selectedApi.method}</p>
              <p className="text-gray-300"><strong className="text-gray-200">Endpoint:</strong> {selectedApi.endpoint}</p>
              {selectedApi.description && <p className="text-gray-300 mt-1"><strong className="text-gray-200">Description:</strong> {selectedApi.description}</p>}
              
              {selectedApi.schema?.pathParams && selectedApi.schema.pathParams.length > 0 && (
                <div className="mt-3">
                  <h4 className="font-semibold text-gray-200">Path Parameters:</h4>
                  <ul className="list-disc list-inside pl-2 text-gray-300">
                    {selectedApi.schema.pathParams.map(p => <li key={p.name}>{p.name}: {p.type} {p.required && '(required)'}</li>)}
                  </ul>
                </div>
              )}

              {/* Request Preview */}
              <div className="mt-4">
                <h4 className="font-semibold text-gray-200 mb-1">Request Preview:</h4>
                <pre className="bg-gray-900 p-2 rounded-md text-xs text-gray-300 overflow-x-auto">
                  {`Method: ${selectedApi.method}\nURL: ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${selectedApi.endpoint}\nHeaders: {\n  "Content-Type": "application/json",\n  "Authorization": "Bearer \${workflow.auth_token}"\n}`}
                  {selectedApi.schema?.requestBody && `\nBody:\n${JSON.stringify(selectedApi.schema.requestBody, null, 2)}`}
                </pre>
              </div>

              {/* Response Preview */}
              {selectedApi.schema?.responsePreview && selectedApi.schema.responsePreview["200"] && (
                <div className="mt-3">
                  <h4 className="font-semibold text-gray-200 mb-1">Response Preview (200 OK):</h4>
                  <pre className="bg-gray-900 p-2 rounded-md text-xs text-gray-300 overflow-x-auto">
                    {JSON.stringify(selectedApi.schema.responsePreview["200"], null, 2)}
                  </pre>
                </div>
              )}
               {selectedApi.schema?.responsePreview && selectedApi.schema.responsePreview["201"] && (
                <div className="mt-3">
                  <h4 className="font-semibold text-gray-200 mb-1">Response Preview (201 Created):</h4>
                  <pre className="bg-gray-900 p-2 rounded-md text-xs text-gray-300 overflow-x-auto">
                    {JSON.stringify(selectedApi.schema.responsePreview["201"], null, 2)}
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
