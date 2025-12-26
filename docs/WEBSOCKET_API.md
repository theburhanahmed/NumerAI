# WebSocket API Documentation

## Overview

NumerAI provides WebSocket support for real-time features including chat, notifications, and presence tracking.

## Connection

WebSocket connections use the same authentication as REST API (JWT tokens).

### Base URLs

- **Development**: `ws://localhost:8000/ws/`
- **Production**: `wss://api.numerobuddy.com/ws/`

## Authentication

Include the JWT token as a query parameter:

```
ws://localhost:8000/ws/chat/{consultation_id}/?token={jwt_token}
```

Or use the Authorization header (if supported by your WebSocket client).

## Endpoints

### 1. Consultation Chat

**URL**: `/ws/chat/{consultation_id}/`

**Purpose**: Real-time chat for consultations

**Connection**:
```javascript
const ws = new WebSocket(`ws://api.numerobuddy.com/ws/chat/${consultationId}/?token=${token}`);
```

**Messages Sent**:

1. **Chat Message**
```json
{
  "type": "chat_message",
  "message": "Hello, how can I help?"
}
```

2. **Typing Indicator**
```json
{
  "type": "typing",
  "is_typing": true
}
```

3. **Read Receipt**
```json
{
  "type": "read_receipt",
  "message_id": "uuid"
}
```

**Messages Received**:

1. **Connection Established**
```json
{
  "type": "connection_established",
  "message": "Connected to chat",
  "consultation_id": "uuid"
}
```

2. **Chat Message**
```json
{
  "type": "chat_message",
  "data": {
    "id": "uuid",
    "sender_id": "uuid",
    "sender_name": "John Doe",
    "content": "Hello!",
    "created_at": "2024-01-15T10:00:00Z",
    "message_type": "text"
  }
}
```

3. **Typing Indicator**
```json
{
  "type": "typing_indicator",
  "user_id": "uuid",
  "user_name": "Jane Doe",
  "is_typing": true
}
```

### 2. Notifications

**URL**: `/ws/notifications/`

**Purpose**: Real-time notifications

**Connection**:
```javascript
const ws = new WebSocket(`ws://api.numerobuddy.com/ws/notifications/?token=${token}`);
```

**Messages Sent**:

1. **Mark as Read**
```json
{
  "type": "mark_read",
  "notification_id": "uuid"
}
```

**Messages Received**:

1. **Connection Established**
```json
{
  "type": "connection_established",
  "message": "Connected to notifications"
}
```

2. **Notification**
```json
{
  "type": "notification",
  "data": {
    "id": "uuid",
    "title": "Daily Reading Ready",
    "message": "Your daily reading is available",
    "notification_type": "daily_reading",
    "is_read": false,
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

3. **Unread Count**
```json
{
  "type": "unread_count",
  "count": 5
}
```

### 3. Presence Tracking

**URL**: `/ws/presence/`

**Purpose**: Track user online/offline status

**Connection**:
```javascript
const ws = new WebSocket(`ws://api.numerobuddy.com/ws/presence/?token=${token}`);
```

**Messages Received**:

1. **User Online**
```json
{
  "type": "user_online",
  "user_id": "uuid",
  "user_name": "John Doe"
}
```

2. **User Offline**
```json
{
  "type": "user_offline",
  "user_id": "uuid"
}
```

## Frontend Usage

### Using the WebSocket Client

```typescript
import { createChatWebSocket } from '@/lib/websocket';

const ws = createChatWebSocket(consultationId, token);

ws.onConnect(() => {
  console.log('Connected to chat');
});

ws.on('chat_message', (data) => {
  console.log('New message:', data);
});

ws.send('chat_message', { message: 'Hello!' });
```

### Using React Hooks

```typescript
import { useChatWebSocket } from '@/hooks/use-chat-websocket';

function ChatComponent({ consultationId }) {
  const { isConnected, messages, sendMessage, sendTyping } = 
    useChatWebSocket(consultationId);

  return (
    <div>
      {isConnected ? 'Connected' : 'Disconnected'}
      {messages.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
      <button onClick={() => sendMessage('Hello!')}>Send</button>
    </div>
  );
}
```

## Error Handling

WebSocket connections automatically reconnect with exponential backoff:
- Initial delay: 1 second
- Max attempts: 5
- Backoff: 2^n seconds

## Best Practices

1. **Handle Disconnections**: Always handle connection drops gracefully
2. **Reconnection**: Use exponential backoff for reconnections
3. **Message Queuing**: Queue messages when disconnected
4. **Cleanup**: Close connections when components unmount
5. **Error Handling**: Handle WebSocket errors appropriately

## Limitations

- Maximum message size: 64KB
- Connection timeout: 60 seconds of inactivity
- Rate limiting: Same as REST API (300 requests/minute for authenticated users)

## Support

For WebSocket support, contact: api-support@numerobuddy.com

