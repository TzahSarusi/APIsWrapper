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
              {apiDefs.map((api) => (
                <div key={api.id} className="p-3 bg-gray-700 rounded-md hover:bg-gray-600 cursor-pointer">
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
            </div>
          </div>
        </aside>

        {/* Center Panel: Workflow Builder */}
        <section className="flex-1 bg-gray-700 flex flex-col items-stretch"> {/* Changed to items-stretch */}
          {/* <h2 className="text-lg font-medium p-4 pb-0">Workflow Builder Canvas</h2> */} {/* Optional: Title can be part of the canvas or removed for more space */}
          <div className="flex-grow p-1"> {/* Added padding around canvas container */}
            <WorkflowCanvas />
          </div>
        </section>

        {/* Right Panel: Configuration Panel */}
        <aside className="w-1/4 bg-gray-800 p-4 overflow-y-auto">
          <h2 className="text-lg font-medium mb-4">Configuration Panel</h2>
          <div className="text-gray-400">
            Select an API block to configure its properties.
          </div>
        </aside>
      </div>
    </main>
  );
}
