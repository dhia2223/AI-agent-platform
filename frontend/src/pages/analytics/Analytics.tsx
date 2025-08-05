// frontend/src/pages/analytics/Analytics.tsx
import { useQuery } from '@tanstack/react-query';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { analyticsService } from '../../api/analytics';
import { useToast } from '../../hooks/useToast';

export function Analytics() {
  const { showToast } = useToast();
  
  const { 
    data: overview, 
    isLoading, 
    isError,
    error
  } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => analyticsService.getOverviewAnalytics(),
    onError: (err) => {
      showToast('Failed to load analytics data', 'error');
      console.error('Analytics error:', err);
    }
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <div className="p-4 text-red-500">
        Error loading analytics: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Agents</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {overview?.total_agents || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Active Agents</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {overview?.active_agents || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Queries Today</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {overview?.queries_today || 0}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsWithBoundary() {
  return (
    <ErrorBoundary>
      <Analytics />
    </ErrorBoundary>
  );
}