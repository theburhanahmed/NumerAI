"""
URL routing for consultations application.
"""
from django.urls import path
from . import views

app_name = 'consultations'

urlpatterns = [
    # Expert and consultation endpoints
    path('experts/', views.get_experts, name='experts'),
    path('experts/<uuid:expert_id>/', views.get_expert, name='expert-detail'),
    path('consultations/book/', views.book_consultation, name='book-consultation'),
    path('consultations/upcoming/', views.get_upcoming_consultations, name='upcoming-consultations'),
    path('consultations/past/', views.get_past_consultations, name='past-consultations'),
    path('consultations/<uuid:consultation_id>/rate/', views.rate_consultation, name='rate-consultation'),
]