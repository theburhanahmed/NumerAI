"""
Stripe payment services for NumerAI.
"""
import stripe
import logging
from decimal import Decimal
from datetime import datetime, timedelta
from django.conf import settings
from django.utils import timezone
from accounts.models import User
from .models import Subscription, Payment, BillingHistory, WebhookEvent

logger = logging.getLogger(__name__)

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


def get_or_create_stripe_customer(user: User) -> str:
    """
    Get or create a Stripe customer for the user.
    
    Args:
        user: User instance
        
    Returns:
        Stripe customer ID
    """
    try:
        # Check if user already has a subscription with customer ID
        subscription = getattr(user, 'subscription', None)
        if subscription and subscription.stripe_customer_id:
            return subscription.stripe_customer_id
        
        # Create new Stripe customer
        customer = stripe.Customer.create(
            email=user.email,
            name=user.full_name,
            metadata={
                'user_id': str(user.id),
            }
        )
        
        # Update subscription if exists, otherwise it will be created in create_subscription
        if subscription:
            subscription.stripe_customer_id = customer.id
            subscription.save(update_fields=['stripe_customer_id'])
        
        return customer.id
    except stripe.error.StripeError as e:
        logger.error(f"Error creating Stripe customer for user {user.id}: {str(e)}")
        raise


def create_payment_intent(user: User, amount: Decimal, currency: str = 'usd', description: str = None) -> dict:
    """
    Create a Stripe payment intent.
    
    Args:
        user: User instance
        amount: Payment amount
        currency: Currency code (default: 'usd')
        description: Payment description
        
    Returns:
        Dictionary with payment_intent and client_secret
    """
    try:
        customer_id = get_or_create_stripe_customer(user)
        
        # Convert Decimal to cents
        amount_cents = int(amount * 100)
        
        payment_intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency=currency,
            customer=customer_id,
            description=description or f"Payment for {user.full_name}",
            metadata={
                'user_id': str(user.id),
            },
            automatic_payment_methods={
                'enabled': True,
            },
        )
        
        return {
            'payment_intent_id': payment_intent.id,
            'client_secret': payment_intent.client_secret,
        }
    except stripe.error.StripeError as e:
        logger.error(f"Error creating payment intent for user {user.id}: {str(e)}")
        raise


def create_subscription(user: User, plan: str, payment_method_id: str = None) -> dict:
    """
    Create a Stripe subscription for the user.
    
    Args:
        user: User instance
        plan: Subscription plan ('basic', 'premium', 'elite')
        payment_method_id: Stripe payment method ID (optional, can be attached later)
        
    Returns:
        Dictionary with subscription details
    """
    try:
        # Plan pricing (in cents per month)
        plan_prices = {
            'basic': 999,  # $9.99/month
            'premium': 1999,  # $19.99/month
            'elite': 2999,  # $29.99/month
        }
        
        if plan not in plan_prices:
            raise ValueError(f"Invalid plan: {plan}")
        
        customer_id = get_or_create_stripe_customer(user)
        
        # Create price if it doesn't exist (in production, create these in Stripe dashboard)
        # For now, we'll use a test price ID or create one
        price_id = settings.STRIPE_PRICE_IDS.get(plan)
        
        if not price_id:
            # Create price on the fly (not recommended for production)
            price = stripe.Price.create(
                unit_amount=plan_prices[plan],
                currency='usd',
                recurring={'interval': 'month'},
                product_data={
                    'name': f'NumerAI {plan.capitalize()} Plan',
                },
            )
            price_id = price.id
        
        # Create subscription
        subscription_data = {
            'customer': customer_id,
            'items': [{'price': price_id}],
            'payment_behavior': 'default_incomplete',
            'payment_settings': {'save_default_payment_method': 'on_subscription'},
            'expand': ['latest_invoice.payment_intent'],
            'metadata': {
                'user_id': str(user.id),
                'plan': plan,
            },
        }
        
        if payment_method_id:
            subscription_data['default_payment_method'] = payment_method_id
        
        stripe_subscription = stripe.Subscription.create(**subscription_data)
        
        # Get or create subscription in our database
        subscription, created = Subscription.objects.get_or_create(
            user=user,
            defaults={
                'stripe_subscription_id': stripe_subscription.id,
                'stripe_customer_id': customer_id,
                'plan': plan,
                'status': stripe_subscription.status,
                'current_period_start': datetime.fromtimestamp(
                    stripe_subscription.current_period_start,
                    tz=timezone.utc
                ) if stripe_subscription.current_period_start else None,
                'current_period_end': datetime.fromtimestamp(
                    stripe_subscription.current_period_end,
                    tz=timezone.utc
                ) if stripe_subscription.current_period_end else None,
            }
        )
        
        if not created:
            # Update existing subscription
            subscription.stripe_subscription_id = stripe_subscription.id
            subscription.stripe_customer_id = customer_id
            subscription.plan = plan
            subscription.status = stripe_subscription.status
            subscription.current_period_start = datetime.fromtimestamp(
                stripe_subscription.current_period_start,
                tz=timezone.utc
            ) if stripe_subscription.current_period_start else None
            subscription.current_period_end = datetime.fromtimestamp(
                stripe_subscription.current_period_end,
                tz=timezone.utc
            ) if stripe_subscription.current_period_end else None
            subscription.save()
        
        # Update user premium status
        if stripe_subscription.status == 'active':
            user.is_premium = True
            user.subscription_plan = plan
            user.premium_expiry = datetime.fromtimestamp(
                stripe_subscription.current_period_end,
                tz=timezone.utc
            ) if stripe_subscription.current_period_end else None
            user.save(update_fields=['is_premium', 'subscription_plan', 'premium_expiry'])
        
        # Get client secret from invoice payment intent
        client_secret = None
        if stripe_subscription.latest_invoice and hasattr(stripe_subscription.latest_invoice, 'payment_intent'):
            if stripe_subscription.latest_invoice.payment_intent:
                client_secret = stripe_subscription.latest_invoice.payment_intent.client_secret
        
        return {
            'subscription_id': str(subscription.id),
            'stripe_subscription_id': stripe_subscription.id,
            'client_secret': client_secret,
            'status': stripe_subscription.status,
        }
    except stripe.error.StripeError as e:
        logger.error(f"Error creating subscription for user {user.id}: {str(e)}")
        raise


def handle_webhook_event(event: dict) -> dict:
    """
    Handle Stripe webhook event.
    
    Args:
        event: Stripe event dictionary
        
    Returns:
        Dictionary with processing result
    """
    event_id = event.get('id')
    event_type = event.get('type')
    
    # Store webhook event with idempotency check
    # Use get_or_create to ensure idempotency - same event won't be processed twice
    webhook_event, created = WebhookEvent.objects.get_or_create(
        stripe_event_id=event_id,
        defaults={
            'event_type': event_type,
            'payload': event,
            'processed': False,
        }
    )
    
    if not created and webhook_event.processed:
        # Event already processed successfully
        logger.info(f"Webhook event {event_id} already processed, skipping")
        return {'status': 'already_processed', 'event_id': event_id}
    
    # Update payload if event was received before but not processed
    if not created:
        webhook_event.payload = event
        webhook_event.event_type = event_type
        webhook_event.save(update_fields=['payload', 'event_type'])
    
    try:
        data = event.get('data', {}).get('object', {})
        
        if event_type == 'payment_intent.succeeded':
            _handle_payment_intent_succeeded(data)
        elif event_type == 'payment_intent.payment_failed':
            _handle_payment_intent_failed(data)
        elif event_type == 'customer.subscription.updated':
            _handle_subscription_updated(data)
        elif event_type == 'customer.subscription.deleted':
            _handle_subscription_deleted(data)
        elif event_type == 'invoice.payment_succeeded':
            _handle_invoice_payment_succeeded(data)
        elif event_type == 'invoice.payment_failed':
            _handle_invoice_payment_failed(data)
        
        webhook_event.processed = True
        webhook_event.processed_at = timezone.now()
        webhook_event.save(update_fields=['processed', 'processed_at'])
        
        return {'status': 'processed', 'event_id': event_id}
    except Exception as e:
        logger.error(f"Error processing webhook event {event_id}: {str(e)}")
        webhook_event.processed = False
        webhook_event.processing_error = str(e)
        webhook_event.save(update_fields=['processed', 'processing_error'])
        raise


def _handle_payment_intent_succeeded(data: dict):
    """Handle successful payment intent."""
    payment_intent_id = data.get('id')
    customer_id = data.get('customer')
    amount = Decimal(data.get('amount', 0)) / 100  # Convert from cents
    metadata = data.get('metadata', {})
    user_id = metadata.get('user_id')
    
    if not user_id:
        logger.warning(f"No user_id in payment intent metadata: {payment_intent_id}")
        return
    
    try:
        user = User.objects.get(id=user_id)
        
        # Get or create payment record
        payment, created = Payment.objects.get_or_create(
            stripe_payment_intent_id=payment_intent_id,
            defaults={
                'user': user,
                'amount': amount,
                'currency': data.get('currency', 'usd'),
                'status': 'succeeded',
                'description': data.get('description'),
                'metadata': metadata,
            }
        )
        
        if not created:
            payment.status = 'succeeded'
            payment.save(update_fields=['status'])
        
        # Create billing history entry
        BillingHistory.objects.create(
            user=user,
            payment=payment,
            amount=amount,
            currency=data.get('currency', 'usd'),
            description=data.get('description', 'Payment'),
        )
    except User.DoesNotExist:
        logger.error(f"User not found for payment intent: {user_id}")
    except Exception as e:
        logger.error(f"Error handling payment intent succeeded: {str(e)}")
        raise


def _handle_payment_intent_failed(data: dict):
    """Handle failed payment intent."""
    payment_intent_id = data.get('id')
    metadata = data.get('metadata', {})
    user_id = metadata.get('user_id')
    
    if not user_id:
        return
    
    try:
        payment = Payment.objects.get(stripe_payment_intent_id=payment_intent_id)
        payment.status = 'failed'
        payment.save(update_fields=['status'])
    except Payment.DoesNotExist:
        logger.warning(f"Payment not found for failed payment intent: {payment_intent_id}")
    except Exception as e:
        logger.error(f"Error handling payment intent failed: {str(e)}")


def _handle_subscription_updated(data: dict):
    """Handle subscription update."""
    subscription_id = data.get('id')
    customer_id = data.get('customer')
    status = data.get('status')
    
    try:
        subscription = Subscription.objects.get(stripe_subscription_id=subscription_id)
        subscription.status = status
        subscription.current_period_start = datetime.fromtimestamp(
            data.get('current_period_start'),
            tz=timezone.utc
        ) if data.get('current_period_start') else None
        subscription.current_period_end = datetime.fromtimestamp(
            data.get('current_period_end'),
            tz=timezone.utc
        ) if data.get('current_period_end') else None
        subscription.cancel_at_period_end = data.get('cancel_at_period_end', False)
        subscription.save()
        
        # Update user premium status
        user = subscription.user
        if status == 'active':
            user.is_premium = True
            user.premium_expiry = subscription.current_period_end
        else:
            user.is_premium = False
        user.save(update_fields=['is_premium', 'premium_expiry'])
    except Subscription.DoesNotExist:
        logger.warning(f"Subscription not found: {subscription_id}")
    except Exception as e:
        logger.error(f"Error handling subscription updated: {str(e)}")


def _handle_subscription_deleted(data: dict):
    """Handle subscription deletion."""
    subscription_id = data.get('id')
    
    try:
        subscription = Subscription.objects.get(stripe_subscription_id=subscription_id)
        subscription.status = 'canceled'
        subscription.canceled_at = timezone.now()
        subscription.save()
        
        # Update user premium status
        user = subscription.user
        user.is_premium = False
        user.subscription_plan = 'free'
        user.premium_expiry = None
        user.save(update_fields=['is_premium', 'subscription_plan', 'premium_expiry'])
    except Subscription.DoesNotExist:
        logger.warning(f"Subscription not found: {subscription_id}")
    except Exception as e:
        logger.error(f"Error handling subscription deleted: {str(e)}")


def _handle_invoice_payment_succeeded(data: dict):
    """Handle successful invoice payment."""
    subscription_id = data.get('subscription')
    amount = Decimal(data.get('amount_paid', 0)) / 100
    customer_id = data.get('customer')
    
    if not subscription_id:
        return
    
    try:
        subscription = Subscription.objects.get(stripe_subscription_id=subscription_id)
        user = subscription.user
        
        # Create billing history entry
        BillingHistory.objects.create(
            user=user,
            subscription=subscription,
            amount=amount,
            currency=data.get('currency', 'usd'),
            description=f"Invoice payment for {subscription.plan} plan",
            invoice_url=data.get('hosted_invoice_url'),
            period_start=datetime.fromtimestamp(
                data.get('period_start'),
                tz=timezone.utc
            ) if data.get('period_start') else None,
            period_end=datetime.fromtimestamp(
                data.get('period_end'),
                tz=timezone.utc
            ) if data.get('period_end') else None,
        )
    except Subscription.DoesNotExist:
        logger.warning(f"Subscription not found for invoice: {subscription_id}")
    except Exception as e:
        logger.error(f"Error handling invoice payment succeeded: {str(e)}")


def _handle_invoice_payment_failed(data: dict):
    """Handle failed invoice payment."""
    subscription_id = data.get('subscription')
    
    if not subscription_id:
        return
    
    try:
        subscription = Subscription.objects.get(stripe_subscription_id=subscription_id)
        subscription.status = 'past_due'
        subscription.save(update_fields=['status'])
    except Subscription.DoesNotExist:
        logger.warning(f"Subscription not found for failed invoice: {subscription_id}")
    except Exception as e:
        logger.error(f"Error handling invoice payment failed: {str(e)}")


def update_subscription(user: User, plan: str = None, cancel_at_period_end: bool = None) -> dict:
    """
    Update a user's subscription.
    
    Args:
        user: User instance
        plan: New plan to switch to (optional)
        cancel_at_period_end: Whether to cancel at period end (optional)
        
    Returns:
        Dictionary with updated subscription details
    """
    try:
        subscription = getattr(user, 'subscription', None)
        if not subscription or not subscription.stripe_subscription_id:
            raise ValueError("No active subscription found")
        
        update_params = {}
        if cancel_at_period_end is not None:
            update_params['cancel_at_period_end'] = cancel_at_period_end
        
        # Update subscription in Stripe
        stripe_subscription = stripe.Subscription.modify(
            subscription.stripe_subscription_id,
            **update_params
        )
        
        # If changing plan, update the subscription item
        if plan and plan != subscription.plan:
            # Get price ID for new plan
            price_id = settings.STRIPE_PRICE_IDS.get(plan)
            if not price_id:
                raise ValueError(f"Price ID not configured for plan: {plan}")
            
            # Update subscription items
            stripe.Subscription.modify(
                subscription.stripe_subscription_id,
                items=[{
                    'id': stripe_subscription['items']['data'][0].id,
                    'price': price_id,
                }],
                proration_behavior='always_invoice',
            )
            subscription.plan = plan
        
        # Update local subscription record
        subscription.status = stripe_subscription.status
        subscription.cancel_at_period_end = stripe_subscription.cancel_at_period_end
        subscription.current_period_start = datetime.fromtimestamp(
            stripe_subscription.current_period_start,
            tz=timezone.utc
        ) if stripe_subscription.current_period_start else None
        subscription.current_period_end = datetime.fromtimestamp(
            stripe_subscription.current_period_end,
            tz=timezone.utc
        ) if stripe_subscription.current_period_end else None
        subscription.save()
        
        return {
            'subscription_id': str(subscription.id),
            'status': subscription.status,
            'plan': subscription.plan,
            'cancel_at_period_end': subscription.cancel_at_period_end,
        }
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error updating subscription: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Error updating subscription: {str(e)}")
        raise


def cancel_subscription(user: User) -> dict:
    """
    Cancel a user's subscription.
    
    Args:
        user: User instance
        
    Returns:
        Dictionary with cancellation details
    """
    try:
        subscription = getattr(user, 'subscription', None)
        if not subscription or not subscription.stripe_subscription_id:
            raise ValueError("No active subscription found")
        
        # Cancel subscription in Stripe
        stripe_subscription = stripe.Subscription.cancel(subscription.stripe_subscription_id)
        
        # Update local subscription record
        subscription.status = 'canceled'
        subscription.canceled_at = timezone.now()
        subscription.save()
        
        # Update user premium status
        user.is_premium = False
        user.subscription_plan = 'free'
        user.premium_expiry = None
        user.save(update_fields=['is_premium', 'subscription_plan', 'premium_expiry'])
        
        return {
            'subscription_id': str(subscription.id),
            'status': 'canceled',
            'canceled_at': subscription.canceled_at.isoformat() if subscription.canceled_at else None,
        }
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error canceling subscription: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Error canceling subscription: {str(e)}")
        raise

