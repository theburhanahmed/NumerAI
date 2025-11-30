"""
URL routing for payments application.
"""
from django.urls import path
from . import views

app_name = 'payments'

urlpatterns = [
    path('payments/create-subscription/', views.create_subscription_view, name='create-subscription'),
    path('payments/update-subscription/', views.update_subscription_view, name='update-subscription'),
    path('payments/cancel-subscription/', views.cancel_subscription_view, name='cancel-subscription'),
    path('payments/subscription-status/', views.subscription_status, name='subscription-status'),
    path('payments/billing-history/', views.billing_history, name='billing-history'),
    path('payments/webhook/', views.stripe_webhook, name='webhook'),
]

