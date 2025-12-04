'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { numerologyAPI } from '@/lib/numerology-api';
import { YearlyReport } from '@/types/numerology';
import { RajYogBadge } from '@/components/numerology/raj-yog-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { Calendar, ChevronLeft, ChevronRight, TrendingUp, Lightbulb, AlertTriangle, Target, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

export default function YearlyReportPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [report, setReport] = useState<YearlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const fetchYearlyReport = useCallback(async (year: number) => {
    try {
      const data = await numerologyAPI.getYearlyReport(year);
      setReport(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to load yearly report',
        variant: 'destructive',
      });
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchYearlyReport(selectedYear);
  }, [user, router, selectedYear, fetchYearlyReport]);

  const handlePreviousYear = () => {
    setSelectedYear(prev => prev - 1);
  };

  const handleNextYear = () => {
    const currentYear = new Date().getFullYear();
    if (selectedYear < currentYear) {
      setSelectedYear(prev => prev + 1);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const cycleColors = {
    beginning: 'from-green-500 to-emerald-600',
    middle: 'from-blue-500 to-cyan-600',
    end: 'from-purple-500 to-pink-600',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Yearly Report</h1>
        <p className="text-muted-foreground text-lg">
          Your comprehensive numerology insights for the year
        </p>
      </div>

      {/* Year Navigator */}
      <div className="mb-6 flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePreviousYear}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-2 min-w-[200px] justify-center">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <span className="font-semibold text-xl">{selectedYear}</span>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNextYear}
          disabled={selectedYear >= new Date().getFullYear()}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {report ? (
        <div className="space-y-6">
          {/* Annual Overview */}
          <Card className={`bg-gradient-to-r ${cycleColors[report.personal_year_cycle]} text-white`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">
                  Personal Year {report.personal_year_number}
                </CardTitle>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {report.personal_year_cycle.charAt(0).toUpperCase() + report.personal_year_cycle.slice(1)} Cycle
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-white/90 mb-4">{report.annual_overview}</p>
              
              {report.annual_raj_yog_status && (
                <div className="mt-4">
                  <RajYogBadge 
                    detection={report.annual_raj_yog_status === 'active' ? {
                      is_detected: true,
                      yog_name: 'Raj Yog Active',
                      strength_score: 80,
                      yog_type: 'other',
                      contributing_numbers: {
                        life_path: 0,
                        destiny: 0
                      },
                      detected_combinations: [],
                      calculation_system: 'pythagorean',
                      detected_at: report.generated_at || new Date().toISOString(),
                      updated_at: report.updated_at || new Date().toISOString(),
                      id: report.id || ''
                    } : null}
                    size="md"
                  />
                  {report.raj_yog_insights && (
                    <p className="text-sm text-white/80 mt-2">{report.raj_yog_insights}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Major Themes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Major Themes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2">
                {report.major_themes.map((theme, idx) => (
                  <li key={idx} className="text-muted-foreground">{theme}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Month-by-Month */}
          <Card>
            <CardHeader>
              <CardTitle>Month-by-Month Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(report.month_by_month).map(([monthNum, monthData]) => (
                  <Card key={monthNum} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{monthData.month_name}</span>
                        <Badge variant="outline">Month {monthData.personal_month_number}</Badge>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{monthData.theme}</p>
                      <p className="text-xs text-muted-foreground">{monthData.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Key Dates */}
          {report.key_dates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Key Dates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.key_dates.map((keyDate, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{format(new Date(keyDate.date), 'MMM d, yyyy')}</span>
                          <Badge 
                            variant={keyDate.importance === 'high' ? 'default' : 'outline'}
                            className={keyDate.importance === 'high' ? 'bg-red-500' : ''}
                          >
                            {keyDate.importance}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{keyDate.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Opportunities */}
          <Card className="bg-green-50 dark:bg-green-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <Lightbulb className="w-5 h-5" />
                Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-green-800 dark:text-green-200">
                {report.opportunities.map((opp, idx) => (
                  <li key={idx}>{opp}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Challenges */}
          <Card className="bg-amber-50 dark:bg-amber-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <AlertTriangle className="w-5 h-5" />
                Challenges & Remedies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-amber-800 dark:text-amber-200">
                {report.challenges.map((challenge, idx) => (
                  <li key={idx}>{challenge}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2">
                {report.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-muted-foreground">{rec}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No yearly report available for {selectedYear}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

