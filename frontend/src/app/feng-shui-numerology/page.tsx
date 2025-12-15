'use client';

import { useState } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { numerologyAPI } from '@/lib/numerology-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

export default function FengShuiNumerologyPage() {
  const { hasAccess } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [houseNumber, setHouseNumber] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!houseNumber.trim()) {
      alert('Please enter a house number');
      return;
    }

    try {
      setLoading(true);
      const result = await numerologyAPI.analyzeFengShui(houseNumber, propertyAddress);
      setAnalysis(result.analysis);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to analyze property');
    } finally {
      setLoading(false);
    }
  };

  if (!hasAccess('numerology_feng_shui')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Feng Shui × Numerology</h2>
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
      <h1 className="text-3xl font-bold mb-6">Feng Shui × Numerology Analysis</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Property Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">House Number *</label>
              <Input
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                placeholder="e.g., 123, 45A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Property Address</label>
              <Input
                value={propertyAddress}
                onChange={(e) => setPropertyAddress(e.target.value)}
                placeholder="Optional address"
              />
            </div>
            <Button onClick={handleAnalyze} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Property'
              )}
            </Button>
          </CardContent>
        </Card>

        {analysis && (
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.house_vibration && (
                  <div>
                    <h3 className="font-semibold mb-2">House Vibration</h3>
                    <p className="text-2xl font-bold text-purple-600">
                      {analysis.house_vibration.vibration_number}
                    </p>
                    <p className="text-sm text-gray-700 mt-2">
                      {analysis.house_vibration.interpretation?.energy || 'Analysis complete'}
                    </p>
                  </div>
                )}
                {analysis.hybrid_analysis && (
                  <div>
                    <h3 className="font-semibold mb-2">Hybrid Score</h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {analysis.hybrid_analysis.hybrid_score}/100
                    </p>
                    <p className="text-sm text-gray-700 mt-2">
                      Compatibility between your numerology and property energy
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

