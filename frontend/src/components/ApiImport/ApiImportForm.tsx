"use client";

import React, { useState } from 'react';

interface ApiImportFormProps {
  onImportSuccess: () => void; // Callback to refresh API list
}

const ApiImportForm: React.FC<ApiImportFormProps> = ({ onImportSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
      setMessage('');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setMessage('Please select a JSON file to upload.');
      return;
    }

    setMessage('Uploading...');

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const fileContent = e.target?.result;
        if (typeof fileContent !== 'string') {
          setMessage('Error reading file content.');
          return;
        }
        const jsonData = JSON.parse(fileContent);

        // Assuming the JSON directly contains the fields: name, method, endpoint, description, schema
        // You might need to adjust this based on the actual structure of your API spec JSON
        const { name, method, endpoint, description, schema } = jsonData;

        if (!name || !method || !endpoint || !schema) {
          setMessage('Invalid JSON structure. Required fields: name, method, endpoint, schema.');
          return;
        }
        
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

        const response = await fetch(`${apiUrl}/api/definitions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, method, endpoint, description, schema }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setMessage(`API '${result.name}' imported successfully! ID: ${result.id}`);
        setFile(null);
        if (event.target instanceof HTMLFormElement) {
          event.target.reset(); // Reset the form to clear the file input
        }
        onImportSuccess(); // Call the callback
      } catch (error: any) {
        console.error('Import error:', error);
        setMessage(`Error importing API: ${error.message}`);
      }
    };

    reader.onerror = () => {
      setMessage('Error reading file.');
    };

    reader.readAsText(file);
  };

  return (
    <div className="p-4 bg-gray-750 rounded-lg shadow">
      <h3 className="text-md font-semibold mb-3 text-white">Import API Specification (JSON)</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-300
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-md file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-500 file:text-white
                       hover:file:bg-blue-600"
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md"
        >
          Import API
        </button>
      </form>
      {message && (
        <p className={`mt-3 text-sm ${message.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default ApiImportForm;
