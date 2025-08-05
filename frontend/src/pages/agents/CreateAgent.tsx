// src/pages/agents/CreateAgent.tsx
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { agentsService } from '../../api/agents';
import { documentsService } from '../../api/documents';
import { AgentForm } from '../../components/agents/AgentForm';
import { ErrorBoundary } from '../../components/ErrorBoundary';

export function CreateAgent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createAgentMutation = useMutation({
    mutationFn: agentsService.createAgent,
    onSuccess: (agent) => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      return agent; // Return agent for the next mutation
    },
  });

  const uploadDocumentsMutation = useMutation({
    mutationFn: (data: { agentId: string; files: File[] }) => {
      return Promise.all(
        data.files.map((file) =>
          documentsService.uploadDocument(data.agentId, file)
        )
      );
    },
  });

  const handleSubmit = (data: {
    name: string;
    description: string;
    instructions: string;
    files?: File[];
  }): void => {
    (async () => {
      try {
        // First create the agent
        const agent = await createAgentMutation.mutateAsync({
          name: data.name,
          description: data.description,
          instructions: data.instructions,
        });

        // Then upload documents if any
        const files = data.files ?? [];
        if (files.length > 0) {
          await Promise.all(
            files.map(file => 
              documentsService.uploadDocument(agent.id, file)
                .catch(e => {
                  console.error(`Failed to upload ${file.name}:`, e);
                  throw e; // Re-throw to trigger error state
                })
            )
          );
        }

        navigate(`/dashboard/agents/${agent.id}`, { replace: true });
      } catch (error) {
        console.error('Error creating agent:', error);
        // Error will be automatically handled by the form
      }
    })();
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Agent</h1>
      <AgentForm
        onSubmit={handleSubmit}
        isLoading={createAgentMutation.isPending || uploadDocumentsMutation.isPending}
        error={(createAgentMutation.error ?? uploadDocumentsMutation.error) ?? undefined}
      />
    </div>
  );
}

export default function CreateAgentWithBoundary() {
  return (
    <ErrorBoundary>
      <CreateAgent />
    </ErrorBoundary>
  );
}




