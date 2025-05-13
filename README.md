# API Workflow Builder

A visual integration platform that transforms JSON API specifications into intuitive drag-and-drop workflows. Import API definitions, chain them together in a visual canvas, and export the resulting workflows as unified JSON.
API Workflow Builder: Visual API Integration Platform
App Description
API Workflow Builder is a powerful visual integration platform that transforms complex API interactions into intuitive workflows. The platform bridges the gap between technical API specifications and practical business processes, allowing users to create, test, and monitor API-driven workflows through a streamlined drag-and-drop interface.
Core Features
1. API Discovery & Import

GitHub Repository Scanner: Automatically discovers APIs from GitHub repositories
JSON File Import: Import API specifications directly from JSON files
Visual API Blocks: Converts technical API endpoints into visual, easy-to-understand blocks
Smart Categorization: Automatically organizes APIs by function, method (GET, POST, PUT, DELETE), and domain

2. Visual Workflow Builder

Drag-and-Drop Interface: Intuitively chain API blocks in your desired sequence
Connection Manager: Create logical flows between APIs with automatic data mapping
Configuration Panel: Customize each API block with headers, parameters, and authentication
Real-Time Validation: Instantly verify workflow compatibility and completeness
Error Handling: Define custom error responses and recovery paths

3. Workflow Export & Integration

Unified Export: Package all chained APIs as a single workflow definition
Format Options: Export as JSON, MCP chunks for AI agent consumption, or integration-ready code
Versioning Support: Track changes and maintain multiple versions of your workflows
Security Boundaries: Configure access permissions and security constraints

4. Testing & Analytics

Live Testing: Execute workflows directly within the platform
Request/Response Inspector: Examine exactly what's sent and received
Performance Metrics: Monitor success rates, response times, and throughput
Activity Logs: Track execution history and identify bottlenecks

User Experience
The platform features a clean, intuitive interface divided into three main sections:

API Explorer (Left Panel): Browse available APIs, search by function, and drag endpoints to your workflow canvas.
Workflow Builder (Center Canvas): Visually arrange and connect API blocks, with real-time feedback on workflow validity.
Configuration Panel (Right Panel): Configure selected API blocks with detailed options for request structure, parameter mapping, authentication, and error handling.

## 🚀 Features

- **API Import**
  - Upload JSON API specifications
  - Convert technical APIs into visual blocks
  - Organize by HTTP method, endpoint, and domain

- **Visual Workflow Builder**
  - Intuitive drag-and-drop interface
  - Connect API blocks with visual flow lines
  - Configure request parameters, headers, and authentication
  - Real-time validation of workflow compatibility

- **Workflow Export**
  - Export entire workflows as single JSON files
  - Save workflows to your database
  - Share workflows with team members

- **Agent Integration**
  - Connect with Python agent microservices
  - Execute workflow steps via agent REST endpoints
  - Transform data between workflow steps

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │     │   Backend       │     │   Database      │
│   (Next.js)     │◄───►│   (Express)     │◄───►│   (Supabase)    │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                        ┌────────▼────────┐
                        │  Python Agent   │
                        │  Microservices  │
                        └─────────────────┘
```

## 🛠️ Tech Stack

- **Frontend**
  - Next.js 15 (App Router)
  - React 19
  - Tailwind CSS
  - ReactFlow (workflow canvas)
  - Shadcn/ui components

- **Backend**
  - Express.js
  - Node.js
  - REST API architecture

- **Database**
  - Supabase (PostgreSQL)
  - JSONB for storing API definitions and workflows

- **Agent Integration**
  - Python microservices
  - REST API communication

## 📁 Project Structure

```
api-workflow-builder/
├── frontend/                  # Next.js frontend application
│   ├── components/            # React components
│   │   ├── ApiImport/         # API import components
│   │   ├── WorkflowBuilder/   # Workflow canvas components
│   │   └── ExportModule/      # Export functionality components
│   ├── pages/                 # Next.js pages
│   ├── services/              # API services
│   └── public/                # Static assets
│
├── backend/                   # Express.js backend
│   ├── src/
│   │   ├── routes/            # API route definitions
│   │   ├── controllers/       # Business logic
│   │   ├── services/          # External service connections
│   │   └── index.js           # Main server file
│   ├── package.json
│   └── .env                   # Environment variables
│
└── agents/                    # Python agent microservices (optional)
    ├── requirements.txt
    └── main.py                # Agent implementation
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (for frontend and backend)
- Python 3.9+ (for agents, optional)
- Supabase account

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   
### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```
   PORT=5000
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your-service-key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Database Setup

1. Create a new project in Supabase
2. Create the following tables:

   **API Definitions Table**:
   ```sql
   create table api_definitions (
     id uuid primary key default gen_random_uuid(),
     name text not null,
     method text not null,
     endpoint text not null,
     description text,
     schema jsonb not null,
     created_at timestamp with time zone default now()
   );
   ```

   **Workflows Table**:
   ```sql
   create table workflows (
     id uuid primary key default gen_random_uuid(),
     name text not null,
     description text,
     nodes jsonb not null,
     edges jsonb not null, 
     created_at timestamp with time zone default now()
   );
   ```


1. **Import API Definitions**:
   - Upload JSON API specifications through the import panel
   - APIs are processed and stored in the Supabase database
   - Visual blocks are created for each API endpoint

2. **Build Workflows**:
   - Drag API blocks from the panel to the canvas
   - Connect blocks to create a logical flow
   - Configure each block with required parameters
   - Save the workflow to the database

3. **Export Workflows**:
   - Export the entire workflow as a single JSON file
   - Use the exported file in other applications or agents

## 📚 API Endpoints

### API Definitions
- `GET /api/definitions` - List all API definitions
- `POST /api/definitions` - Import a new API definition
- `GET /api/definitions/:id` - Get a specific API definition
- `DELETE /api/definitions/:id` - Delete an API definition

### Workflows
- `GET /api/workflows` - List all workflows
- `POST /api/workflows` - Create a new workflow
- `GET /api/workflows/:id` - Get a specific workflow
- `PUT /api/workflows/:id` - Update a workflow
- `DELETE /api/workflows/:id` - Delete a workflow

### Agent Integration
- `POST /api/agent/execute` - Execute a workflow step via agent

## 🚀 Deployment

### Frontend
Deploy the Next.js frontend to Vercel:
1. Connect your GitHub repository
2. Add environment variables
3. Deploy

### Backend
Deploy the Express backend to a service like Railway, Fly.io, or Heroku:
1. Set up the deployment platform
2. Configure environment variables
3. Deploy from your repository

### Database
Your Supabase project is already deployed in the cloud.

## 🔒 Security Considerations

- Use Supabase Row Level Security (RLS) for database access
- Implement proper authentication for API access
- Validate all inputs on both client and server
- Use environment variables for sensitive information

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.