/**
 * WebSocket client utilities for real-time features.
 */

export interface WebSocketMessage {
  type: string;
  data?: any;
  [key: string]: any;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private onConnectCallbacks: Set<() => void> = new Set();
  private onDisconnectCallbacks: Set<() => void> = new Set();

  constructor(url: string) {
    this.url = url;
  }

  connect(token?: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    try {
      // Add token to URL if provided
      const wsUrl = token ? `${this.url}?token=${token}` : this.url;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.onConnectCallbacks.forEach(callback => callback());
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.onDisconnectCallbacks.forEach(callback => callback());
        this.attemptReconnect(token);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.attemptReconnect(token);
    }
  }

  private attemptReconnect(token?: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      this.connect(token);
    }, delay);
  }

  private handleMessage(message: WebSocketMessage): void {
    const listeners = this.listeners.get(message.type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(message.data || message);
        } catch (error) {
          console.error(`Error in message listener for ${message.type}:`, error);
        }
      });
    }

    // Also trigger 'message' listeners for all messages
    const allListeners = this.listeners.get('message');
    if (allListeners) {
      allListeners.forEach(listener => {
        try {
          listener(message);
        } catch (error) {
          console.error('Error in message listener:', error);
        }
      });
    }
  }

  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  onConnect(callback: () => void): void {
    this.onConnectCallbacks.add(callback);
  }

  onDisconnect(callback: () => void): void {
    this.onDisconnectCallbacks.add(callback);
  }

  send(type: string, data?: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...data }));
    } else {
      console.warn('WebSocket is not connected. Message not sent:', type);
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
    this.onConnectCallbacks.clear();
    this.onDisconnectCallbacks.clear();
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

/**
 * Create WebSocket client for consultation chat.
 */
export function createChatWebSocket(consultationId: string, token: string): WebSocketClient {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
  const wsUrl = apiUrl.replace(/^http/, 'ws') + `/ws/chat/${consultationId}/`;
  return new WebSocketClient(wsUrl);
}

/**
 * Create WebSocket client for notifications.
 */
export function createNotificationWebSocket(token: string): WebSocketClient {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
  const wsUrl = apiUrl.replace(/^http/, 'ws') + '/ws/notifications/';
  return new WebSocketClient(wsUrl);
}

/**
 * Create WebSocket client for presence tracking.
 */
export function createPresenceWebSocket(token: string): WebSocketClient {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
  const wsUrl = apiUrl.replace(/^http/, 'ws') + '/ws/presence/';
  return new WebSocketClient(wsUrl);
}

