// src/components/dashboard/Header.tsx
import { useAuth } from '../../contexts/AuthContext';
import { UserMenu } from './UserMenu';

interface DashboardHeaderProps {
  user: {
    email: string;
    is_admin?: boolean;
  };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const { logout } = useAuth();

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">AI Agent Platform</h1>
        </div>
        <div className="flex items-center space-x-4">
          {user.is_admin && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              Admin
            </span>
          )}
          <UserMenu user={user} onLogout={logout} />
        </div>
      </div>
    </header>
  );
}