/**
 * BirthChartGrid component - Display all 9 numerology numbers in a grid.
 */
'use client';

import { NumberCard } from './number-card';
import { NumberCardData } from '@/types/numerology';

interface BirthChartGridProps {
  numbers: NumberCardData[];
  onNumberClick: (type: string) => void;
}

export function BirthChartGrid({ numbers, onNumberClick }: BirthChartGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {numbers.map((number) => (
        <NumberCard
          key={number.type}
          type={number.type}
          value={number.value}
          name={number.name}
          description={number.description}
          color={number.color}
          onClick={() => onNumberClick(number.type)}
        />
      ))}
    </div>
  );
}