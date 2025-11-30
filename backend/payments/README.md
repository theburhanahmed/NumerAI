# Payments App

This Django app handles payment processing, subscriptions, and billing for NumerAI using Stripe.

## Features

- **Subscription Management**: Create and manage user subscriptions (Basic, Premium, Elite)
- **Payment Processing**: Handle payment intents and charges via Stripe
- **Webhook Handling**: Process Stripe webhook events for subscription and payment updates
- **Billing History**: Track and display user billing history
- **Audit Trail**: Store webhook events for debugging and auditing

## Models

### Subscription
Tracks user subscriptions with Stripe integration.

### Payment
Records individual payment transactions.

### BillingHistory
Maintains a history of billing events for user viewing.

### WebhookEvent
Stores Stripe webhook events for auditing and debugging.

## API Endpoints

- `POST /api/v1/payments/create-subscription/` - Create a new subscription
- `GET /api/v1/payments/subscription-status/` - Get current subscription status
- `GET /api/v1/payments/billing-history/` - Get billing history
- `POST /api/v1/payments/webhook/` - Stripe webhook endpoint (no auth required)

## Environment Variables

Required environment variables:

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_BASIC=price_...
STRIPE_PRICE_ID_PREMIUM=price_...
STRIPE_PRICE_ID_ELITE=price_...
```

## Setup

1. Install dependencies:
```bash
pip install stripe
```

2. Configure Stripe keys in `.env` file

3. Run migrations:
```bash
python manage.py migrate payments
```

4. Configure webhook endpoint in Stripe Dashboard:
   - URL: `https://your-domain.com/api/v1/payments/webhook/`
   - Events to listen for:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

## Testing

Run tests:
```bash
pytest backend/payments/tests/
```

## Usage Example

```python
from payments.services import create_subscription

# Create a subscription for a user
result = create_subscription(
    user=user,
    plan='premium',
    payment_method_id='pm_xxx'
)
```

## Notes

- All amounts are stored in the smallest currency unit (cents for USD)
- Webhook events are stored for auditing purposes
- Subscriptions are soft-deleted (status set to 'canceled')
- User premium status is automatically updated based on subscription status

