// frontend/src/types/agent.ts
export interface Agent {
    id: string;
    name: string;
    description: string;
    instructions: string;
    created_at: string;
    updated_at: string;
}

export interface AgentCreate {
    name: string;
    description: string;
    instructions: string;
    files?: File[];
}

export interface Document {
  id: string;
  filename: string;
  content_type: string;
  uploaded_at: string;
}