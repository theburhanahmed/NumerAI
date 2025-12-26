'use client';

import { useState, useEffect } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { numerologyAPI, peopleAPI } from '@/lib/numerology-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function GenerationalNumerologyPage() {
  const { hasAccess } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);

  useEffect(() => {
    if (!hasAccess('numerology_generational')) {
      return;
    }
    // Load family members and analysis
    loadData();
  }, [hasAccess]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load people with family relationships
      const people = await peopleAPI.getPeople();
      const family = people.filter(
        (p: any) => ['parent', 'child', 'sibling', 'spouse'].includes(p.relationship)
      );
      setFamilyMembers(family);

      // Load existing analysis
      const analysisResponse = await numerologyAPI.getGenerationalFamilyAnalysis();
      if (analysisResponse.analyses?.length > 0) {
        setAnalysis(analysisResponse.analyses[0]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (familyMembers.length < 2) {
      alert('Please add at least 2 family members first');
      return;
    }

    try {
      setLoading(true);
      const personIds = familyMembers.map((m: any) => m.id);
      const result = await numerologyAPI.analyzeFamilyGenerational(personIds);
      setAnalysis(result.analysis);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to analyze family');
    } finally {
      setLoading(false);
    }
  };

  if (!hasAccess('numerology_generational')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Generational Numerology</h2>
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
      <h1 className="text-3xl font-bold mb-6">Generational Numerology</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Family Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {familyMembers.length === 0 ? (
              <p className="text-gray-600 mb-4">
                Add family members in the People section to get started.
              </p>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  {familyMembers.length} family member(s) found
                </p>
                <Button onClick={handleAnalyze} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Family'
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {analysis && (
          <Card>
            <CardHeader>
              <CardTitle>Generational Number: {analysis.generational_number}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Interpretation</h3>
                  <p className="text-sm text-gray-700">
                    {analysis.interpretation?.description || 'Analysis in progress...'}
                  </p>
                </div>
                {analysis.family_dynamics && (
                  <div>
                    <h3 className="font-semibold mb-2">Family Dynamics</h3>
                    <p className="text-sm text-gray-700">
                      Average Life Path: {analysis.family_dynamics.average_life_path}
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

