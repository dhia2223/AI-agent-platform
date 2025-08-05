// src/api/documents.ts
import apiClient from './axios';

export const documentsService = {
  getAgentDocuments(agentId: string) {
    return apiClient
      .get('/documents/agent', { params: { agent_id: agentId } })
      .then((res) => res.data);
  },
  uploadDocument(agentId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('agent_id', agentId);

    return apiClient.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteDocument(documentId: string) {
    return apiClient.delete(`/documents/${documentId}`);
  },
};



