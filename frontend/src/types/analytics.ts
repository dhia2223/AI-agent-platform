// frontend/src/types/analytics.ts
export interface AnalyticsData {
  query_volume: {
    date: string;
    count: number;
  }[];
  popular_documents: {
    document: string;
    hits: number;
  }[];
  response_times: {
    date: string;
    avg_time: number;
  }[];
  total_queries: number;
  avg_response_time: number;
}

export interface OverviewAnalytics {
  total_agents: number;
  active_agents: number;
  queries_today: number;
}