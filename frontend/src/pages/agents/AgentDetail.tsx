// src/pages/agents/AgentDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentsService } from '../../api/agents';
import { documentsService } from '../../api/documents';
import { AgentForm } from '../../components/agents/AgentForm';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { Button } from '../../components/ui/Button';
import { useState } from 'react';

export function AgentDetail() {
  const { id } = useParams<{ id: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: agent, isLoading, error } = useQuery({
    queryKey: ['agent', id],
    queryFn: () => agentsService.getAgent(id!),
  });

  const { data: documents } = useQuery({
    queryKey: ['documents', id],
    queryFn: () => documentsService.getAgentDocuments(id!),
  });

  const updateAgentMutation = useMutation({
    mutationFn: (data: { name: string; description: string; instructions: string }) =>
      agentsService.updateAgent(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', id] });
      setIsEditing(false);
    },
  });

  const deleteAgentMutation = useMutation({
    mutationFn: () => agentsService.deleteAgent(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      navigate('/dashboard/agents');
    },
  });

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this agent?')) {
      deleteAgentMutation.mutate();
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading agent details...</div>;
  }

  if (error) {
    return <div className="text-center py-12">Error loading agent: {error.message}</div>;
  }

  if (!agent) {
    return <div className="text-center py-12">Agent not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      {isEditing ? (
        <>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Agent</h1>
          <AgentForm
            initialData={{
              name: agent.name,
              description: agent.description || '',
              instructions: agent.instructions || '',
            }}
            onSubmit={(data) => updateAgentMutation.mutate(data)}
            isLoading={updateAgentMutation.isPending}
            error={updateAgentMutation.error ?? undefined}
          />
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Agent Details</h1>
            <div className="flex space-x-2">
              <Button onClick={() => setIsEditing(true)} variant="outline">
                Edit
              </Button>
              <Button
                onClick={handleDelete}
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
                isLoading={deleteAgentMutation.isPending}
              >
                Delete
              </Button>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold">{agent.name}</h2>
            </div>
            <div>
              
              <h3 className="font-medium text-gray-900">Description</h3>
              {agent.description && (
                <p className="text-gray-600 mt-2">{agent.description}</p>
              )}
            </div>

            <div>
              <h3 className="font-medium text-gray-900">Instructions</h3>
              <p className="mt-2 text-gray-600 whitespace-pre-wrap">
                {agent.instructions}
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">Knowledge Sources</h3>
              {documents?.length ? (
                <ul className="mt-2 space-y-2">
                  {documents.map((doc) => (
                    <li key={doc.id} className="flex justify-between items-center">
                      <span className="text-gray-600">{doc.filename}</span>
                      <button
                        onClick={() => documentsService.deleteDocument(doc.id)}
                        className="text-sm text-red-600 hover:text-red-500"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-gray-500">No documents uploaded</p>
              )}
            </div>

            <div className="pt-4">
              <Button
                to={`/dashboard/agents/${agent.id}/chat`}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Chat with Agent
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function AgentDetailWithBoundary() {
  return (
    <ErrorBoundary>
      <AgentDetail />
    </ErrorBoundary>
  );
}