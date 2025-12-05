"""
URL routing for consultations application.
"""
from django.urls import path
from . import views

app_name = 'consultations'

urlpatterns = [
    # Expert endpoints
    path('experts/', views.get_experts, name='experts'),
    path('experts/<uuid:expert_id>/', views.get_expert, name='expert-detail'),
    path('experts/<uuid:expert_id>/availability/', views.get_expert_availability, name='expert-availability'),
    path('experts/<uuid:expert_id>/time-slots/', views.get_available_time_slots, name='expert-time-slots'),
    path('experts/dashboard/', views.expert_dashboard, name='expert-dashboard'),
    path('experts/consultations/', views.get_expert_consultations, name='expert-consultations'),
    path('experts/availability/update/', views.update_expert_availability, name='update-expert-availability'),
    
    # Expert verification endpoints
    path('experts/apply/', views.apply_as_expert, name='apply-as-expert'),
    path('experts/my-application/', views.get_my_application, name='my-application'),
    path('experts/verification-status/', views.get_verification_status, name='verification-status'),
    path('experts/upload-document/', views.upload_verification_document, name='upload-document'),
    
    # Admin expert verification endpoints
    path('admin/applications/', views.admin_list_pending_verifications, name='admin-applications'),
    path('admin/applications/<uuid:application_id>/review/', views.admin_review_expert, name='admin-review-expert'),
    
    # Consultation endpoints
    path('consultations/book/', views.book_consultation, name='book-consultation'),
    path('consultations/upcoming/', views.get_upcoming_consultations, name='upcoming-consultations'),
    path('consultations/past/', views.get_past_consultations, name='past-consultations'),
    path('consultations/<uuid:consultation_id>/', views.get_consultation, name='consultation-detail'),
    path('consultations/<uuid:consultation_id>/confirm/', views.confirm_consultation, name='confirm-consultation'),
    path('consultations/<uuid:consultation_id>/cancel/', views.cancel_consultation, name='cancel-consultation'),
    path('consultations/<uuid:consultation_id>/reschedule/', views.reschedule_consultation, name='reschedule-consultation'),
    path('consultations/<uuid:consultation_id>/meeting-link/', views.get_meeting_link, name='meeting-link'),
    path('consultations/<uuid:consultation_id>/start/', views.start_meeting, name='start-meeting'),
    path('consultations/<uuid:consultation_id>/end/', views.end_meeting, name='end-meeting'),
    path('consultations/<uuid:consultation_id>/rate/', views.rate_consultation, name='rate-consultation'),
    
    # Chat endpoints
    path('chat/', views.get_or_create_chat, name='get-or-create-chat'),
    path('chat/list/', views.get_user_chats, name='user-chats'),
    path('chat/<uuid:conversation_id>/messages/', views.get_chat_messages, name='chat-messages'),
    path('chat/<uuid:conversation_id>/send/', views.send_message, name='send-message'),
    path('chat/<uuid:conversation_id>/read/', views.mark_messages_read, name='mark-read'),
    path('chat/<uuid:conversation_id>/archive/', views.archive_chat, name='archive-chat'),
    path('chat/<uuid:conversation_id>/block/', views.block_chat, name='block-chat'),
    path('chat/unread-count/', views.get_unread_count, name='unread-count'),
    path('chat/messages/<uuid:message_id>/', views.delete_message, name='delete-message'),
]