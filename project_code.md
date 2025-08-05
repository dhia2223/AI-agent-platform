# 🗂️ Frontend (React - frontend/src)



## 📄 frontend\src\App.css

```css
#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.react:hover {
  filter: drop-shadow(0 0 2em #61dafbaa);
}

@keyframes logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: no-preference) {
  a:nth-of-type(2) .logo {
    animation: logo-spin infinite 20s linear;
  }
}

.card {
  padding: 2em;
}

.read-the-docs {
  color: #888;
}
```

---



## 📄 frontend\src\App.tsx

```tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Agents } from './pages/agents/Agents';
import { CreateAgent } from './pages/agents/CreateAgent';
import { PrivateRoute } from './components/PrivateRoute';
import { AgentDetail } from './pages/agents/AgentDetail';
import { Analytics } from './pages/analytics/Analytics';
import { Analytics as AgentAnalytics } from './pages/agents/Analytics';
import { ChatInterface } from './pages/agents/ChatInterface';
import { ToastContainer } from './components/ui/ToastContainer';
import { useToast } from './hooks/useToast';
import { Documents } from './pages/documents/Documents';
import { Settings } from './pages/settings/Settings';
import { LandingPage } from './pages/LandingPage';

function App() {
  const { toasts, dismissToast } = useToast();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes - using a different path */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard/agents" replace />} />
              <Route path="agents" element={<Agents />} />
              <Route path="agents/new" element={<CreateAgent />} />
              <Route path="agents/:id" element={<AgentDetail />} />
              <Route path="agents/:id/chat" element={<ChatInterface />} />
              <Route path="agents/:id/analytics" element={<AgentAnalytics />} />
              <Route path="documents" element={<Documents />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
```

---



## 📄 frontend\src\index.css

```css
@import "tailwindcss";
```

---



## 📄 frontend\src\main.tsx

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---



## 📄 frontend\src\react-syntax-highlighter.d.ts

```ts
declare module 'react-syntax-highlighter' {
  export * from 'react-syntax-highlighter/dist/esm';
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  const styles: any;
  export default styles;
}
```

---



## 📄 frontend\src\api\agents.ts

```ts
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
```

---



## 📄 frontend\src\api\analytics.ts

```ts
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
```

---



## 📄 frontend\src\api\auth.ts

```ts
import { api } from './axios';
import type { RegisterRequest, LoginRequest, User, TokenResponse } from '../types/auth';
import axios from 'axios';

let activeRequest: Promise<User> | null = null;

interface AuthService {
  register(data: RegisterRequest): Promise<TokenResponse>;
  login(data: LoginRequest): Promise<TokenResponse>;
  getMe(force?: boolean): Promise<User>;
  updateEmail(email: string, password: string): Promise<void>;
  updatePassword(currentPassword: string, newPassword: string): Promise<void>;
}

export const authService: AuthService = {
  async register(data: RegisterRequest): Promise<TokenResponse> {
    try {
      const response = await api.post<TokenResponse>('/auth/register', data);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.detail || error.message || 'Registration failed'
        );
      }
      throw new Error('Registration failed');
    }
  },

  async login(data: LoginRequest): Promise<TokenResponse> {
    try {
      const response = await api.post<TokenResponse>('/auth/login', data);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.detail || error.message || 'Login failed'
        );
      }
      throw new Error('Login failed');
    }
  },

  async getMe(force = false): Promise<User> {
    if (activeRequest && !force) {
      return activeRequest;
    }

    try {
      activeRequest = api.get<User>('/auth/me');
      const user = await activeRequest;
      return user;
    } catch (error) {
      activeRequest = null;
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem('ai_agent_token');
      }
      throw error;
    } finally {
      if (force) {
        activeRequest = null;
      }
    }
  },

  async updateEmail(email: string, password: string): Promise<void> {
    try {
      await api.put('/auth/email', { email, password });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.detail || error.message || 'Email update failed'
        );
      }
      throw new Error('Email update failed');
    }
  },

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.detail || error.message || 'Password update failed'
        );
      }
      throw new Error('Password update failed');
    }
  }
};
```

---



## 📄 frontend\src\api\axios.ts

```ts
import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { getToken, removeToken } from '../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {

    if (!error.response) {
      throw new Error('Network Error');
    }

    const { status, data } = error.response;

    if (status === 401) {
      removeToken();
      window.location.href = '/login';
      throw new Error('Unauthorized - Please login again');
    }

    if (status === 403) {
      throw new Error('Forbidden - Insufficient permissions');
    }

    if (status === 400 && (data as any).detail) {
      const detail = (data as any).detail;
      if (Array.isArray(detail)) {
        throw new Error(detail.map((err: any) => err.msg || err.message).join(', '));
      }
      throw new Error(detail);
    }

    if (status >= 500) {
      throw new Error('Server Error');
    }

    throw new Error((data as any)?.message || error.message);
  }
);

export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) => 
    apiClient.get<T>(url, config).then((res) => res.data),
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config).then((res) => res.data),
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config).then((res) => res.data),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config).then((res) => res.data),
};

export default apiClient;
```

---



## 📄 frontend\src\api\documents.ts

```ts
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
```

---



## 📄 frontend\src\components\ErrorBoundary.tsx

```tsx
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from './ui/Button';
import { useNavigate } from 'react-router-dom';
import { captureException } from '@sentry/react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  context?: string; // Additional context about where the error occurred
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
        context: this.props.context
      }
    });
    console.error('Uncaught error:', error, errorInfo);
  }

  handleReset = () => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-red-600 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {this.state.error?.message || 'Please try again later'}
            </p>
            {process.env.NODE_ENV === 'development' && (
              <details className="mb-4 text-left text-xs text-gray-500">
                <summary>Error details</summary>
                <pre className="mt-2 overflow-auto p-2 bg-gray-100 rounded">
                  {this.state.error?.stack}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <div className="flex justify-center space-x-3">
              <Button
                onClick={this.handleReset}
                variant="outline"
                className="bg-white text-indigo-600 hover:bg-indigo-50"
              >
                Retry
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function useErrorBoundary() {
  const navigate = useNavigate();

  const handleError = (error: unknown, context?: string) => {
    const err = error instanceof Error ? error : new Error(String(error));
    captureException(err, { extra: { context } });
    console.error('Error caught:', err);

    if (err.message.includes('401')) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    if (err.message.includes('403')) {
      navigate('/error', { state: { error: 'Access Denied' } });
      return;
    }

    navigate('/error', { 
      state: { 
        error: err.message || 'Something went wrong',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      }
    });
  };

  return { handleError };
}
```

---



## 📄 frontend\src\components\Logo.tsx

```tsx
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z"
        fill="#4F46E5"
      />
      <path
        d="M19.5 12.5L16 8L12.5 12.5L16 17L19.5 12.5Z"
        fill="white"
      />
      <path
        d="M19.5 19.5L16 24L12.5 19.5L16 15L19.5 19.5Z"
        fill="white"
      />
    </svg>
  );
}
```

---



## 📄 frontend\src\components\PrivateRoute.tsx

```tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    if (!isLoading && !checkedAuth) {
      setCheckedAuth(true);
    }
  }, [isLoading, checkedAuth]);

  if (isLoading || !checkedAuth) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
```

---



## 📄 frontend\src\components\agents\AgentCard.tsx

```tsx
import { Link } from 'react-router-dom';
import { EllipsisVerticalIcon } from '@heroicons/react/24/solid';
import { Dropdown } from '../ui/Dropdown';
import { DropdownItem } from '../ui/DropdownItem';

interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    created_at: string;
  };
  onDelete?: (id: string) => void;
}

export function AgentCard({ agent, onDelete }: AgentCardProps) {
  const handleDelete = () => {
    if (onDelete) {
      onDelete(agent.id);
    }
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg transition-all hover:shadow-md">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {agent.name}
          </h3>
          <Dropdown
            trigger={<EllipsisVerticalIcon className="h-5 w-5" />}
            align="right"
          >
            <DropdownItem as="link" to={`/dashboard/agents/${agent.id}`}>
              Edit Agent
            </DropdownItem>
            <DropdownItem
              className="text-red-600 hover:bg-red-50"
              onClick={handleDelete}
            >
              Delete Agent
            </DropdownItem>
            <DropdownItem as="link" to={`/dashboard/agents/${agent.id}/analytics`}>
              View Analytics
            </DropdownItem>
          </Dropdown>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            Created: {new Date(agent.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="mt-6">
          <Link
            to={`/dashboard/agents/${agent.id}/chat`}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            aria-label={`Chat with ${agent.name}`}
          >
            Chat with Agent
          </Link>
          <Link 
            to={`/dashboard/agents/${agent.id}`}
            className="text-lg font-medium text-gray-900 hover:text-indigo-600"
          >
            About {agent.name}
          </Link>
        </div>
      </div>
    </div>
  );
}
```

---



## 📄 frontend\src\components\agents\AgentForm.tsx

```tsx
import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { FileUpload } from '../ui/FileUpload';

interface AgentFormProps {
  onSubmit: (data: {
    name: string;
    description: string;
    instructions: string;
    files?: File[];
  }) => void;
  isLoading?: boolean;
  error?: Error;
  initialData?: {
    name?: string;
    description?: string;
    instructions?: string;
  };
}

const DEFAULT_DESCRIPTION = "A specialized AI assistant focused exclusively on analyzing and answering questions about the provided documents.";
const DEFAULT_INSTRUCTIONS = `You are a highly focused AI assistant that strictly answers questions based on the provided documents.

Key Rules:
1. Only respond to questions that can be answered using the uploaded documents
2. For unrelated questions, respond with: "I can only answer questions about [Agent Name]'s documentation"
3. Never speculate, make up answers, or provide information beyond the document content
4. When possible, reference which document section the information came from
5. Keep answers concise and factual

Example Responses:
- "According to the user manual (page 12), the setup process requires..."
- "I can only answer questions about [Agent Name]'s documentation"
- "The policy document states that..."`;

export function AgentForm({
  onSubmit,
  isLoading = false,
  error,
  initialData = {},
}: AgentFormProps) {
  const [name, setName] = useState(initialData.name || '');
  const [description, setDescription] = useState(
    initialData.description || DEFAULT_DESCRIPTION
  );
  const [instructions, setInstructions] = useState(
    initialData.instructions || DEFAULT_INSTRUCTIONS
  );
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, description, instructions, files });
  };

  const handleFileChange = (newFiles: File[]) => {
    setFiles(newFiles);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-4">
          <div className="text-sm text-red-700">{error.message}</div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <Input
          label="Agent Name"
          id="agent-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Product Documentation Assistant"
          helperText="Give your agent a clear, descriptive name"
        />

        <Textarea
          label="Description"
          id="agent-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your agent's purpose and focus"
          rows={3}
          helperText="This helps users understand what the agent can help with"
        />

        <Textarea
          label="Behavior Instructions"
          id="agent-instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Define how your agent should behave"
          rows={8}
          helperText={
            "Key guidelines: Include rules for unrelated questions, specify response style, and define how to reference document sources."
          }
        />

        {!initialData.name && (
          <FileUpload
            label="Knowledge Sources (Required for full functionality)"
            accept=".pdf,.txt,.doc,.docx,.md,.csv,.xlsx"
            multiple
            onChange={handleFileChange}
            value={files}
            helperText="Upload all relevant documents the agent should reference"
          />
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData.name ? 'Update Agent' : 'Create Agent'}
        </Button>
      </div>
    </form>
  );
}
```

---



## 📄 frontend\src\components\analytics\Charts.tsx

```tsx
import { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface ChartProps {
  data: { [key: string]: any }[];
  xField: string;
  yField: string;
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}

const defaultMargin = { top: 20, right: 30, bottom: 40, left: 40 };

export function LineChart({
  data,
  xField,
  yField,
  width = 600,
  height = 300,
  margin = defaultMargin,
}: ChartProps) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current || data.length === 0) return;

    const svg = d3.select(ref.current);
    svg.selectAll('*').remove(); // Clear previous renders

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d[xField]))
      .range([0, innerWidth])
      .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d[yField]) || 0])
      .nice()
      .range([innerHeight, 0]);

    const line = d3
      .line<typeof data[0]>()
      .x((d) => xScale(d[xField])! + xScale.bandwidth() / 2)
      .y((d) => yScale(d[yField]))
      .curve(d3.curveMonotoneX);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#4f46e5')
      .attr('stroke-width', 2)
      .attr('d', line);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    g.append('g').call(d3.axisLeft(yScale));

    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height - 5)
      .style('text-anchor', 'middle')
      .text(xField);

    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 15)
      .attr('x', -height / 2)
      .style('text-anchor', 'middle')
      .text(yField);
  }, [data, xField, yField, width, height, margin]);

  return <svg ref={ref} width={width} height={height} />;
}

export function BarChart({
  data,
  xField,
  yField,
  width = 400,
  height = 300,
  margin = defaultMargin,
}: ChartProps) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current || data.length === 0) return;

    const svg = d3.select(ref.current);
    svg.selectAll('*').remove(); // Clear previous renders

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d[xField]))
      .range([0, innerWidth])
      .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d[yField]) || 0])
      .nice()
      .range([innerHeight, 0]);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    g.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d) => xScale(d[xField])!)
      .attr('y', (d) => yScale(d[yField]))
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => innerHeight - yScale(d[yField]))
      .attr('fill', '#4f46e5');

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    g.append('g').call(d3.axisLeft(yScale));

    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height - 5)
      .style('text-anchor', 'middle')
      .text(xField);

    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 15)
      .attr('x', -height / 2)
      .style('text-anchor', 'middle')
      .text(yField);
  }, [data, xField, yField, width, height, margin]);

  return <svg ref={ref} width={width} height={height} />;
}
```

---



## 📄 frontend\src\components\dashboard\Header.tsx

```tsx
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
```

---



## 📄 frontend\src\components\dashboard\Sidebar.tsx

```tsx
import { NavLink } from 'react-router-dom';
import { Logo } from '../Logo';

export function DashboardSidebar() {
  return (
    <aside className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
        <div className="flex items-center h-16 px-4 border-b border-gray-200">
          <Logo className="h-8 w-auto" />
        </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            <NavItem to="/dashboard/agents" icon={<AgentIcon />}>
              My Agents
            </NavItem>
            <NavItem to="/dashboard/documents" icon={<DocumentIcon />}>
              Documents
            </NavItem>
            <NavItem to="/dashboard/analytics" icon={<AnalyticsIcon />}>
              Analytics
            </NavItem>
            <NavItem to="/dashboard/settings" icon={<SettingsIcon />}>
              Settings
            </NavItem>
          </nav>
      </div>
    </aside>
  );
}

function NavItem({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center px-2 py-2 text-sm font-medium rounded-md group ${
          isActive
            ? 'bg-indigo-50 text-indigo-700'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`
      }
    >
      <span className="flex-shrink-0 w-6 h-6 mr-3 text-gray-400 group-hover:text-gray-500">
        {icon}
      </span>
      {children}
    </NavLink>
  );
}

function AgentIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
    </svg>
  );
}
```

---



## 📄 frontend\src\components\dashboard\UserMenu.tsx

```tsx
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

interface UserMenuProps {
  user: {
    email: string;
  };
  onLogout: () => void;
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center space-x-2 max-w-xs rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500">
        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
          {user.email.charAt(0).toUpperCase()}
        </div>
        <span className="sr-only">Open user menu</span>
        <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
          <Menu.Item>
            <div className="block px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
              {user.email}
            </div>
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={onLogout}
                className={`${
                  active ? 'bg-gray-100' : ''
                } block w-full text-left px-4 py-2 text-sm text-gray-700`}
              >
                Sign out
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
```

---



## 📄 frontend\src\components\ui\Button.tsx

```tsx
import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  isLoading?: boolean;
  to?: string; // Add this line
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', isLoading = false, children, to, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

    const variantClasses = {
      primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
      outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500',
      ghost: 'hover:bg-gray-100 focus:ring-indigo-500',
    };

    if (to) {
      return (
        <Link
          to={to}
          className={twMerge(baseClasses, variantClasses[variant], className)}
        >
          {isLoading && <Spinner />}
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        className={twMerge(baseClasses, variantClasses[variant], className)}
        disabled={isLoading}
        {...props}
      >
        {isLoading && <Spinner />}
        {children}
      </button>
    );
  }
);

function Spinner() {
  return (
    <svg
      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}

Button.displayName = 'Button';
```

---



## 📄 frontend\src\components\ui\Dropdown.tsx

```tsx
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import type { ReactNode } from 'react';

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
}

export function Dropdown({ trigger, children, align = 'right' }: DropdownProps) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button as={Fragment}>
          <div
            className="flex items-center text-gray-400 hover:text-gray-500 focus:outline-none"
            aria-label="More options"
            tabIndex={0}
          >
            {trigger}
          </div>
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={`absolute z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <div className="py-1">{children}</div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
```

---



## 📄 frontend\src\components\ui\DropdownItem.tsx

```tsx
import { Menu } from '@headlessui/react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  as?: 'button' | 'link';
  to?: string;
}

export function DropdownItem({
  children,
  onClick,
  className = "",
  as = 'button',
  to,
}: DropdownItemProps) {
  const baseClasses = 'block w-full text-left px-4 py-2 text-sm';

  return (
    <Menu.Item>
      {({ active }) => (
        as === 'link' && to ? (
          <Link
            to={to}
            className={`${baseClasses} ${active ? 'bg-gray-100' : ''} ${className}`}
          >
            {children}
          </Link>
        ) : (
          <button
            type="button"
            onClick={onClick}
            className={`${baseClasses} ${active ? 'bg-gray-100' : ''} ${className}`}
          >
            {children}
          </button>
        )
      )}
    </Menu.Item>
  );
}
```

---



## 📄 frontend\src\components\ui\FileUpload.tsx

```tsx
import { useCallback, useState } from 'react';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';

interface FileUploadProps {
  label?: string;
  accept?: string;
  multiple?: boolean;
  onChange: (files: File[]) => void;
  value: File[];
  helperText?: string;
}

export function FileUpload({
  label,
  accept = '*',
  multiple = false,
  onChange,
  value = [],
  helperText,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onChange(Array.from(e.target.files));
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files) {
        onChange(Array.from(e.dataTransfer.files));
      }
    },
    [onChange]
  );

  const removeFile = (index: number) => {
    const newFiles = [...value];
    newFiles.splice(index, 1);
    onChange(newFiles);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div
        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
          dragActive ? 'border-indigo-500' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-1 text-center">
          <ArrowUpTrayIcon
            className={`mx-auto h-12 w-12 ${
              dragActive ? 'text-indigo-500' : 'text-gray-400'
            }`}
          />
          <div className="flex text-sm text-gray-600">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
            >
              <span>Upload files</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                accept={accept}
                multiple={multiple}
                onChange={handleChange}
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">
            {accept === '*' ? 'Any file type' : accept}
          </p>
        </div>
      </div>
      {helperText && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}

      {value.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Selected files:</h4>
          <ul className="divide-y divide-gray-200">
            {value.map((file, index) => (
              <li key={index} className="py-3 flex items-center justify-between">
                <span className="text-sm text-gray-500 truncate">
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-sm text-red-600 hover:text-red-500"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

---



## 📄 frontend\src\components\ui\Input.tsx

```tsx
import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, className, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${className}`}
          {...props}
        />
        {helperText && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

---



## 📄 frontend\src\components\ui\LoadingOverlay.tsx

```tsx
export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );
}
```

---



## 📄 frontend\src\components\ui\LoadingSpinner.tsx

```tsx
export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );
}
```

---



## 📄 frontend\src\components\ui\Textarea.tsx

```tsx
import { forwardRef } from 'react';

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helperText, className, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${className}`}
          {...props}
        />
        {helperText && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
```

---



## 📄 frontend\src\components\ui\ToastContainer.tsx

```tsx
import type { Toast } from '../../hooks/useToast';

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-md shadow-lg ${
            toast.type === 'success' ? 'bg-green-500 text-white' :
            toast.type === 'error' ? 'bg-red-500 text-white' :
            toast.type === 'warning' ? 'bg-yellow-500 text-black' :
            'bg-blue-500 text-white'
          }`}
        >
          <div className="flex justify-between items-center">
            <span>{toast.message}</span>
            <button
              onClick={() => onDismiss(toast.id)}
              className="ml-4 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---



## 📄 frontend\src\contexts\AuthContext.tsx

```tsx
import { createContext, useContext, type ReactNode, useState, useEffect, useCallback } from 'react';
import { authService } from '../api/auth';
import { getToken, removeToken, setToken } from '../utils/auth';
import type { User } from '../types/auth';

interface AuthContextType {
  user: User | null;
  token: string | null; // Add token to the context
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const setTokenWrapper = (newToken: string) => {
    setToken(newToken);
    setTokenState(newToken);
  };

  const loadUser = useCallback(async () => {
    const currentToken = getToken();
    if (!currentToken) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = await authService.getMe();
      setUser(userData);
    } catch (error) {
      removeToken();
      setTokenState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email: string, password: string) => {
    setIsAuthLoading(true);
    try {
      const { access_token } = await authService.login({ email, password });
      setTokenWrapper(access_token);
      const userData = await authService.getMe();
      setUser(userData);
    } catch (error) {
      throw error;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setIsAuthLoading(true);
    try {
      const { access_token } = await authService.register({ email, password });
      setTokenWrapper(access_token);
      const userData = await authService.getMe();
      setUser(userData);
    } catch (error) {
      throw error;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = () => {
    removeToken();
    setTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token, // Now exposing token
        isAuthenticated: !!user,
        isLoading,
        isAuthLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

---



## 📄 frontend\src\hooks\useToast.ts

```ts
import { useState } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      dismissToast(id);
    }, 5000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return { toasts, showToast, dismissToast };
}
```

---



## 📄 frontend\src\hooks\useWebSocket.ts

```ts
import { useEffect, useRef, useCallback } from 'react';

export function useWebSocket(url: string, onMessage: (message: string) => void) {
  const socketRef = useRef<WebSocket | null>(null);
  const isConnectedRef = useRef(false);

  const sendMessage = useCallback((message: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(message);
    }
  }, []);

  useEffect(() => {
    socketRef.current = new WebSocket(url);
    isConnectedRef.current = false;

    const socket = socketRef.current;

    socket.onopen = () => {
      isConnectedRef.current = true;
    };

    socket.onmessage = (event) => {
      onMessage(event.data);
    };

    socket.onclose = () => {
      isConnectedRef.current = false;
    };

    return () => {
      socket.close();
    };
  }, [url, onMessage]);

  return {
    sendMessage,
    isConnected: isConnectedRef.current,
  };
}
```

---



## 📄 frontend\src\layouts\DashboardLayout.tsx

```tsx
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
```

---



## 📄 frontend\src\lib\react-query.ts

```ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});
```

---



## 📄 frontend\src\pages\LandingPage.tsx

```tsx
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { 
  DocumentIcon,
  CircleStackIcon,
  CodeBracketIcon,
  UsersIcon,
  ChartBarIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } }
};

const slideUp = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <motion.nav 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="flex items-center justify-between p-6 max-w-7xl mx-auto"
      >
        <div className="flex items-center space-x-2">
          <Logo className="h-8 w-auto" />
          <span className="text-xl font-semibold text-gray-900">AI Agent Platform</span>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <Link to="/features" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            Features
          </Link>
          <Link to="/pricing" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            Pricing
          </Link>
          <Link to="/docs" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            Documentation
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            Sign in
          </Link>
          <Button to="/register" className="bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
            Get started
          </Button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <motion.main 
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28"
            >
              <motion.div variants={slideUp} className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <motion.span 
                    className="block"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    Build AI Agents for
                  </motion.span>
                  <motion.span 
                    className="block text-indigo-600"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    Your Documents & Databases
                  </motion.span>
                </h1>
                <motion.p 
                  variants={slideUp}
                  className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0"
                >
                  Create custom AI chatbots trained on your knowledge base. Connect documents and databases to build powerful assistants for your team and customers.
                </motion.p>
                <motion.div 
                  variants={slideUp}
                  className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start"
                >
                  <div className="rounded-md shadow">
                    <Button
                      to="/register"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 transition-all"
                    >
                      Get started for free
                    </Button>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Button
                      to="/demo"
                      variant="outline"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-all"
                    >
                      Live demo
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            </motion.main>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2"
        >
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80"
            alt="AI Assistant Illustration"
          />
        </motion.div>
      </section>

      {/* Features Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="py-12 bg-gray-50 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={slideUp} className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to build AI agents
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Powerful features designed to help you create, customize and deploy AI assistants.
            </p>
          </motion.div>

          <motion.div variants={staggerContainer} className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <motion.div 
                  key={feature.name}
                  variants={slideUp}
                  whileHover={{ y: -5 }}
                  className="bg-white overflow-hidden shadow rounded-lg transition-all hover:shadow-md"
                >
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{feature.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-indigo-700"
      >
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to build your AI agent?</span>
            <span className="block">Start today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-indigo-200">
            Create your first AI assistant in minutes. No credit card required.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-8"
          >
            <Button
              to="/register"
              className="w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 sm:w-auto transition-transform"
            >
              Sign up for free
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="bg-white"
      >
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
            {footerLinks.map((link) => (
              <motion.div 
                key={link.name}
                whileHover={{ scale: 1.05 }}
                className="px-5 py-2"
              >
                <Link to={link.href} className="text-base text-gray-500 hover:text-gray-900 transition-colors">
                  {link.name}
                </Link>
              </motion.div>
            ))}
          </nav>
          <p className="mt-8 text-center text-base text-gray-400">
            &copy; {new Date().getFullYear()} AI Agent Platform. All rights reserved.
          </p>
        </div>
      </motion.footer>
    </div>
  );
}

const features = [
  {
    name: 'Document-based Agents',
    description: 'Upload PDFs, Word docs, and text files to create AI agents that answer questions based on your content.',
    icon: DocumentIcon,
  },
  {
    name: 'Database Integration',
    description: 'Connect PostgreSQL databases to enhance your agents with real-time data from your systems.',
    icon: CircleStackIcon,
  },
  {
    name: 'Custom Instructions',
    description: 'Define exactly how your agent should behave with custom prompts and response guidelines.',
    icon: CodeBracketIcon,
  },
  {
    name: 'Multi-Agent Management',
    description: 'Create and manage multiple agents for different purposes or departments.',
    icon: UsersIcon,
  },
  {
    name: 'Analytics Dashboard',
    description: 'Track queries, popular questions, and document usage with detailed analytics.',
    icon: ChartBarIcon,
  },
  {
    name: 'Embeddable Chat Widget',
    description: 'Easily embed your AI agent into any website with a simple script or iframe.',
    icon: ChatBubbleBottomCenterTextIcon,
  },
];

const footerLinks = [
  { name: 'About', href: '/about' },
  { name: 'Blog', href: '/blog' },
  { name: 'Jobs', href: '/jobs' },
  { name: 'Press', href: '/press' },
  { name: 'Privacy', href: '/privacy' },
  { name: 'Terms', href: '/terms' },
];
```

---



## 📄 frontend\src\pages\agents\AgentDetail.tsx

```tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentsService } from '../../api/agents';
import { documentsService } from '../../api/documents';
import { AgentForm } from '../../components/agents/AgentForm';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { Button } from '../../components/ui/Button';
import { useState } from 'react';

export function AgentDetail() {
  const { id } = useParams<{ id: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: agent, isLoading, error } = useQuery({
    queryKey: ['agent', id],
    queryFn: () => agentsService.getAgent(id!),
  });

  const { data: documents } = useQuery({
    queryKey: ['documents', id],
    queryFn: () => documentsService.getAgentDocuments(id!),
  });

  const updateAgentMutation = useMutation({
    mutationFn: (data: { name: string; description: string; instructions: string }) =>
      agentsService.updateAgent(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', id] });
      setIsEditing(false);
    },
  });

  const deleteAgentMutation = useMutation({
    mutationFn: () => agentsService.deleteAgent(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      navigate('/dashboard/agents');
    },
  });

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this agent?')) {
      deleteAgentMutation.mutate();
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading agent details...</div>;
  }

  if (error) {
    return <div className="text-center py-12">Error loading agent: {error.message}</div>;
  }

  if (!agent) {
    return <div className="text-center py-12">Agent not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      {isEditing ? (
        <>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Agent</h1>
          <AgentForm
            initialData={{
              name: agent.name,
              description: agent.description || '',
              instructions: agent.instructions || '',
            }}
            onSubmit={(data) => updateAgentMutation.mutate(data)}
            isLoading={updateAgentMutation.isPending}
            error={updateAgentMutation.error ?? undefined}
          />
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Agent Details</h1>
            <div className="flex space-x-2">
              <Button onClick={() => setIsEditing(true)} variant="outline">
                Edit
              </Button>
              <Button
                onClick={handleDelete}
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
                isLoading={deleteAgentMutation.isPending}
              >
                Delete
              </Button>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold">{agent.name}</h2>
            </div>
            <div>

              <h3 className="font-medium text-gray-900">Description</h3>
              {agent.description && (
                <p className="text-gray-600 mt-2">{agent.description}</p>
              )}
            </div>

            <div>
              <h3 className="font-medium text-gray-900">Instructions</h3>
              <p className="mt-2 text-gray-600 whitespace-pre-wrap">
                {agent.instructions}
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">Knowledge Sources</h3>
              {documents?.length ? (
                <ul className="mt-2 space-y-2">
                  {documents.map((doc) => (
                    <li key={doc.id} className="flex justify-between items-center">
                      <span className="text-gray-600">{doc.filename}</span>
                      <button
                        onClick={() => documentsService.deleteDocument(doc.id)}
                        className="text-sm text-red-600 hover:text-red-500"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-gray-500">No documents uploaded</p>
              )}
            </div>

            <div className="pt-4">
              <Button
                to={`/dashboard/agents/${agent.id}/chat`}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Chat with Agent
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function AgentDetailWithBoundary() {
  return (
    <ErrorBoundary>
      <AgentDetail />
    </ErrorBoundary>
  );
}
```

---



## 📄 frontend\src\pages\agents\Agents.tsx

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { AgentCard } from '../../components/agents/AgentCard';
import { agentsService } from '../../api/agents';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorBoundary } from '../../components/ErrorBoundary';

export function Agents() {
  const queryClient = useQueryClient();
  const { data: agents, isLoading, isError, error } = useQuery({
    queryKey: ['agents'],
    queryFn: agentsService.getAgents,
  });

  const deleteMutation = useMutation({
    mutationFn: agentsService.deleteAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this agent?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    throw error;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Agents</h2>
        <Button to="/dashboard/agents/new">Create Agent</Button>
      </div>

      {agents?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">You haven't created any agents yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {agents?.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AgentsWithBoundary() {
  return (
    <ErrorBoundary>
      <Agents />
    </ErrorBoundary>
  );
}
```

---



## 📄 frontend\src\pages\agents\Analytics.tsx

```tsx
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
```

---



## 📄 frontend\src\pages\agents\ChatInterface.tsx

```tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorBoundary } from '../../components/ErrorBoundary';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system' | 'typing';
  timestamp: Date;
  error?: boolean;
}

export function ChatInterface() {
  const { id: agentId } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const typingIndicatorRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY_MS = 3000;
  const PING_INTERVAL_MS = 25000;

  const cleanupWebSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.onopen = null;
      socketRef.current.onmessage = null;
      socketRef.current.onerror = null;
      socketRef.current.onclose = null;
      if (socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
      socketRef.current = null;
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (typingIndicatorRef.current) {
      clearTimeout(typingIndicatorRef.current);
      typingIndicatorRef.current = null;
    }
  }, []);

  const addTypingIndicator = useCallback(() => {
    setMessages(prev => [
      ...prev.filter(msg => msg.role !== 'typing'),
      {
        id: 'typing-' + Date.now(),
        content: '...',
        role: 'typing',
        timestamp: new Date()
      }
    ]);
  }, []);

  const removeTypingIndicator = useCallback(() => {
    setMessages(prev => prev.filter(msg => msg.role !== 'typing'));
  }, []);

  const connectWebSocket = useCallback(() => {
    if (!token || !agentId) {
      setStatus('error');
      return;
    }

    cleanupWebSocket();

    setStatus('connecting');
    const socketUrl = `ws://${window.location.hostname}:8000/api/v1/chat/${agentId}/ws?token=${token}`;
    socketRef.current = new WebSocket(socketUrl);

    socketRef.current.onopen = () => {
      console.log('WebSocket connected');
      setStatus('connected');
      reconnectAttempts.current = 0;
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: 'Connected to agent',
        role: 'system',
        timestamp: new Date()
      }]);

      pingIntervalRef.current = setInterval(() => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send('ping');
        }
      }, PING_INTERVAL_MS);
    };

    socketRef.current.onmessage = (event) => {
      if (event.data === 'pong' || event.data === 'ping') {
        return; // Ignore ping/pong messages
      }

      removeTypingIndicator();

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: event.data,
        role: 'assistant',
        timestamp: new Date()
      }]);
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setStatus('error');
    };

    socketRef.current.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      if (event.code !== 1000 && reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts.current += 1;
        reconnectTimerRef.current = setTimeout(() => {
          console.log(`Attempting to reconnect (${reconnectAttempts.current}/${MAX_RECONNECT_ATTEMPTS})`);
          connectWebSocket();
        }, RECONNECT_DELAY_MS * reconnectAttempts.current);
      } else {
        setStatus('error');
      }
    };
  }, [agentId, token, cleanupWebSocket, removeTypingIndicator]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      cleanupWebSocket();
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, [connectWebSocket, cleanupWebSocket]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = input.trim();
    if (!message || !socketRef.current || status !== 'connected') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      if (socketRef.current.readyState === WebSocket.OPEN) {
        typingIndicatorRef.current = setTimeout(() => {
          addTypingIndicator();
        }, 500);

        socketRef.current.send(JSON.stringify({
          query: message
        }));
      } else {
        throw new Error('Connection not ready');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      if (typingIndicatorRef.current) {
        clearTimeout(typingIndicatorRef.current);
      }
      setMessages(prev => [...prev, {
        ...userMessage,
        error: true
      }]);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="text-red-500 mb-4">
          {reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS
            ? 'Failed to connect after several attempts'
            : 'Connection failed'}
        </div>
        <button
          onClick={() => {
            reconnectAttempts.current = 0;
            connectWebSocket();
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Reconnect
        </button>
      </div>
    );
  }

  if (status === 'connecting') {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
        <span className="ml-2">
          {reconnectAttempts.current > 0
            ? `Reconnecting (${reconnectAttempts.current}/${MAX_RECONNECT_ATTEMPTS})...`
            : 'Connecting to agent...'}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' :
              message.role === 'assistant' ? 'justify-start' :
              message.role === 'typing' ? 'justify-start' :
              'justify-center'
            }`}
          >
            <div className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
              message.error
                ? 'bg-red-100 text-red-800'
                : message.role === 'user'
                ? 'bg-indigo-600 text-white'
                : message.role === 'assistant'
                ? 'bg-gray-200 text-gray-800'
                : message.role === 'typing'
                ? 'bg-gray-200 text-gray-800 animate-pulse'
                : 'bg-blue-100 text-blue-800'
            }`}
            >
              {message.content}
              {message.error && (
                <div className="text-xs mt-1">Failed to send</div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef}/>
      </div>

      <form onSubmit={handleSubmit} className="mt-auto">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Type your message..."
            disabled={status !== 'connected'}
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            disabled={!input.trim() || status !== 'connected'}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ChatInterfaceWithBoundary() {
  return (
    <ErrorBoundary fallback={<div className="p-4 text-red-500">Chat interface failed to load</div>}>
      <ChatInterface />
    </ErrorBoundary>
  );
}
```

---



## 📄 frontend\src\pages\agents\CreateAgent.tsx

```tsx
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { agentsService } from '../../api/agents';
import { documentsService } from '../../api/documents';
import { AgentForm } from '../../components/agents/AgentForm';
import { ErrorBoundary } from '../../components/ErrorBoundary';

export function CreateAgent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createAgentMutation = useMutation({
    mutationFn: agentsService.createAgent,
    onSuccess: (agent) => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      return agent; // Return agent for the next mutation
    },
  });

  const uploadDocumentsMutation = useMutation({
    mutationFn: (data: { agentId: string; files: File[] }) => {
      return Promise.all(
        data.files.map((file) =>
          documentsService.uploadDocument(data.agentId, file)
        )
      );
    },
  });

  const handleSubmit = (data: {
    name: string;
    description: string;
    instructions: string;
    files?: File[];
  }): void => {
    (async () => {
      try {
        const agent = await createAgentMutation.mutateAsync({
          name: data.name,
          description: data.description,
          instructions: data.instructions,
        });

        const files = data.files ?? [];
        if (files.length > 0) {
          await Promise.all(
            files.map(file => 
              documentsService.uploadDocument(agent.id, file)
                .catch(e => {
                  console.error(`Failed to upload ${file.name}:`, e);
                  throw e; // Re-throw to trigger error state
                })
            )
          );
        }

        navigate(`/dashboard/agents/${agent.id}`, { replace: true });
      } catch (error) {
        console.error('Error creating agent:', error);
      }
    })();
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Agent</h1>
      <AgentForm
        onSubmit={handleSubmit}
        isLoading={createAgentMutation.isPending || uploadDocumentsMutation.isPending}
        error={(createAgentMutation.error ?? uploadDocumentsMutation.error) ?? undefined}
      />
    </div>
  );
}

export default function CreateAgentWithBoundary() {
  return (
    <ErrorBoundary>
      <CreateAgent />
    </ErrorBoundary>
  );
}
```

---



## 📄 frontend\src\pages\analytics\Analytics.tsx

```tsx
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
```

---



## 📄 frontend\src\pages\analytics\AnalyticsDashboard.tsx

```tsx
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
```

---



## 📄 frontend\src\pages\auth\Login.tsx

```tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Logo } from '../../components/Logo';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Logo className="h-12 w-auto" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link 
            to="/register" 
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="text-red-700">{error}</div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Email address"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                isLoading={isLoading}
              >
                Sign in
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Don't have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/register"
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---



## 📄 frontend\src\pages\auth\Register.tsx

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {Button} from '../../components/ui/Button';
import {Input} from '../../components/ui/Input';
import { Logo } from '../../components/Logo';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Please enter a valid email address');
        return;
    }

    setError('');
    setIsLoading(true);

    try {
        await register(email, password);
        navigate('/dashboard');
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
        setIsLoading(false);
    }
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Logo className="h-12 w-auto" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create a new account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="text-red-700">{error}</div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Email address"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="Must be at least 8 characters"
            />

            <div>
              <Button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                isLoading={isLoading}
              >
                Register
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/login')}
              >
                Sign in instead
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---



## 📄 frontend\src\pages\documents\Documents.tsx

```tsx
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
```

---



## 📄 frontend\src\pages\settings\Settings.tsx

```tsx
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../../api/auth';
import { useToast } from '../../hooks/useToast';
import { useState } from 'react';

export function Settings() {
  const { user, logout } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { showToast } = useToast();

  const updateEmailMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      authService.updateEmail(data.email, data.password),
    onSuccess: () => {
      showToast('Email updated successfully', 'success');
      logout();
    },
    onError: (error: Error) => {
      showToast(`Email update failed: ${error.message}`, 'error');
    }
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authService.updatePassword(data.currentPassword, data.newPassword),
    onSuccess: () => {
      showToast('Password updated successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error: Error) => {
      showToast(`Password update failed: ${error.message}`, 'error');
    }
  });

  const handleEmailUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Please enter your current password', 'warning');
      return;
    }
    updateEmailMutation.mutate({ email, password: currentPassword });
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'warning');
      return;
    }
    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters', 'warning');
      return;
    }
    updatePasswordMutation.mutate({
      currentPassword,
      newPassword
    });
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
      </div>

      <div className="space-y-6">
        <form onSubmit={handleEmailUpdate} className="bg-white shadow rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Update Email</h3>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              isLoading={updateEmailMutation.isLoading}
            >
              Update Email
            </Button>
          </div>
        </form>

        <form onSubmit={handlePasswordUpdate} className="bg-white shadow rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Update Password</h3>
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            helperText="Must be at least 8 characters"
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              isLoading={updatePasswordMutation.isLoading}
            >
              Update Password
            </Button>
          </div>
        </form>

        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Danger Zone</h3>
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-md font-medium text-gray-900">Delete Account</h4>
              <p className="text-sm text-gray-500">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50"
              onClick={() => {
                if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
                  logout();
                }
              }}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsWithBoundary() {
  return (
    <ErrorBoundary>
      <Settings />
    </ErrorBoundary>
  );
}
```

---



## 📄 frontend\src\routes\routes.ts

```ts
export const APP_ROUTING = [
    ...[]
]
```

---



## 📄 frontend\src\types\agent.ts

```ts
export interface Agent {
    id: string;
    name: string;
    description: string;
    instructions: string;
    created_at: string;
    updated_at: string;
}

export interface AgentCreate {
    name: string;
    description: string;
    instructions: string;
    files?: File[];
}

export interface Document {
  id: string;
  filename: string;
  content_type: string;
  uploaded_at: string;
}
```

---



## 📄 frontend\src\types\analytics.ts

```ts
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
```

---



## 📄 frontend\src\types\auth.ts

```ts
export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}
```

---



## 📄 frontend\src\utils\auth.ts

```ts
const TOKEN_KEY = 'ai_agent_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}
```

---

# 🗂️ Backend (FastAPI - backend/app)



## 📄 backend\app\main.py

```py
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import auth, documents, chat, agents
from app.db.init_db import create_db_and_tables
from app.api.v1 import analytics

logger = logging.getLogger(__name__)

app = FastAPI(title=settings.PROJECT_NAME)

@app.on_event("startup")
async def on_startup():
    logger.info("Starting up...")
    try:
        await create_db_and_tables()
        logger.info("Database initialization complete")
    except Exception as e:
        logger.error(f"Startup failed: {e}")
        raise

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(agents.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
```

---



## 📄 backend\app\api\deps.py

```py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.db.session import get_db
from app.core.config import settings
from typing import Optional, Tuple
import logging

logger = logging.getLogger(__name__)
bearer_scheme = HTTPBearer()

class AuthError(Exception):
    """Base class for authentication errors"""
    pass

class InvalidTokenError(AuthError):
    """Raised when token validation fails"""
    pass

class UserNotFoundError(AuthError):
    """Raised when user is not found"""
    pass

async def validate_token(token: str) -> Tuple[Optional[dict], Optional[AuthError]]:
    """Validate JWT token and return payload or error"""
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        if not payload.get("sub"):
            raise InvalidTokenError("Missing subject in token")
        return payload, None
    except JWTError as e:
        logger.error(f"Token validation failed: {str(e)}")
        return None, InvalidTokenError("Invalid token")
    except Exception as e:
        logger.error(f"Unexpected token validation error: {str(e)}")
        return None, InvalidTokenError("Token validation error")

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Dependency to get current authenticated user"""
    token = credentials.credentials

    payload, err = await validate_token(token)
    if err:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(err),
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        result = await db.execute(select(User).where(User.id == payload["sub"]))
        user = result.scalar_one_or_none()

        if not user:
            raise UserNotFoundError("User not found")

        return user
    except UserNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Database error during user lookup: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )

async def get_current_admin(user: User = Depends(get_current_user)) -> User:
    """Dependency to verify admin privileges"""
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Admin privileges required"
        )
    return user
```

---



## 📄 backend\app\api\v1\agents.py

```py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from uuid import UUID
from datetime import datetime

from app.db.session import get_db
from app.api.deps import get_current_user
from app.schemas.agent import AgentCreate, AgentOut
from app.models.user import User
from app.models.agent import Agent

router = APIRouter(prefix="/agents", tags=["Agents"])

@router.get("/", response_model=list[AgentOut])
async def list_agents(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all agents for the current user"""
    try:
        result = await db.execute(
            select(Agent).where(Agent.owner_id == current_user.id)
        )
        agents = result.scalars().all()
        return agents
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching agents: {str(e)}"
        )

@router.post("/", response_model=AgentOut, status_code=status.HTTP_201_CREATED)
async def create_agent(
    agent_in: AgentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new agent"""
    try:
        new_agent = Agent(
            name=agent_in.name,
            description=agent_in.description,
            instructions=agent_in.instructions,
            owner_id=current_user.id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(new_agent)
        await db.commit()
        await db.refresh(new_agent)
        return new_agent
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error creating agent: {str(e)}"
        )

@router.get("/{agent_id}", response_model=AgentOut)
async def get_agent(
    agent_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific agent by ID"""
    result = await db.execute(
        select(Agent).where(
            Agent.id == agent_id,
            Agent.owner_id == current_user.id
        )
    )
    agent = result.scalar_one_or_none()

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    return agent

@router.put("/{agent_id}", response_model=AgentOut)
async def update_agent(
    agent_id: UUID,
    agent_in: AgentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing agent"""
    result = await db.execute(
        select(Agent).where(
            Agent.id == agent_id,
            Agent.owner_id == current_user.id
        )
    )
    agent = result.scalar_one_or_none()

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )

    try:
        await db.execute(
            update(Agent)
            .where(Agent.id == agent_id)
            .values(
                name=agent_in.name,
                description=agent_in.description,
                instructions=agent_in.instructions,
                updated_at=datetime.utcnow()
            )
        )
        await db.commit()
        await db.refresh(agent)
        return agent
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error updating agent: {str(e)}"
        )

@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent(
    agent_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete an agent"""
    result = await db.execute(
        select(Agent).where(
            Agent.id == agent_id,
            Agent.owner_id == current_user.id
        )
    )
    agent = result.scalar_one_or_none()

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )

    try:
        await db.execute(
            delete(Agent).where(Agent.id == agent_id)
        )
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error deleting agent: {str(e)}"
        )
```

---



## 📄 backend\app\api\v1\analytics.py

```py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, func
from sqlalchemy import distinct
from datetime import datetime, timedelta
from uuid import UUID

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.agent import Agent
from app.models.message import Message

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/overview")
async def get_overview_analytics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get overview analytics for all agents"""
    try:
        total_agents_result = await db.execute(
            select(func.count(Agent.id))
            .where(Agent.owner_id == current_user.id)
        )
        total_agents = total_agents_result.scalar_one() or 0

        active_agents_result = await db.execute(
            select(func.count(distinct(Message.agent_id)))
            .join(Agent, Agent.id == Message.agent_id)
            .where(
                Agent.owner_id == current_user.id,
                Message.created_at >= datetime.utcnow() - timedelta(days=7)
            )
        )
        active_agents = active_agents_result.scalar_one() or 0

        queries_today_result = await db.execute(
            select(func.count(Message.id))
            .join(Agent, Agent.id == Message.agent_id)
            .where(
                Agent.owner_id == current_user.id,
                func.date(Message.created_at) == datetime.utcnow().date()
            )
        )
        queries_today = queries_today_result.scalar_one() or 0

        return {
            "total_agents": total_agents,
            "active_agents": active_agents,
            "queries_today": queries_today
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching analytics: {str(e)}"
        )

@router.get("/{agent_id}")
async def get_agent_analytics(
    agent_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get analytics for a specific agent"""
    try:
        agent_result = await db.execute(
            select(Agent)
            .where(
                Agent.id == agent_id,
                Agent.owner_id == current_user.id
            )
        )
        if not agent_result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Agent not found")

        query_volume = []
        for i in range(7):
            date = (datetime.utcnow() - timedelta(days=6-i)).date()
            count_result = await db.execute(
                select(func.count(Message.id))
                .where(
                    Message.agent_id == agent_id,
                    func.date(Message.created_at) == date
                )
            )
            query_volume.append({
                "date": date.isoformat(),
                "count": count_result.scalar_one() or 0
            })

        response_times = []
        for i in range(7):
            date = (datetime.utcnow() - timedelta(days=6-i)).date()
            time_result = await db.execute(
                select(
                    func.avg(Message.response_time)
                )
                .where(
                    Message.agent_id == agent_id,
                    Message.response_time.is_not(None),
                    func.date(Message.created_at) == date
                )
            )
            response_times.append({
                "date": date.isoformat(),
                "avg_time": float(time_result.scalar_one() or 0)
            })

        return {
            "query_volume": query_volume,
            "response_times": response_times,
            "total_queries": sum(q["count"] for q in query_volume),
            "avg_response_time": sum(
                rt["avg_time"] for rt in response_times
            ) / max(1, len(response_times))
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching agent analytics: {str(e)}"
        )
```

---



## 📄 backend\app\api\v1\auth.py

```py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UpdateEmailRequest,
    UpdatePasswordRequest
)
from app.services.auth import (
    register_user,
    authenticate_user,
    generate_user_token,
    update_user_email,
    update_user_password
)
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=TokenResponse)
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    try:
        user = await register_user(db, request.email, request.password)
        token = generate_user_token(user)
        return TokenResponse(access_token=token)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    user = await authenticate_user(db, request.email, request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    token = generate_user_token(user)
    return TokenResponse(access_token=token)

@router.put("/email", status_code=status.HTTP_204_NO_CONTENT)
async def update_email(
    request: UpdateEmailRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        await update_user_email(db, current_user, request.email, request.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/password", status_code=status.HTTP_204_NO_CONTENT)
async def update_password(
    request: UpdatePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        await update_user_password(
            db,
            current_user,
            request.current_password,
            request.new_password
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
```

---



## 📄 backend\app\api\v1\chat.py

```py
import asyncio
from asyncio.log import logger
import logging
from fastapi import APIRouter, Depends, status , WebSocket, WebSocketDisconnect, Query
from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from jose import JWTError, jwt
from datetime import datetime
import time
from typing import Optional, Callable, Awaitable
from uuid import UUID
from collections import defaultdict

from app.api.deps import get_current_user
from app.db.session import get_db
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat import get_qa_chain
from app.models.user import User
from app.models.message import Message
from app.models.agent import Agent
from app.core.config import settings

router = APIRouter(prefix="/chat", tags=["Chat"])

logger = logging.getLogger(__name__)
active_connections = defaultdict(dict)
MAX_CONNECTIONS_PER_USER = 5

async def validate_websocket_token(token: str, db: AsyncSession) -> Optional[User]:
    """Validate JWT token for WebSocket connections"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None

        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()
    except JWTError:
        return None

@router.websocket("/{agent_id}/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    agent_id: UUID,
    token: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    await websocket.accept()
    logger.info(f"WebSocket connection opened for agent {agent_id}")

    try:
        user = await validate_websocket_token(token, db)
        if not user:
            logger.warning("Invalid token, closing connection")
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        agent = await db.execute(
            select(Agent)
            .where(Agent.id == agent_id, Agent.owner_id == user.id)
        )
        agent = agent.scalar_one_or_none()

        if not agent:
            logger.warning(f"Agent {agent_id} not found or access denied")
            await websocket.close(
                code=status.WS_1008_POLICY_VIOLATION,
                reason="Agent not found"
            )
            return

        logger.info(f"WebSocket authenticated for user {user.id} and agent {agent_id}")

        qa_chain = await get_qa_chain(agent_id, db, user.id)
        last_ping = time.time()

        while True:
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=30)

                if data == "ping":
                    await websocket.send_text("pong")
                    last_ping = time.time()
                    continue

                response = await qa_chain(data)
                await websocket.send_text(response)

            except asyncio.TimeoutError:
                if time.time() - last_ping > 25:
                    try:
                        await websocket.send_text("ping")
                        last_ping = time.time()
                    except:
                        break
                continue

            except WebSocketDisconnect:
                logger.info("Client disconnected normally")
                break

            except Exception as e:
                logger.error(f"WebSocket error: {str(e)}", exc_info=True)
                try:
                    await websocket.send_text(f"Error: {str(e)}")
                except:
                    break
                continue

    except Exception as e:
        logger.error(f"WebSocket setup failed: {str(e)}", exc_info=True)
    finally:
        try:
            await websocket.close()
        except:
            pass
        logger.info("WebSocket connection closed")
```

---



## 📄 backend\app\api\v1\database.py

```py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from uuid import UUID
import asyncpg

router = APIRouter(prefix="/database", tags=["Database"])

class DatabaseConnection(BaseModel):
    agent_id: UUID
    db_type: str = "postgresql"
    host: str
    port: int = 5432
    database: str
    username: str
    password: str
    schema: str = "public"

@router.post("/connect")
async def connect_database(
    connection: DatabaseConnection,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Test and save a database connection for an agent"""
    try:
        conn = await asyncpg.connect(
            host=connection.host,
            port=connection.port,
            user=connection.username,
            password=connection.password,
            database=connection.database
        )
        await conn.close()

        db_conn = DatabaseConnectionModel(
            agent_id=connection.agent_id,
            connection_string=f"postgresql://{connection.username}:{connection.password}@{connection.host}:{connection.port}/{connection.database}",
            schema=connection.schema
        )
        db.add(db_conn)
        await db.commit()

        return {"status": "success"}
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Database connection failed: {str(e)}"
        )
```

---



## 📄 backend\app\api\v1\documents.py

```py
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.db.session import get_db
from app.api.deps import get_current_user
from app.schemas.document import DocumentResponse
from app.models.user import User
from app.services.document import process_document
from app.models.document import Document

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.get("/agent", response_model=list[DocumentResponse])
async def get_agent_documents(
    agent_id: UUID = Query(..., alias="agent_id"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        from sqlmodel import select
        statement = select(Document).where(Document.agent_id == agent_id)
        result = await db.execute(statement)
        documents = result.scalars().all()
        return documents
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    agent_id: UUID = Form(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        doc = await process_document(str(agent_id), file, db)
        return doc
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{document_id}", status_code=204)
async def delete_document(
    document_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        from sqlmodel import delete
        await db.execute(delete(Document).where(Document.id == document_id))
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
```

---



## 📄 backend\app\core\config.py

```py
from pydantic import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Agent Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    POSTGRES_HOST: str
    POSTGRES_PORT: int
    POSTGRES_DB: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str

    DEBUG: bool = False  # ← Add this
    IS_SERVERLESS: bool = False  # ← Add this

    class Config:
        env_file = ".env"

settings = Settings()
```

---



## 📄 backend\app\core\security.py

```py
from datetime import datetime, timedelta
from jose import jwt, JWTError
from app.core.config import settings
from uuid import UUID

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_access_token(token: str):
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None
```

---



## 📄 backend\app\db\init_db.py

```py
import logging
from sqlmodel import SQLModel
from app.db.session import async_engine
from app.models.user import User  # Import all models
from app.models.agent import Agent
from app.models.document import Document
from app.models.message import Message

logger = logging.getLogger(__name__)

async def create_db_and_tables():
    try:
        async with async_engine.begin() as conn:
            logger.info("Dropping existing tables...")
            await conn.run_sync(SQLModel.metadata.drop_all)
            logger.info("Creating fresh tables...")
            await conn.run_sync(SQLModel.metadata.create_all)
            logger.info("Tables created successfully")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise
```

---



## 📄 backend\app\db\session.py

```py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

DEBUG_MODE = getattr(settings, "DEBUG", False)
SERVERLESS_MODE = getattr(settings, "IS_SERVERLESS", False)

DATABASE_URL = (
    f"postgresql+asyncpg://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}"
    f"@{settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}"
)

async_engine = create_async_engine(
    DATABASE_URL,
    echo=DEBUG_MODE,  # Only log SQL in debug mode
    pool_pre_ping=True,   # Checks connection health
    pool_size=20,         # Default pool size
    max_overflow=10,      # Allow temporary overflow
    pool_timeout=30,      # 30 sec timeout
    pool_recycle=3600,    # Recycle connections every hour
    pool_use_lifo=True,   # Better for FastAPI's request/response cycle
    future=True,
    poolclass=NullPool if settings.IS_SERVERLESS else None
)

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,  # Essential for SQLModel
    autoflush=False
)

async def get_db() -> AsyncSession:
    """
    Yields an async database session with automatic cleanup.
    Usage:
    ```python
    async def endpoint(db: AsyncSession = Depends(get_db)):
    ```
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()  # Commit if no exceptions
        except Exception:
            await session.rollback()  # Rollback on errors
            raise
        finally:
            await session.close()  # Return connection to pool

def get_sync_db():
    """
    Warning: Mixing sync/async can cause deadlocks!
    Only use for:
    - CLI scripts
    - Legacy sync code
    - During migrations
    """
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    sync_url = DATABASE_URL.replace("+asyncpg", "")
    sync_engine = create_engine(
        sync_url,
        pool_pre_ping=True,
        echo=settings.DEBUG
    )

    SessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=sync_engine
    )

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---



## 📄 backend\app\models\agent.py

```py
from sqlmodel import SQLModel, Field, Relationship
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional

class Agent(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    description: str = "A specialized AI assistant focused on provided documents"
    instructions: str = (
        "You are a helpful AI assistant that answers questions strictly based on the provided documents. "
        "If a question is unrelated to the documents, respond with: "
        "\"I'm sorry, I can only answer questions related to the documents I was trained on.\" "
        "Never make up answers or speculate beyond the document content. "
        "When answering, always cite which document the information came from."
    )
    owner_id: UUID = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    owner: Optional["User"] = Relationship(back_populates="agents")
```

---



## 📄 backend\app\models\document.py

```py
from sqlmodel import SQLModel, Field
from uuid import uuid4, UUID
from datetime import datetime

class Document(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    agent_id: UUID
    filename: str
    content_type: str
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
```

---



## 📄 backend\app\models\message.py

```py
from sqlmodel import SQLModel, Field
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional

class Message(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    agent_id: UUID
    content: str
    is_user: bool
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

---



## 📄 backend\app\models\user.py

```py
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from uuid import uuid4, UUID
from datetime import datetime

if TYPE_CHECKING:
    from app.models.agent import Agent  # type: ignore

class User(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    is_active: bool = Field(default=True)
    is_admin: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    agents: Optional[List["Agent"]] = Relationship(back_populates="owner")

    def verify_password(self, password: str) -> bool:
        from app.utils.hashing import verify_password
        return verify_password(password, self.hashed_password)
```

---



## 📄 backend\app\schemas\agent.py

```py
from pydantic import BaseModel, Field, validator
from uuid import UUID
from datetime import datetime

class AgentCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    description: str = Field(
        default="A specialized AI assistant focused on provided documents",
        max_length=500
    )
    instructions: str = Field(
        default=(
            "Answer questions strictly based on provided documents. "
            "For unrelated questions, say you can't answer."
        ),
        max_length=2000
    )

    @validator('instructions')
    def validate_instructions(cls, v):
        if "unrelated" not in v.lower() and "context" not in v.lower():
            raise ValueError("Instructions must include guidance for handling unrelated questions")
        return v

class AgentOut(BaseModel):
    id: UUID
    name: str
    description: str
    instructions: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
```

---



## 📄 backend\app\schemas\auth.py

```py
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)

    @validator('password')
    def password_complexity(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UpdateEmailRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)

    @validator('password')
    def password_complexity(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v

class UpdatePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=8)
    new_password: str = Field(..., min_length=8)

    @validator('new_password')
    def passwords_match(cls, v, values):
        if 'current_password' in values and v == values['current_password']:
            raise ValueError('New password must be different from current password')
        return v

    @validator('new_password')
    def password_complexity(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v

class UserBase(BaseModel):
    email: EmailStr
    is_active: Optional[bool] = True
    is_admin: Optional[bool] = False

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

    @validator('password')
    def password_complexity(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v

class UserOut(UserBase):
    id: str
    created_at: str

    class Config:
        orm_mode = True
```

---



## 📄 backend\app\schemas\chat.py

```py
from pydantic import BaseModel
from uuid import UUID

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    answer: str
```

---



## 📄 backend\app\schemas\document.py

```py
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class DocumentResponse(BaseModel):
    id: UUID
    filename: str
    content_type: str
    uploaded_at: datetime

    class Config:
        orm_mode = True
```

---



## 📄 backend\app\services\auth.py

```py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.models.user import User
from app.utils.hashing import hash_password, verify_password
from app.core.security import create_access_token
from datetime import timedelta
from app.core.config import settings

async def register_user(db: AsyncSession, email: str, password: str) -> User:
    normalized_email = email.lower().strip()
    result = await db.execute(select(User).where(User.email == normalized_email))
    if result.scalar_one_or_none():
        raise ValueError("User already exists")

    hashed_pw = hash_password(password)
    new_user = User(email=normalized_email, hashed_password=hashed_pw)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

async def authenticate_user(db: AsyncSession, email: str, password: str):
    result = await db.execute(select(User).where(User.email == email.lower().strip()))
    user = result.scalar_one_or_none()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user

async def update_user_email(db: AsyncSession, user: User, new_email: str, password: str):
    if not verify_password(password, user.hashed_password):
        raise ValueError("Invalid password")

    result = await db.execute(select(User).where(User.email == new_email.lower().strip()))
    if result.scalar_one_or_none():
        raise ValueError("Email already in use")

    user.email = new_email.lower().strip()
    await db.commit()
    await db.refresh(user)
    return user

async def update_user_password(db: AsyncSession, user: User, current_password: str, new_password: str):
    if not verify_password(current_password, user.hashed_password):
        raise ValueError("Invalid current password")

    if current_password == new_password:
        raise ValueError("New password must be different from current password")

    user.hashed_password = hash_password(new_password)
    await db.commit()
    await db.refresh(user)
    return user

def generate_user_token(user: User) -> str:
    return create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
```

---



## 📄 backend\app\services\chat.py

```py
import asyncio
import json
from typing import Optional, Callable, Awaitable
from uuid import UUID
from datetime import datetime
import time
import logging

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, func
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OllamaEmbeddings
from langchain.prompts import PromptTemplate
from langchain_community.llms import Ollama
from langchain.chains import RetrievalQA

from app.models.user import User
from app.models.agent import Agent
from app.models.message import Message
from app.models.document import Document

logger = logging.getLogger(__name__)

async def store_message(
    db: AsyncSession,
    agent_id: UUID,
    user_id: UUID,
    content: str,
    is_user: bool,
    response_time: Optional[float] = None
) -> Message:
    """Store chat message in database with timing"""
    message = Message(
        agent_id=agent_id,
        user_id=user_id,
        content=content,
        is_user=is_user,
        response_time=response_time,
        created_at=datetime.utcnow()
    )
    db.add(message)
    await db.commit()
    await db.refresh(message)
    return message

async def get_chat_history(db: AsyncSession, agent_id: UUID, limit: int = 5) -> list[Message]:
    """Retrieve recent chat history for an agent"""
    statement = (
        select(Message)
        .where(Message.agent_id == agent_id)
        .order_by(Message.created_at.desc())
        .limit(limit)
    )
    result = await db.execute(statement)
    messages = result.scalars().all()
    return sorted(messages, key=lambda x: x.created_at)  # Return in chronological order

async def get_qa_chain(
    agent_id: UUID,
    db: AsyncSession,
    user_id: UUID
) -> Callable[[str], Awaitable[str]]:
    """Create and return an async QA chain with strict context enforcement"""
    try:
        agent_result = await db.execute(
            select(Agent)
            .where(Agent.id == agent_id, Agent.owner_id == user_id)
        )
        agent = agent_result.scalar_one_or_none()

        if not agent:
            raise ValueError("Agent not found or access denied")

        doc_count = await db.execute(
            select(func.count(Document.id))
            .where(Document.agent_id == agent_id)
        )
        has_documents = doc_count.scalar() > 0

        vectorstore = Chroma(
            collection_name="agent_store",
            embedding_function=OllamaEmbeddings(
                model="llama3",
                base_url="http://backend-ollama-1:11434"
            ),
        ).as_retriever(
            search_kwargs={
                "k": 5,
                "filter": {'agent_id': str(agent_id)}
            }
        )

        prompt_template = """You are {agent_name}, a specialized AI assistant focused on provided documents.

Role Guidelines:
- Only answer questions based on the provided context
- Maintain professional yet friendly tone
- Greet users warmly but briefly when conversation starts
- Never speculate or make up answers
- If unsure, say "I don't have information about that in my documents"
- For unrelated questions: "I specialize in {agent_name}. I can help with: {agent_name}"
- Always be concise and factual
- Never role-play or switch domains
- When answering:
   - Be concise but helpful
   - Cite sources when possible
   - Use bullet points for complex information

Current conversation:
{history}

Relevant context from documents:
{context}

Question: {query}

Strictly follow these rules when responding:"""

        prompt = PromptTemplate(
            template=prompt_template,
            input_variables=["agent_name", "history", "context", "query"]
        )

        llm = Ollama(
            model="llama3",
            base_url="http://backend-ollama-1:11434",
            temperature=0.2,  # Lower temperature for more focused responses
            top_p=0.85,
            top_k=40,
            repeat_penalty=1.2
        )

        async def custom_qa_chain(inputs: dict) -> str:
            """Custom chain with strict context enforcement"""
            if not has_documents:
                return ("I'm configured to answer based on documents, but no documents have been uploaded yet. "
                       "Please upload relevant documents first.")

            docs = await vectorstore.ainvoke(inputs["query"])
            if not docs:
                return "I don't have information about that in my documents."

            context = "\n\n".join(
                f"From {doc.metadata.get('filename', 'document')}:\n{doc.page_content}" 
                for doc in docs
            )

            formatted_prompt = await prompt.aformat(
                agent_name=inputs["agent_name"],
                history=inputs["history"],
                query=inputs["query"],
                context=context
            )

            response = await llm.ainvoke(formatted_prompt)
            return str(response)

        async def wrapped_chain(question: str) -> str:
            """Enhanced chain with message persistence and strict context control"""
            start_time = time.time()
            try:
                try:
                    message_data = json.loads(question)
                    query = message_data.get('query', '')
                except json.JSONDecodeError:
                    query = question

                await store_message(db, agent_id, user_id, query, True)

                history_messages = await get_chat_history(db, agent_id)
                history_str = "\n".join(
                    f"{'User' if m.is_user else 'AI'}: {m.content}"
                    for m in history_messages
                )

                inputs = {
                    "agent_name": agent.name,
                    "history": history_str,
                    "query": query
                }

                response = await custom_qa_chain(inputs)

                response_time = time.time() - start_time
                await store_message(
                    db,
                    agent_id,
                    user_id,
                    response,
                    False,
                    response_time
                )
                return response

            except Exception as e:
                await db.rollback()
                error_msg = f"Error processing question: {str(e)}"
                await store_message(
                    db,
                    agent_id,
                    user_id,
                    error_msg,
                    False,
                    time.time() - start_time
                )
                raise ValueError(error_msg) from e

        return wrapped_chain

    except Exception as e:
        logger.error(f"Error creating QA chain: {str(e)}", exc_info=True)
        raise
```

---



## 📄 backend\app\services\document.py

```py
import os
import uuid
from tempfile import NamedTemporaryFile
from shutil import copyfileobj
from fastapi import UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.utils.parser import extract_text
from app.utils.chunker import chunk_text
from app.utils.embedding import embed_chunks
from app.models.document import Document
from app.models.agent import Agent
import logging

logger = logging.getLogger(__name__)
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def process_document(agent_id: str, file: UploadFile, db: AsyncSession) -> Document:
    try:
        result = await db.execute(select(Agent).where(Agent.id == agent_id))
        agent = result.scalar_one_or_none()
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")

        path = save_upload_temp(file)
        logger.info(f"Saved temporary file at {path}")

        text = extract_text(path, file.content_type)
        if not text:
            raise ValueError("No text content extracted from file")

        chunks = chunk_text(text)
        doc_id = str(uuid.uuid4())

        embed_chunks(chunks, doc_id=doc_id, agent_id=agent_id)

        doc = Document(
            id=doc_id,
            filename=file.filename,
            content_type=file.content_type,
            agent_id=agent_id
        )
        db.add(doc)
        await db.commit()
        await db.refresh(doc)

        try:
            os.unlink(path)
        except Exception as e:
            logger.warning(f"Failed to delete temp file {path}: {str(e)}")

        return doc
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in process_document: {str(e)}", exc_info=True)
        raise

def save_upload_temp(file: UploadFile) -> str:
    try:
        suffix = os.path.splitext(file.filename)[1]
        with NamedTemporaryFile(delete=False, dir=UPLOAD_DIR, suffix=suffix) as tmp:
            copyfileobj(file.file, tmp)
            return tmp.name
    except Exception as e:
        raise ValueError(f"Failed to save temporary file: {str(e)}")
```

---



## 📄 backend\app\utils\chunker.py

```py
from langchain.text_splitter import RecursiveCharacterTextSplitter

def chunk_text(text: str, chunk_size=1000, chunk_overlap=200) -> list[str]:
    splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    return splitter.split_text(text)
```

---



## 📄 backend\app\utils\embedding.py

```py
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OllamaEmbeddings
from langchain.schema import Document as LC_Document

def embed_chunks(chunks: list[str], doc_id: str, agent_id: str):
    docs = [LC_Document(page_content=c, metadata={"agent_id": agent_id, "doc_id": doc_id}) for c in chunks]
    vectorstore = Chroma(collection_name="agent_store", embedding_function=OllamaEmbeddings(model="llama3", base_url="http://backend-ollama-1:11434"))
    vectorstore.add_documents(docs)
```

---



## 📄 backend\app\utils\hashing.py

```py
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

---



## 📄 backend\app\utils\parser.py

```py
from typing import Union
import fitz  
import docx

def extract_text_from_pdf(file_path: str) -> str:
    doc = fitz.open(file_path)
    return "\n".join([page.get_text() for page in doc])

def extract_text_from_docx(file_path: str) -> str:
    doc = docx.Document(file_path)
    return "\n".join([para.text for para in doc.paragraphs])

def extract_text_from_txt(file_path: str) -> str:
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()

def extract_text(file_path: str, content_type: str) -> str:
    if content_type == "application/pdf":
        return extract_text_from_pdf(file_path)
    elif content_type in ("application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"):
        return extract_text_from_docx(file_path)
    elif content_type == "text/plain":
        return extract_text_from_txt(file_path)
    else:
        raise ValueError("Unsupported file type")
```

---

# 🛠️ Config & Environment Files



## 📄 backend\.env

```env
# .env
PROJECT_NAME="AI Agent Platform"
API_V1_STR="/api/v1"
SECRET_KEY="super-secret-key"  # change for prod!
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=60

POSTGRES_HOST=db
POSTGRES_PORT=5432
POSTGRES_DB=aiagent
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```

---



## 📄 backend\Dockerfile

```txt
# backend/Dockerfile
FROM python:3.11

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---



## 📄 backend\docker-compose.yml

```yml
version: '3.9'

services:
  backend:
    build: .
    container_name: backend
    ports:
      - "8000:8000"
    volumes:
      - .:/app
    env_file:
      - .env
    depends_on:
      - db
      - chroma
      - ollama

  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: aiagent
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  chroma:
    image: chromadb/chroma
    ports:
      - "8001:8000"
    volumes:
      - chroma_data:/chroma
    restart: always

  ollama:
    image: ollama/ollama
    privileged: true
    ports:
      - "11434:11434"
    volumes:
      - ollama:/root/.ollama
    restart: always

volumes:
  pgdata:
  chroma_data:
  ollama:
```

---



## 📄 backend\requirements.txt

```txt
# requirements.txt
# FastAPI Core
fastapi
uvicorn[standard]
pydantic[email]==1.10.13
python-dotenv

# Auth & Security
python-jose[cryptography]
passlib[bcrypt]
bcrypt

# ORM (Updated for async support)
sqlmodel
sqlalchemy[asyncio]
asyncpg  # Replaces psycopg2-binary for async
alembic  # For migrations

# LangChain & RAG
langchain
langchain-community
chromadb
unstructured
pymupdf
python-docx

# Ollama Local LLM Integration
httpx

# Background & Tasks
aiofiles

# Utils
uuid
python-multipart

# Dev Tools
ipython
ruff
black
```

---



## 📄 frontend\vite.config.ts

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
```

---



## 📄 frontend\tailwind.config.js

```js
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      }
    }
  }
}
```

---
