// frontend/src/pages/analytics/AnalyticsDashboard.tsx
import { useQuery } from '@tanstack/react-query';
import { LineChart, BarChart } from '../../components/analytics/Charts';
import { analyticsService } from '../../api/analytics';

export function AnalyticsDashboard({ agentId }: { agentId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics', agentId],
    queryFn: () => analyticsService.getAgentAnalytics(agentId)
  });

  if (isLoading) return <div>Loading analytics...</div>;
  if (error) return <div>Error loading analytics</div>;

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium">Query Volume</h3>
        <LineChart 
          data={data.query_volume} 
          xField="date" 
          yField="count"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium">Popular Documents</h3>
          <BarChart
            data={data.popular_documents}
            xField="document"
            yField="hits"
          />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium">Response Times</h3>
          <BarChart
            data={data.response_times}
            xField="date"
            yField="avg_time"
          />
        </div>
      </div>
    </div>
  );
}