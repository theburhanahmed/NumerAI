/**
 * Daily Reading Page - Display today's reading and history.
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { numerologyAPI } from '@/lib/numerology-api';
import { DailyReading } from '@/types/numerology';
import { ReadingCard } from '@/components/numerology/reading-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { Calendar, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, subDays, addDays, isToday, isFuture } from 'date-fns';

export default function DailyReadingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [todayReading, setTodayReading] = useState<DailyReading | null>(null);
  const [readingHistory, setReadingHistory] = useState<DailyReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedReading, setSelectedReading] = useState<DailyReading | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchTodayReading();
    fetchReadingHistory();
  }, [user, router]);

  useEffect(() => {
    if (isToday(selectedDate)) {
      setSelectedReading(todayReading);
    } else {
      fetchReadingForDate(selectedDate);
    }
  }, [selectedDate, todayReading]);

  const fetchTodayReading = async () => {
    try {
      const data = await numerologyAPI.getDailyReading();
      setTodayReading(data);
      setSelectedReading(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to load today\'s reading',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReadingHistory = async () => {
    try {
      const data = await numerologyAPI.getReadingHistory(1, 7);
      setReadingHistory(data.results);
    } catch (error: any) {
      console.error('Failed to load reading history:', error);
    }
  };

  const fetchReadingForDate = async (date: Date) => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const data = await numerologyAPI.getDailyReading(dateStr);
      setSelectedReading(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load reading for selected date',
        variant: 'destructive',
      });
    }
  };

  const handlePreviousDay = () => {
    setSelectedDate((prev) => subDays(prev, 1));
  };

  const handleNextDay = () => {
    const nextDate = addDays(selectedDate, 1);
    if (!isFuture(nextDate)) {
      setSelectedDate(nextDate);
    }
  };

  const handleShare = async () => {
    if (!todayReading) return;

    const shareText = `My numerology reading for today:\n\nPersonal Day Number: ${todayReading.personal_day_number}\nLucky Number: ${todayReading.lucky_number}\nLucky Color: ${todayReading.lucky_color}\n\nAffirmation: "${todayReading.affirmation}"`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Daily Numerology Reading',
          text: shareText,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(shareText);
      toast({
        title: 'Copied!',
        description: 'Reading copied to clipboard',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Daily Reading</h1>
          <p className="text-muted-foreground text-lg">
            Your personalized numerology guidance for each day
          </p>
        </div>
        {todayReading && isToday(selectedDate) && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        )}
      </div>

      {/* Date Navigator */}
      <div className="mb-6 flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePreviousDay}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-2 min-w-[200px] justify-center">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <span className="font-semibold">
            {format(selectedDate, 'MMMM d, yyyy')}
          </span>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNextDay}
          disabled={isFuture(addDays(selectedDate, 1))}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Current Reading */}
      {selectedReading ? (
        <div className="max-w-3xl mx-auto">
          <ReadingCard reading={selectedReading} isToday={isToday(selectedDate)} />
        </div>
      ) : (
        <div className="max-w-3xl mx-auto text-center p-8 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">
            No reading available for this date
          </p>
        </div>
      )}

      {/* Reading History */}
      {readingHistory.length > 0 && isToday(selectedDate) && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Recent Readings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {readingHistory.slice(1).map((reading) => (
              <ReadingCard key={reading.id} reading={reading} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}