'use client';

import { useState, useEffect } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { numerologyAPI } from '@/lib/numerology-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function MentalStateNumerologyPage() {
  const { hasAccess } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [moodPredictions, setMoodPredictions] = useState<any>(null);

  useEffect(() => {
    if (!hasAccess('numerology_mental_state')) {
      return;
    }
    loadData();
  }, [hasAccess]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recs, predictions] = await Promise.all([
        numerologyAPI.getWellbeingRecommendations(),
        numerologyAPI.getMoodPredictions()
      ]);
      setRecommendations(recs.recommendations || []);
      setMoodPredictions(predictions.predictions);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async () => {
    try {
      setLoading(true);
      const result = await numerologyAPI.trackMentalState({
        emotional_state: 'neutral',
        stress_level: 50,
        mood_score: 50
      });
      setTracking(result.tracking);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to track mental state');
    } finally {
      setLoading(false);
    }
  };

  if (!hasAccess('numerology_mental_state')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Mental State AI × Numerology</h2>
            <p className="text-gray-600">
              This feature is available for Elite subscribers. Please upgrade to access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mental State AI × Numerology</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Track Your State</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleTrack} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Tracking...
                </>
              ) : (
                'Track Today\'s Mental State'
              )}
            </Button>
            {tracking && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <p className="text-sm">
                  Tracked on {new Date(tracking.date).toLocaleDateString()}
                </p>
                <p className="text-sm">Mood Score: {tracking.mood_score}/100</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wellbeing Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : recommendations.length > 0 ? (
              <div className="space-y-2">
                {recommendations.slice(0, 3).map((rec: any, idx: number) => (
                  <div key={idx} className="p-3 bg-blue-50 rounded">
                    <h4 className="font-semibold text-sm">{rec.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{rec.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No recommendations available</p>
            )}
          </CardContent>
        </Card>

        {moodPredictions && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Mood Cycle Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Predictions for the next 12 months based on your numerology cycles
              </p>
              <div className="grid grid-cols-3 gap-2">
                {moodPredictions.slice(0, 6).map((pred: any, idx: number) => (
                  <div key={idx} className="p-3 bg-purple-50 rounded text-center">
                    <p className="text-xs font-semibold">{pred.month}/{pred.year}</p>
                    <p className="text-sm text-purple-600">{pred.predicted_mood}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

