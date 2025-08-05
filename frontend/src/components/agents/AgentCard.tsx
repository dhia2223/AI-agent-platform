// src/components/agents/AgentCard.tsx
import { Link } from 'react-router-dom';
import { EllipsisVerticalIcon } from '@heroicons/react/24/solid';
import { Dropdown } from '../ui/Dropdown';
import { DropdownItem } from '../ui/DropdownItem';

interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    created_at: string;
  };
  onDelete?: (id: string) => void;
}

export function AgentCard({ agent, onDelete }: AgentCardProps) {
  const handleDelete = () => {
    if (onDelete) {
      onDelete(agent.id);
    }
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg transition-all hover:shadow-md">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {agent.name}
          </h3>
          <Dropdown
            trigger={<EllipsisVerticalIcon className="h-5 w-5" />}
            align="right"
          >
            <DropdownItem as="link" to={`/dashboard/agents/${agent.id}`}>
              Edit Agent
            </DropdownItem>
            <DropdownItem
              className="text-red-600 hover:bg-red-50"
              onClick={handleDelete}
            >
              Delete Agent
            </DropdownItem>
            <DropdownItem as="link" to={`/dashboard/agents/${agent.id}/analytics`}>
              View Analytics
            </DropdownItem>
          </Dropdown>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            Created: {new Date(agent.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="mt-6">
          <Link
            to={`/dashboard/agents/${agent.id}/chat`}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            aria-label={`Chat with ${agent.name}`}
          >
            Chat with Agent
          </Link>
          <Link 
            to={`/dashboard/agents/${agent.id}`}
            className="text-lg font-medium text-gray-900 hover:text-indigo-600"
          >
            About {agent.name}
          </Link>
        </div>
      </div>
    </div>
  );
}