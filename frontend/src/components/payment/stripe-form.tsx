'use client';

import { useState } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { paymentsAPI } from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

interface StripeFormProps {
  plan: 'basic' | 'premium' | 'elite';
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

function CheckoutForm({ plan, onSuccess, onError }: StripeFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    try {
      // Create subscription first
      const subscriptionResponse = await paymentsAPI.createSubscription({
        plan,
      });

      const { client_secret } = subscriptionResponse.data;

      if (!client_secret) {
        throw new Error('No client secret received');
      }

      // Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        client_secret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast({
          title: 'Success!',
          description: 'Your subscription has been activated.',
        });
        onSuccess?.();
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.message || 'Payment failed. Please try again.';
      toast({
        title: 'Payment Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
        <CardElement options={cardElementOptions} />
      </div>
      <Button
        type="submit"
        disabled={!stripe || loading}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Subscribe to ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`
        )}
      </Button>
    </form>
  );
}

export default function StripeForm({ plan, onSuccess, onError }: StripeFormProps) {
  const options: StripeElementsOptions = {
    mode: 'payment',
    amount: 0, // Will be set by backend
    currency: 'usd',
  };

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return (
      <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          Stripe publishable key is not configured. Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
        </p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm plan={plan} onSuccess={onSuccess} onError={onError} />
    </Elements>
  );
}

