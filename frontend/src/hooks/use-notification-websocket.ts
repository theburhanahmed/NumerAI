/**
 * React hook for real-time notifications via WebSocket.
 */
import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { createNotificationWebSocket, WebSocketClient } from '@/lib/websocket';

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
}

export function useNotificationWebSocket() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const wsRef = useRef<WebSocketClient | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      return;
    }

    const ws = createNotificationWebSocket(token);
    wsRef.current = ws;

    ws.onConnect(() => {
      setIsConnected(true);
    });

    ws.onDisconnect(() => {
      setIsConnected(false);
    });

    ws.on('notification', (data: NotificationData) => {
      setNotifications(prev => [data, ...prev]);
      if (!data.is_read) {
        setUnreadCount(prev => prev + 1);
      }
    });

    ws.on('unread_count', (data: { count: number }) => {
      setUnreadCount(data.count);
    });

    ws.connect(token);

    return () => {
      ws.disconnect();
    };
  }, [user]);

  const markAsRead = useCallback((notificationId: string) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send('mark_read', { notification_id: notificationId });
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, [isConnected]);

  return {
    isConnected,
    notifications,
    unreadCount,
    markAsRead,
  };
}

