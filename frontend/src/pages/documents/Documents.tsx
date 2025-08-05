// frontend/src/pages/documents/Documents.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { documentsService } from '../../api/documents';
import { useParams } from 'react-router-dom';
import { FileUpload } from '../../components/ui/FileUpload';
import { useState } from 'react';
import { useToast } from '../../hooks/useToast';

export function Documents() {
  const { agentId } = useParams<{ agentId: string }>();
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<File[]>([]);
  const { showToast } = useToast();

  const { data: documents, isLoading, isError, error } = useQuery({
    queryKey: ['documents', agentId],
    queryFn: () => documentsService.getAgentDocuments(agentId!),
    enabled: !!agentId
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => documentsService.uploadDocument(agentId!, file),
    onSuccess: () => {
      queryClient.invalidateQueries(['documents', agentId]);
      setFiles([]);
      showToast('Document uploaded successfully', 'success');
    },
    onError: (error: Error) => {
      showToast(`Upload failed: ${error.message}`, 'error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (documentId: string) => documentsService.deleteDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['documents', agentId]);
      showToast('Document deleted successfully', 'success');
    },
    onError: (error: Error) => {
      showToast(`Deletion failed: ${error.message}`, 'error');
    }
  });

  const handleUpload = () => {
    if (files.length === 0) {
      showToast('Please select at least one file', 'warning');
      return;
    }
    files.forEach(file => uploadMutation.mutate(file));
  };

  const handleDelete = (documentId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      deleteMutation.mutate(documentId);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) throw error;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
        {agentId && (
          <Button to={`/agents/${agentId}/chat`} variant="outline">
            Chat with Agent
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <FileUpload
          label="Upload Documents"
          accept=".pdf,.doc,.docx,.txt,.md,.csv,.xlsx"
          multiple
          onChange={setFiles}
          value={files}
          helperText="Supported formats: PDF, Word, Text, Markdown, CSV, Excel"
        />
        <Button
          onClick={handleUpload}
          isLoading={uploadMutation.isLoading}
          disabled={files.length === 0}
        >
          Upload Selected Files
        </Button>

        {documents?.length ? (
          <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {documents.map((document) => (
                <li key={document.id} className="px-6 py-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{document.filename}</h3>
                    <p className="text-sm text-gray-500">
                      Uploaded: {new Date(document.uploaded_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => handleDelete(document.id)}
                      isLoading={deleteMutation.isLoading && deleteMutation.variables === document.id}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No documents uploaded yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DocumentsWithBoundary() {
  return (
    <ErrorBoundary>
      <Documents />
    </ErrorBoundary>
  );
}