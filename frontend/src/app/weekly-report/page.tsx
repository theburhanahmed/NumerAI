'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { numerologyAPI } from '@/lib/numerology-api';
import { WeeklyReport } from '@/types/numerology';
import { RajYogBadge } from '@/components/numerology/raj-yog-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { Calendar, ChevronLeft, ChevronRight, TrendingUp, Lightbulb, AlertTriangle, Target } from 'lucide-react';
import { format, startOfWeek, endOfWeek, subWeeks, addWeeks, parseISO } from 'date-fns';

export default function WeeklyReportPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 0 }));

  const fetchWeeklyReport = useCallback(async (weekStart: Date) => {
    try {
      const weekStartStr = format(weekStart, 'yyyy-MM-dd');
      const data = await numerologyAPI.getWeeklyReport(weekStartStr);
      setReport(data);
    } catch (error: any) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.error as string | undefined;

      // For first-time users without DOB/profile or existing weekly data,
      // treat this as a soft empty state instead of a hard error toast.
      if (status === 400 || status === 404) {
        setReport(null);
      } else {
        toast({
          title: 'Error',
          description: backendMessage || 'Failed to load weekly report',
          variant: 'destructive',
        });
        setReport(null);
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

    fetchWeeklyReport(selectedWeekStart);
  }, [user, router, selectedWeekStart, fetchWeeklyReport]);

  const handlePreviousWeek = () => {
    setSelectedWeekStart(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    const nextWeek = addWeeks(selectedWeekStart, 1);
    const today = new Date();
    if (nextWeek <= today) {
      setSelectedWeekStart(nextWeek);
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

  const weekEnd = report ? parseISO(report.week_end_date) : endOfWeek(selectedWeekStart, { weekStartsOn: 0 });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Weekly Report</h1>
        <p className="text-muted-foreground text-lg">
          Your comprehensive numerology insights for the week
        </p>
      </div>

      {/* Week Navigator */}
      <div className="mb-6 flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePreviousWeek}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-2 min-w-[300px] justify-center">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <span className="font-semibold">
            {format(selectedWeekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </span>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNextWeek}
          disabled={addWeeks(selectedWeekStart, 1) > new Date()}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {report ? (
        <div className="space-y-6">
          {/* Main Theme & Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{report.main_theme}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Week {report.week_number}</Badge>
                  <Badge variant="outline">Number {report.weekly_number}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{report.weekly_summary}</p>
              
              {report.raj_yog_status && (
                <div className="mt-4">
                  {report.raj_yog_status === 'detected' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-amber-500">Raj Yog Active</Badge>
                    </div>
                  )}
                  {report.raj_yog_insights && (
                    <p className="text-sm text-muted-foreground mt-2">{report.raj_yog_insights}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Insights Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Day-by-Day Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {report.daily_insights.map((day, idx) => (
                  <Card key={idx} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{day.day_name}</span>
                        <Badge variant="outline">Day {day.personal_day_number}</Badge>
                      </div>
                      {day.lucky_color && (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Lucky Color:</span> {day.lucky_color}
                        </p>
                      )}
                      {day.activity && (
                        <p className="text-sm mt-2">{day.activity}</p>
                      )}
                      {day.raj_yog_status === 'detected' && (
                        <Badge className="mt-2 bg-amber-500">Raj Yog Day</Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Weekly Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium mb-2">Energy Pattern</p>
                  <div className="flex gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">High:</span>
                      <span className="ml-2 font-semibold">{report.weekly_trends.energy_pattern.high} days</span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Medium:</span>
                      <span className="ml-2 font-semibold">{report.weekly_trends.energy_pattern.medium} days</span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Low:</span>
                      <span className="ml-2 font-semibold">{report.weekly_trends.energy_pattern.low} days</span>
                    </div>
                  </div>
                </div>
                {report.weekly_trends.raj_yog_days > 0 && (
                  <div>
                    <p className="font-medium mb-2">Raj Yog Days</p>
                    <p className="text-sm text-muted-foreground">
                      {report.weekly_trends.raj_yog_days} out of {report.weekly_trends.total_days} days have Raj Yog energy
                    </p>
                  </div>
                )}
              </div>
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
                Challenges
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
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              Your weekly report is not available yet. Calculate your numerology profile first to get personalized weekly forecasts and insights.
            </p>
            <Button 
              onClick={() => router.push('/numerology-report')}
              className="mt-4"
            >
              Calculate My Profile
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

