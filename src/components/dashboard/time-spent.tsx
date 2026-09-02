'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Timer, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useTimeEntries } from '@/hooks/use-time-entries';

/**
 * Time Spent Widget
 * Displays real-time focus duration logged in Supabase time_entries table.
 */
export function TimeSpent() {
  const t = useTranslations('Dashboard.TimeSpent');
  const { todayMinutes, yesterdayMinutes, isLoading } = useTimeEntries();
  
  const hours = Math.floor(todayMinutes / 60);
  const minutes = todayMinutes % 60;
  const diff = todayMinutes - yesterdayMinutes;

  return (
    <Card className="p-6 h-full flex flex-col justify-between bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-foreground">{t('title')}</h2>
        <div className="p-2 bg-primary/10 text-primary rounded-full shadow-inner">
          <Timer size={20} />
        </div>
      </div>
      
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold tracking-tight text-foreground">{hours}</span>
          <span className="text-muted-foreground font-medium text-sm">h</span>
          <span className="text-4xl font-bold tracking-tight ml-2 text-foreground">{minutes}</span>
          <span className="text-muted-foreground font-medium text-sm">m</span>
        </div>
        
        <div className="flex items-center gap-1.5 mt-2 text-xs font-medium">
          {diff >= 0 ? (
            <span className="text-emerald-500 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              +{diff}m {t('vsYesterday')}
            </span>
          ) : (
            <span className="text-muted-foreground flex items-center">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              {diff}m {t('vsYesterday')}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
