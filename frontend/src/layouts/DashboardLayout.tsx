// src/layouts/DashboardLayout.tsx
import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DashboardSidebar } from '../components/dashboard/Sidebar';
import { DashboardHeader } from '../components/dashboard/Header';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';

export function DashboardLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return <LoadingOverlay />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader user={user} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}