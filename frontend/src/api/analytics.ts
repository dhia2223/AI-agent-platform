// frontend/src/api/analytics.ts
import apiClient from './axios';

export interface AnalyticsData {
  query_volume: { date: string; count: number }[];
  response_times: { date: string; avg_time: number }[];
  total_queries: number;
  avg_response_time: number;
}

export interface OverviewAnalytics {
  total_agents: number;
  active_agents: number;
  queries_today: number;
}

export const analyticsService = {
  async getAgentAnalytics(agentId: string): Promise<AnalyticsData> {
    try {
      const response = await apiClient.get(`/analytics/${agentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching agent analytics:', error);
      throw error;
    }
  },
  async getOverviewAnalytics(): Promise<OverviewAnalytics> {
    try {
      const response = await apiClient.get('/analytics/overview');
      return response.data;
    } catch (error) {
      console.error('Error fetching overview analytics:', error);
      throw error;
    }
  },
};