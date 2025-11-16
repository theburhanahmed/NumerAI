/**
 * Birth Chart Page - Display user's complete numerology profile.
 */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { numerologyAPI } from '@/lib/numerology-api';
import { BirthChart, NumberCardData, NumberType, NumberInterpretation } from '@/types/numerology';
import { BirthChartGrid } from '@/components/numerology/birth-chart-grid';
import { NumberDetailModal } from '@/components/numerology/number-detail-modal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { Calculator, Sparkles, Download } from 'lucide-react';

const numberNames: Record<NumberType, string> = {
  life_path_number: 'Life Path Number',
  destiny_number: 'Destiny Number',
  soul_urge_number: 'Soul Urge Number',
  personality_number: 'Personality Number',
  attitude_number: 'Attitude Number',
  maturity_number: 'Maturity Number',
  balance_number: 'Balance Number',
  personal_year_number: 'Personal Year Number',
  personal_month_number: 'Personal Month Number',
};

const numberDescriptions: Record<NumberType, string> = {
  life_path_number: 'Your life purpose and main lessons',
  destiny_number: 'Your natural talents and abilities',
  soul_urge_number: 'Your inner motivations and desires',
  personality_number: 'How others perceive you',
  attitude_number: 'Your general outlook on life',
  maturity_number: 'Your potential in later life',
  balance_number: 'How you handle challenges',
  personal_year_number: 'The theme of your current year',
  personal_month_number: 'The energy of your current month',
};

const numberColors: Record<NumberType, 'purple' | 'gold' | 'blue'> = {
  life_path_number: 'purple',
  destiny_number: 'purple',
  soul_urge_number: 'purple',
  personality_number: 'blue',
  attitude_number: 'blue',
  maturity_number: 'blue',
  balance_number: 'blue',
  personal_year_number: 'gold',
  personal_month_number: 'gold',
};

export default function BirthChartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [birthChart, setBirthChart] = useState<BirthChart | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<{
    type: NumberType;
    interpretation: NumberInterpretation;
  } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchBirthChart = useCallback(async () => {
    try {
      setLoading(true);
      const data = await numerologyAPI.getBirthChart();
      setBirthChart(data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Profile not found - show calculate button
        setBirthChart(null);
      } else {
        toast({
          title: 'Error',
          description: error.response?.data?.error || 'Failed to load birth chart',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchBirthChart();
  }, [user, router, fetchBirthChart]);

  const handleCalculateProfile = async () => {
    try {
      setCalculating(true);
      await numerologyAPI.calculateProfile();
      toast({
        title: 'Success',
        description: 'Your numerology profile has been calculated!',
      });
      await fetchBirthChart();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to calculate profile',
        variant: 'destructive',
      });
    } finally {
      setCalculating(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      // Create a link to the PDF endpoint
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/numerology/birth-chart/pdf/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to export PDF');
      }
      
      // Create a blob from the response
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `birth_chart_${user?.full_name.replace(/\s+/g, '_') || 'numerai'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Success',
        description: 'Birth chart exported successfully!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to export PDF',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleNumberClick = (type: string) => {
    if (!birthChart) return;

    const numberType = type as NumberType;
    const interpretation = birthChart.interpretations[numberType];

    if (interpretation) {
      setSelectedNumber({ type: numberType, interpretation });
      setModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (!birthChart) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-full">
              <Calculator className="w-12 h-12 text-purple-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Calculate Your Birth Chart</h1>
          <p className="text-muted-foreground text-lg">
            Discover your numerology profile and unlock insights into your life path,
            destiny, and personal characteristics.
          </p>
          <Button
            size="lg"
            onClick={handleCalculateProfile}
            disabled={calculating}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {calculating ? (
              <>
                <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <Calculator className="w-5 h-5 mr-2" />
                Calculate My Profile
              </>
            )}
          </Button>
          <p className="text-sm text-muted-foreground">
            Make sure you&apos;ve completed your profile with your birth date first.
          </p>
        </div>
      </div>
    );
  }

  const numbers: NumberCardData[] = (Object.keys(numberNames) as NumberType[]).map(
    (type) => ({
      type,
      value: birthChart.profile[type],
      name: numberNames[type],
      description: numberDescriptions[type],
      color: numberColors[type],
    })
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Your Birth Chart</h1>
          <p className="text-muted-foreground text-lg">
            Explore the numerology numbers that define your unique path
          </p>
        </div>
        <Button onClick={handleExportPDF} disabled={exporting} variant="outline">
          {exporting ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </>
          )}
        </Button>
      </div>

      <BirthChartGrid numbers={numbers} onNumberClick={handleNumberClick} />

      <NumberDetailModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        interpretation={selectedNumber?.interpretation || null}
        numberName={selectedNumber ? numberNames[selectedNumber.type] : ''}
      />
    </div>
  );
}