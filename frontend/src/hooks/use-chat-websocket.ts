/**
 * React hook for consultation chat WebSocket.
 */
import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { createChatWebSocket, WebSocketClient } from '@/lib/websocket';

export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
  message_type?: string;
}

export function useChatWebSocket(consultationId: string | null) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const wsRef = useRef<WebSocketClient | null>(null);

  useEffect(() => {
    if (!consultationId || !user) {
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      return;
    }

    const ws = createChatWebSocket(consultationId, token);
    wsRef.current = ws;

    ws.onConnect(() => {
      setIsConnected(true);
    });

    ws.onDisconnect(() => {
      setIsConnected(false);
    });

    ws.on('chat_message', (data: ChatMessage) => {
      setMessages(prev => [...prev, data]);
    });

    ws.on('typing_indicator', (data: { user_id: string; user_name: string; is_typing: boolean }) => {
      setTypingUsers(prev => {
        const next = new Set(prev);
        if (data.is_typing) {
          next.add(data.user_id);
        } else {
          next.delete(data.user_id);
        }
        return next;
      });
    });

    ws.connect(token);

    return () => {
      ws.disconnect();
    };
  }, [consultationId, user]);

  const sendMessage = useCallback((content: string) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send('chat_message', { message: content });
    }
  }, [isConnected]);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send('typing', { is_typing: isTyping });
    }
  }, [isConnected]);

  const markAsRead = useCallback((messageId: string) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send('read_receipt', { message_id: messageId });
    }
  }, [isConnected]);

  return {
    isConnected,
    messages,
    typingUsers,
    sendMessage,
    sendTyping,
    markAsRead,
  };
}

