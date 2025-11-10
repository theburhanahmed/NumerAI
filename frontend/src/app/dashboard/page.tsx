'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Welcome, {user.full_name}!</CardTitle>
              <CardDescription>
                {user.email || user.phone}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-semibold">Account Status:</span>{' '}
                  {user.is_verified ? 'Verified' : 'Not Verified'}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Subscription:</span>{' '}
                  {user.subscription_plan.charAt(0).toUpperCase() + user.subscription_plan.slice(1)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Birth Chart</CardTitle>
              <CardDescription>View your numerology profile</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Complete your profile to generate your birth chart
              </p>
              <Button className="mt-4" variant="outline" disabled>
                Coming in Sprint 2
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily Reading</CardTitle>
              <CardDescription>Your personalized guidance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get your daily numerology reading
              </p>
              <Button className="mt-4" variant="outline" disabled>
                Coming in Sprint 2
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Numerologist</CardTitle>
              <CardDescription>Chat with our AI expert</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ask questions about your numerology
              </p>
              <Button className="mt-4" variant="outline" disabled>
                Coming in Sprint 2
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}