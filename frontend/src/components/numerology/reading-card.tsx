/**
 * ReadingCard component - Display a daily reading.
 */
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DailyReading } from '@/types/numerology';
import { 
  Star, 
  Clock, 
  Activity, 
  AlertTriangle, 
  Heart, 
  Lightbulb,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReadingCardProps {
  reading: DailyReading;
  isToday?: boolean;
}

const colorNameToHex: Record<string, string> = {
  red: '#ef4444',
  orange: '#f97316',
  yellow: '#eab308',
  green: '#22c55e',
  blue: '#3b82f6',
  indigo: '#6366f1',
  purple: '#a855f7',
  pink: '#ec4899',
  gold: '#fbbf24',
  silver: '#d1d5db',
  white: '#ffffff',
  cream: '#fef3c7',
  brown: '#92400e',
  grey: '#6b7280',
  gray: '#6b7280',
  turquoise: '#14b8a6',
  rose: '#f43f5e',
  lavender: '#c084fc',
  violet: '#8b5cf6',
  black: '#000000',
  charcoal: '#374151',
  crimson: '#dc2626',
  burgundy: '#991b1b',
};

const getColorHex = (colorName: string): string => {
  const normalized = colorName.toLowerCase().trim();
  return colorNameToHex[normalized] || '#6366f1';
};

export function ReadingCard({ reading, isToday = false }: ReadingCardProps) {
  const formattedDate = new Date(reading.reading_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const colorHex = getColorHex(reading.lucky_color);

  return (
    <Card className={cn(
      'transition-all duration-300',
      isToday && 'border-2 border-purple-500 shadow-lg'
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            {isToday ? "Today's Reading" : formattedDate}
          </CardTitle>
          {isToday && (
            <Badge variant="default" className="bg-purple-600">
              <Sparkles className="w-3 h-3 mr-1" />
              Today
            </Badge>
          )}
        </div>
        <div className="flex gap-3 mt-2">
          <Badge variant="outline">
            Personal Day: {reading.personal_day_number}
          </Badge>
          <Badge variant="outline">
            Lucky Number: {reading.lucky_number}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Lucky Color */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            <span className="font-semibold">Lucky Color:</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full border-2 border-gray-300"
              style={{ backgroundColor: colorHex }}
            />
            <span>{reading.lucky_color}</span>
          </div>
        </div>

        {/* Auspicious Time */}
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <span className="font-semibold">Auspicious Time:</span>
            <p className="text-muted-foreground">{reading.auspicious_time}</p>
          </div>
        </div>

        {/* Activity Recommendation */}
        <div className="flex items-start gap-3">
          <Activity className="w-5 h-5 text-green-500 mt-0.5" />
          <div>
            <span className="font-semibold">Recommended Activity:</span>
            <p className="text-muted-foreground">{reading.activity_recommendation}</p>
          </div>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-700 dark:text-amber-400">
              Be Mindful:
            </span>
            <p className="text-amber-600 dark:text-amber-300">{reading.warning}</p>
          </div>
        </div>

        {/* Affirmation */}
        <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
          <Heart className="w-5 h-5 text-purple-600 mt-0.5" />
          <div>
            <span className="font-semibold text-purple-700 dark:text-purple-400">
              Affirmation:
            </span>
            <p className="text-purple-600 dark:text-purple-300 italic">
              "{reading.affirmation}"
            </p>
          </div>
        </div>

        {/* Actionable Tip */}
        <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <span className="font-semibold text-blue-700 dark:text-blue-400">
              Action Tip:
            </span>
            <p className="text-blue-600 dark:text-blue-300">{reading.actionable_tip}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}