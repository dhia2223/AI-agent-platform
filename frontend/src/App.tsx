// frontend/src/App.tsx
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