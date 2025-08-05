// frontend/src/hooks/useWebSocket.ts
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




