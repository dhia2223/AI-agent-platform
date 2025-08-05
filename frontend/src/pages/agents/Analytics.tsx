// frontend/src/pages/agents/Analytics.tsx
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { analyticsService } from '../../api/analytics';
import { LineChart, BarChart } from '../../components/analytics/Charts';

export function Analytics() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics', id],
    queryFn: () => analyticsService.getAgentAnalytics(id!),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) throw error;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Agent Analytics</h2>
      </div>

      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium">Query Volume</h3>
          <LineChart
            data={data?.query_volume || []}
            xField="date"
            yField="count"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium">Popular Documents</h3>
            <BarChart
              data={data?.popular_documents || []}
              xField="document"
              yField="hits"
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium">Response Times</h3>
            <BarChart
              data={data?.response_times || []}
              xField="date"
              yField="avg_time"
            />
          </div>
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