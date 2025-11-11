/**
 * NumberCard component - Display a single numerology number with styling.
 */
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NumberCardProps {
  type: string;
  value: number;
  name: string;
  description: string;
  color: 'purple' | 'gold' | 'blue';
  onClick?: () => void;
}

const colorClasses = {
  purple: 'from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
  gold: 'from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
  blue: 'from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600',
};

const isMasterNumber = (num: number): boolean => {
  return [11, 22, 33].includes(num);
};

export function NumberCard({ type, value, name, description, color, onClick }: NumberCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl',
        'bg-gradient-to-br text-white',
        colorClasses[color]
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Number Display */}
          <div className="relative">
            <div className="text-6xl font-bold">{value}</div>
            {isMasterNumber(value) && (
              <Badge 
                variant="secondary" 
                className="absolute -top-2 -right-2 bg-white text-purple-600 font-semibold"
              >
                Master
              </Badge>
            )}
          </div>

          {/* Name */}
          <h3 className="text-xl font-semibold">{name}</h3>

          {/* Description */}
          <p className="text-sm opacity-90 line-clamp-2">{description}</p>

          {/* Click hint */}
          <p className="text-xs opacity-75 mt-2">Click for details</p>
        </div>
      </CardContent>
    </Card>
  );
}