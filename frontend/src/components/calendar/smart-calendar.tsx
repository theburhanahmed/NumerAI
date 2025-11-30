'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Star, Zap } from 'lucide-react';
import { GlassCard } from '@/components/glassmorphism/glass-card';
import { calendarAPI, DateInsight, NumerologyEvent } from '@/lib/numerology-api';

interface SmartCalendarProps {
  className?: string;
  onDateSelect?: (date: Date) => void;
}

export function SmartCalendar({ className = '', onDateSelect }: SmartCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateInsight, setDateInsight] = useState<DateInsight | null>(null);
  const [events, setEvents] = useState<NumerologyEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
      
      const [eventsData, insightData] = await Promise.all([
        calendarAPI.getEvents(startDate, endDate),
        calendarAPI.getDateInsight(new Date().toISOString().split('T')[0])
      ]);
      
      setEvents(eventsData);
      setDateInsight(insightData);
    } catch (error) {
      console.error('Failed to load calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const handleDateClick = async (day: number) => {
    const clickedDate = new Date(year, month, day);
    setSelectedDate(clickedDate);
    
    if (onDateSelect) {
      onDateSelect(clickedDate);
    }
    
    try {
      const dateStr = clickedDate.toISOString().split('T')[0];
      const insight = await calendarAPI.getDateInsight(dateStr);
      setDateInsight(insight);
    } catch (error) {
      console.error('Failed to load date insight:', error);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const getEventsForDate = (day: number) => {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    return events.filter(e => e.event_date === dateStr);
  };

  const getPersonalDayNumber = (day: number) => {
    if (!dateInsight) return null;
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];
    if (dateStr === todayStr) {
      return dateInsight.personal_day_number;
    }
    return null;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={className}>
      <GlassCard variant="default" className="p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {monthNames[month]} {year}
              </h3>
              {dateInsight && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Today: Personal Day {dateInsight.personal_day_number}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startingDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}
          
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const isToday = 
              day === new Date().getDate() &&
              month === new Date().getMonth() &&
              year === new Date().getFullYear();
            const isSelected = 
              selectedDate &&
              day === selectedDate.getDate() &&
              month === selectedDate.getMonth() &&
              year === selectedDate.getFullYear();
            const dayEvents = getEventsForDate(day);
            const personalDay = getPersonalDayNumber(day);
            
            return (
              <motion.button
                key={day}
                onClick={() => handleDateClick(day)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  aspect-square p-1 rounded-lg transition-all relative
                  ${isToday 
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold' 
                    : isSelected
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white'
                  }
                `}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span className="text-sm">{day}</span>
                  {personalDay && (
                    <span className="text-xs font-bold">{personalDay}</span>
                  )}
                  {dayEvents.length > 0 && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                      {dayEvents.slice(0, 3).map((event, idx) => (
                        <div
                          key={idx}
                          className="w-1 h-1 rounded-full bg-yellow-400"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Selected Date Insight */}
        {selectedDate && dateInsight && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200 dark:border-purple-800"
          >
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h4>
            </div>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <p>Personal Day: <span className="font-semibold">{dateInsight.personal_day_number}</span></p>
              <p>Personal Year: <span className="font-semibold">{dateInsight.personal_year_number}</span></p>
              <p>Personal Month: <span className="font-semibold">{dateInsight.personal_month_number}</span></p>
              <p className="mt-2 italic">{dateInsight.insight}</p>
            </div>
          </motion.div>
        )}
      </GlassCard>
    </div>
  );
}

