// frontend/src/pages/agents/ChatInterface.tsx
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

      // Start ping interval
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
      
      // Remove typing indicator when response arrives
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
        // Add typing indicator after a short delay
        typingIndicatorRef.current = setTimeout(() => {
          addTypingIndicator();
        }, 500);

        // Send the message
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



