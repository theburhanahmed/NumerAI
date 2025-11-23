"""
URL routing for ai_chat application.
"""
from django.urls import path
from . import views

app_name = 'ai_chat'

urlpatterns = [
    # AI Chat endpoints
    path('ai/chat/', views.ai_chat, name='ai-chat'),
    path('ai/conversations/', views.get_conversations, name='ai-conversations'),
    path('ai/conversations/<uuid:conversation_id>/messages/', views.get_conversation_messages, name='ai-conversation-messages'),
]