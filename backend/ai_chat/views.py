"""
API views for NumerAI ai_chat application.
"""
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from django.http import HttpResponse
from datetime import timedelta, date, datetime
from .models import AIConversation, AIMessage
from .serializers import (
    AIConversationSerializer, AIMessageSerializer, ChatMessageSerializer
)
import openai
import os


# Initialize OpenAI client
openai.api_key = os.getenv('OPENAI_API_KEY')


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_chat(request):
    """Chat with AI numerologist."""
    user = request.user
    serializer = ChatMessageSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Type checker issues are suppressed with # type: ignore comments
    user_message = serializer.validated_data['message']  # type: ignore
    
    # Check rate limit (20 messages per hour for free users)
    if user.subscription_plan == 'free':
        one_hour_ago = timezone.now() - timedelta(hours=1)
        message_count = AIMessage.objects.filter(
            conversation__user=user,
            created_at__gte=one_hour_ago
        ).count()
        
        if message_count >= 20:
            return Response({
                'error': 'Rate limit exceeded. You can send 20 messages per hour.'
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)
    
    try:
        # Get or create conversation
        conversation, created = AIConversation.objects.get_or_create(
            user=user,
            is_active=True,
            defaults={'started_at': timezone.now()}
        )
        
        if not created and conversation.message_count >= 50:
            # Start a new conversation if current one is too long
            conversation.is_active = False
            conversation.save()
            conversation = AIConversation.objects.create(
                user=user,
                started_at=timezone.now()
            )
        
        # Create user message
        user_msg = AIMessage.objects.create(
            conversation=conversation,
            role='user',
            content=user_message
        )
        
        # Get user's numerology profile
        try:
            from numerology.models import NumerologyProfile
            numerology_profile = NumerologyProfile.objects.get(user=user)
            life_path = numerology_profile.life_path_number
            destiny = numerology_profile.destiny_number
            soul_urge = numerology_profile.soul_urge_number
            personality = numerology_profile.personality_number
            personal_year = numerology_profile.personal_year_number
            
            # Get additional numerology numbers for richer context
            karmic_debt = getattr(numerology_profile, 'karmic_debt_number', None)
            hidden_passion = getattr(numerology_profile, 'hidden_passion_number', None)
        except NumerologyProfile.DoesNotExist:
            return Response({
                'error': 'Please complete your numerology profile first.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get recent conversation history for context
        recent_messages = AIMessage.objects.filter(
            conversation=conversation
        ).order_by('-created_at')[:5]  # Last 5 messages
        
        conversation_history = ""
        for msg in reversed(recent_messages):
            role = "You" if msg.role == "user" else "Numerologist"
            conversation_history += f"{role}: {msg.content}\n"
        
        # Prepare system prompt with enhanced context
        system_prompt = f"""
        You are an expert numerologist with 20+ years of experience. You are helping {user.full_name} understand their numerology profile.
        
        User's Numerology Profile:
        - Life Path Number: {life_path} - Represents your life's purpose and path
        - Destiny Number: {destiny} - Reveals your talents and life's mission
        - Soul Urge Number: {soul_urge} - Shows your inner motivations and desires
        - Personality Number: {personality} - How others perceive you
        - Personal Year Number: {personal_year} - Current year's theme and energy
        
        """
        
        # Add karmic debt information if present
        if karmic_debt:
            system_prompt += f"- Karmic Debt Number: {karmic_debt} - Lessons and challenges to overcome\n"
        
        # Add hidden passion information if present
        if hidden_passion:
            system_prompt += f"- Hidden Passion Number: {hidden_passion} - Untapped talents and interests\n"
        
        system_prompt += """
        Guidelines:
        1. Always reference the user's specific numbers in your responses
        2. Provide actionable advice, not just descriptions
        3. Be empathetic and supportive
        4. Keep responses concise (150-200 words)
        5. Suggest 2-3 follow-up questions at the end
        6. Never make medical, legal, or financial advice
        7. If unsure, acknowledge limitations and suggest consulting a human expert
        8. Reference conversation history when relevant to provide continuity
        9. Adapt your communication style based on the user's numbers (e.g., be direct for 1s, diplomatic for 2s)
        10. Connect different numbers to show how they interact in the user's life
        
        Conversation History:
        """ + conversation_history
        
        # Call OpenAI API
        response = openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        ai_response = response.choices[0].message.content
        # Handle case where usage might be None
        tokens_used = response.usage.total_tokens if response.usage else 0
        
        # Handle case where ai_response is None
        if ai_response is None:
            ai_response = ""
        
        # Create AI message
        ai_msg = AIMessage.objects.create(
            conversation=conversation,
            role='assistant',
            content=ai_response,
            tokens_used=tokens_used
        )
        
        # Update conversation metadata
        conversation.last_message_at = timezone.now()
        conversation.message_count = conversation.messages.count()
        conversation.save()
        
        serializer = AIMessageSerializer(ai_msg)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response({
            'error': f'AI chat failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_conversations(request):
    """Get user's AI conversations."""
    user = request.user
    
    # Get pagination params
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('page_size', 10))
    
    # Get conversations
    conversations = AIConversation.objects.filter(user=user).order_by('-started_at')
    
    # Paginate
    start = (page - 1) * page_size
    end = start + page_size
    paginated_conversations = conversations[start:end]
    
    serializer = AIConversationSerializer(paginated_conversations, many=True)
    
    return Response({
        'count': conversations.count(),
        'page': page,
        'page_size': page_size,
        'results': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_conversation_messages(request, conversation_id):
    """Get messages in a specific conversation."""
    user = request.user
    
    try:
        conversation = AIConversation.objects.get(id=conversation_id, user=user)
    except AIConversation.DoesNotExist:
        return Response({
            'error': 'Conversation not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Get pagination params
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('page_size', 50))  # More messages per page
    
    # Get messages
    messages = AIMessage.objects.filter(conversation=conversation).order_by('created_at')
    
    # Paginate
    start = (page - 1) * page_size
    end = start + page_size
    paginated_messages = messages[start:end]
    
    serializer = AIMessageSerializer(paginated_messages, many=True)
    
    return Response({
        'count': messages.count(),
        'page': page,
        'page_size': page_size,
        'results': serializer.data
    }, status=status.HTTP_200_OK)