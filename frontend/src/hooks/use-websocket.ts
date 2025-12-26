/**
 * React hook for WebSocket connections.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketClient } from '@/lib/websocket';

export function useWebSocket(url: string, token?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const wsRef = useRef<WebSocketClient | null>(null);

  useEffect(() => {
    const ws = new WebSocketClient(url);
    wsRef.current = ws;

    ws.onConnect(() => {
      setIsConnected(true);
    });

    ws.onDisconnect(() => {
      setIsConnected(false);
    });

    ws.on('message', (data) => {
      setLastMessage(data);
    });

    ws.connect(token);

    return () => {
      ws.disconnect();
    };
  }, [url, token]);

  const send = useCallback((type: string, data?: any) => {
    if (wsRef.current) {
      wsRef.current.send(type, data);
    }
  }, []);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    if (wsRef.current) {
      wsRef.current.on(event, callback);
    }
  }, []);

  const off = useCallback((event: string, callback: (data: any) => void) => {
    if (wsRef.current) {
      wsRef.current.off(event, callback);
    }
  }, []);

  return {
    isConnected,
    lastMessage,
    send,
    on,
    off,
  };
}

