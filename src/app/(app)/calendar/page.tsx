'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { CalendarGrid } from '@/components/calendar/calendar-grid';

/**
 * Calendar Page
 * View tasks by date
 */
export default function CalendarPage() {
  const t = useTranslations('Calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToday = () => setCurrentDate(new Date());

  return (
    <div className="flex flex-col gap-6 p-6 h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">
            {format(currentDate, 'MMMM yyyy')}
          </h1>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft size={16} />
            </Button>
            <Button variant="outline" onClick={goToday}>
              {t('today')}
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
        <div className="flex p-1 bg-muted rounded-lg">
          <Button 
            variant={view === 'month' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setView('month')}
          >
            {t('month')}
          </Button>
          <Button 
            variant={view === 'week' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setView('week')}
          >
            {t('week')}
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
        <CalendarGrid currentDate={currentDate} view={view} />
      </div>
    </div>
  );
}
