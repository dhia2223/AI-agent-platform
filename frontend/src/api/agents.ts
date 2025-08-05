// src/api/agents.ts
import apiClient from './axios';
import type { Agent } from '../types/agent';

export const agentsService = {
  getAgents(): Promise<Agent[]> {
    return apiClient.get('/agents').then((res) => res.data);
  },
  getAgent(id: string): Promise<Agent> {
    return apiClient.get(`/agents/${id}`).then((res) => res.data);
  },
  createAgent(data: {
    name: string;
    description: string;
    instructions: string;
  }): Promise<Agent> {
    return apiClient.post('/agents', data).then((res) => res.data);
  },
  updateAgent(
    id: string,
    data: {
      name: string;
      description: string;
      instructions: string;
    }
  ): Promise<Agent> {
    return apiClient.put(`/agents/${id}`, data).then((res) => res.data);
  },
  deleteAgent(id: string): Promise<void> {
    return apiClient.delete(`/agents/${id}`);
  },
};