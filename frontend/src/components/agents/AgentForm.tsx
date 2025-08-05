// src/components/agents/AgentForm.tsx
import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { FileUpload } from '../ui/FileUpload';

interface AgentFormProps {
  onSubmit: (data: {
    name: string;
    description: string;
    instructions: string;
    files?: File[];
  }) => void;
  isLoading?: boolean;
  error?: Error;
  initialData?: {
    name?: string;
    description?: string;
    instructions?: string;
  };
}

const DEFAULT_DESCRIPTION = "A specialized AI assistant focused exclusively on analyzing and answering questions about the provided documents.";
const DEFAULT_INSTRUCTIONS = `You are a highly focused AI assistant that strictly answers questions based on the provided documents.

Key Rules:
1. Only respond to questions that can be answered using the uploaded documents
2. For unrelated questions, respond with: "I can only answer questions about [Agent Name]'s documentation"
3. Never speculate, make up answers, or provide information beyond the document content
4. When possible, reference which document section the information came from
5. Keep answers concise and factual

Example Responses:
- "According to the user manual (page 12), the setup process requires..."
- "I can only answer questions about [Agent Name]'s documentation"
- "The policy document states that..."`;

export function AgentForm({
  onSubmit,
  isLoading = false,
  error,
  initialData = {},
}: AgentFormProps) {
  const [name, setName] = useState(initialData.name || '');
  const [description, setDescription] = useState(
    initialData.description || DEFAULT_DESCRIPTION
  );
  const [instructions, setInstructions] = useState(
    initialData.instructions || DEFAULT_INSTRUCTIONS
  );
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, description, instructions, files });
  };

  const handleFileChange = (newFiles: File[]) => {
    setFiles(newFiles);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-4">
          <div className="text-sm text-red-700">{error.message}</div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <Input
          label="Agent Name"
          id="agent-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Product Documentation Assistant"
          helperText="Give your agent a clear, descriptive name"
        />

        <Textarea
          label="Description"
          id="agent-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your agent's purpose and focus"
          rows={3}
          helperText="This helps users understand what the agent can help with"
        />

        <Textarea
          label="Behavior Instructions"
          id="agent-instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Define how your agent should behave"
          rows={8}
          helperText={
            "Key guidelines: Include rules for unrelated questions, specify response style, and define how to reference document sources."
          }
        />

        {!initialData.name && (
          <FileUpload
            label="Knowledge Sources (Required for full functionality)"
            accept=".pdf,.txt,.doc,.docx,.md,.csv,.xlsx"
            multiple
            onChange={handleFileChange}
            value={files}
            helperText="Upload all relevant documents the agent should reference"
          />
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData.name ? 'Update Agent' : 'Create Agent'}
        </Button>
      </div>
    </form>
  );
}



