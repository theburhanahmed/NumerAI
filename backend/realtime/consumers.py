"""
WebSocket consumers for real-time features.
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.utils import timezone
from consultations.models import Consultation, ExpertChatMessage, ExpertChatConversation
from accounts.models import Notification
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time chat in consultations."""
    
    async def connect(self):
        """Handle WebSocket connection."""
        self.consultation_id = self.scope['url_route']['kwargs']['consultation_id']
        self.room_group_name = f'chat_{self.consultation_id}'
        self.user = self.scope.get('user')
        
        # Check authentication
        if isinstance(self.user, AnonymousUser):
            await self.close()
            return
        
        # Verify user has access to this consultation
        has_access = await self.check_consultation_access(self.user, self.consultation_id)
        if not has_access:
            await self.close()
            return
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send connection confirmation
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Connected to chat',
            'consultation_id': self.consultation_id
        }))
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Receive message from WebSocket."""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'chat_message':
                await self.handle_chat_message(data)
            elif message_type == 'typing':
                await self.handle_typing_indicator(data)
            elif message_type == 'read_receipt':
                await self.handle_read_receipt(data)
        except json.JSONDecodeError:
            logger.error("Invalid JSON received")
        except Exception as e:
            logger.error(f"Error handling message: {str(e)}", exc_info=True)
    
    async def handle_chat_message(self, data):
        """Handle incoming chat message."""
        message_text = data.get('message', '').strip()
        if not message_text:
            return
        
        # Save message to database
        message = await self.save_message(
            self.consultation_id,
            self.user.id,
            message_text
        )
        
        if message:
            # Broadcast message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': {
                        'id': str(message['id']),
                        'sender_id': str(message['sender_id']),
                        'sender_name': message['sender_name'],
                        'content': message['content'],
                        'created_at': message['created_at'],
                        'message_type': message.get('message_type', 'text'),
                    }
                }
            )
    
    async def handle_typing_indicator(self, data):
        """Handle typing indicator."""
        is_typing = data.get('is_typing', False)
        
        # Broadcast typing indicator to room group (except sender)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'typing_indicator',
                'user_id': str(self.user.id),
                'user_name': self.user.full_name or self.user.email,
                'is_typing': is_typing
            }
        )
    
    async def handle_read_receipt(self, data):
        """Handle read receipt."""
        message_id = data.get('message_id')
        if message_id:
            await self.mark_message_read(message_id, self.user.id)
    
    async def chat_message(self, event):
        """Send chat message to WebSocket."""
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'data': event['message']
        }))
    
    async def typing_indicator(self, event):
        """Send typing indicator to WebSocket."""
        # Don't send typing indicator back to the sender
        if str(event['user_id']) != str(self.user.id):
            await self.send(text_data=json.dumps({
                'type': 'typing_indicator',
                'user_id': event['user_id'],
                'user_name': event['user_name'],
                'is_typing': event['is_typing']
            }))
    
    @database_sync_to_async
    def check_consultation_access(self, user, consultation_id):
        """Check if user has access to consultation."""
        try:
            consultation = Consultation.objects.get(id=consultation_id)
            # User can access if they are the client or the expert
            return (
                consultation.user == user or
                (consultation.expert and consultation.expert.user == user) or
                user.is_staff
            )
        except Consultation.DoesNotExist:
            return False
    
    @database_sync_to_async
    def save_message(self, consultation_id, user_id, content):
        """Save message to database."""
        try:
            consultation = Consultation.objects.get(id=consultation_id)
            
            # Get or create conversation
            conversation, created = ExpertChatConversation.objects.get_or_create(
                consultation=consultation,
                defaults={'created_by_id': user_id}
            )
            
            # Create message
            message = ExpertChatMessage.objects.create(
                conversation=conversation,
                sender_id=user_id,
                content=content,
                message_type='text'
            )
            
            return {
                'id': message.id,
                'sender_id': user_id,
                'sender_name': message.sender.full_name or message.sender.email,
                'content': message.content,
                'created_at': message.created_at.isoformat(),
                'message_type': message.message_type,
            }
        except Exception as e:
            logger.error(f"Error saving message: {str(e)}", exc_info=True)
            return None
    
    @database_sync_to_async
    def mark_message_read(self, message_id, user_id):
        """Mark message as read."""
        try:
            message = ExpertChatMessage.objects.get(id=message_id)
            # Only mark as read if user is not the sender
            if message.sender_id != user_id:
                message.is_read = True
                message.read_at = timezone.now()
                message.save(update_fields=['is_read', 'read_at'])
        except ExpertChatMessage.DoesNotExist:
            pass


class NotificationConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time notifications."""
    
    async def connect(self):
        """Handle WebSocket connection."""
        self.user = self.scope.get('user')
        
        # Check authentication
        if isinstance(self.user, AnonymousUser):
            await self.close()
            return
        
        self.room_group_name = f'notifications_{self.user.id}'
        
        # Join user's notification group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send connection confirmation
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Connected to notifications'
        }))
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Receive message from WebSocket."""
        try:
            data = json.loads(text_data)
            if data.get('type') == 'mark_read':
                notification_id = data.get('notification_id')
                if notification_id:
                    await self.mark_notification_read(notification_id)
        except json.JSONDecodeError:
            logger.error("Invalid JSON received")
    
    async def notification_message(self, event):
        """Send notification to WebSocket."""
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'data': event['notification']
        }))
    
    @database_sync_to_async
    def mark_notification_read(self, notification_id):
        """Mark notification as read."""
        try:
            notification = Notification.objects.get(id=notification_id, user=self.user)
            notification.is_read = True
            notification.save(update_fields=['is_read'])
        except Notification.DoesNotExist:
            pass


class PresenceConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for user presence tracking."""
    
    async def connect(self):
        """Handle WebSocket connection."""
        self.user = self.scope.get('user')
        
        # Check authentication
        if isinstance(self.user, AnonymousUser):
            await self.close()
            return
        
        self.room_group_name = 'presence'
        
        # Join presence group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Broadcast user online status
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_online',
                'user_id': str(self.user.id),
                'user_name': self.user.full_name or self.user.email,
            }
        )
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        # Broadcast user offline status
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_offline',
                'user_id': str(self.user.id),
            }
        )
        
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def user_online(self, event):
        """Handle user online event."""
        # Don't send own status
        if str(event['user_id']) != str(self.user.id):
            await self.send(text_data=json.dumps({
                'type': 'user_online',
                'user_id': event['user_id'],
                'user_name': event['user_name'],
            }))
    
    async def user_offline(self, event):
        """Handle user offline event."""
        # Don't send own status
        if str(event['user_id']) != str(self.user.id):
            await self.send(text_data=json.dumps({
                'type': 'user_offline',
                'user_id': event['user_id'],
            }))

