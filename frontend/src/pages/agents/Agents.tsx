// src/pages/agents/Agents.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { AgentCard } from '../../components/agents/AgentCard';
import { agentsService } from '../../api/agents';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorBoundary } from '../../components/ErrorBoundary';

export function Agents() {
  const queryClient = useQueryClient();
  const { data: agents, isLoading, isError, error } = useQuery({
    queryKey: ['agents'],
    queryFn: agentsService.getAgents,
  });

  const deleteMutation = useMutation({
    mutationFn: agentsService.deleteAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this agent?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    throw error;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Agents</h2>
        <Button to="/dashboard/agents/new">Create Agent</Button>
      </div>

      {agents?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">You haven't created any agents yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {agents?.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AgentsWithBoundary() {
  return (
    <ErrorBoundary>
      <Agents />
    </ErrorBoundary>
  );
}