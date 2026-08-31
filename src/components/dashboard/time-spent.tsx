'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Timer } from 'lucide-react';

/**
 * Time Spent Widget
 * Shows total focus time for today
 */
export function TimeSpent() {
  const t = useTranslations('Dashboard.TimeSpent');
  
  // Format: 2h 45m
  const hours = 2;
  const minutes = 45;

  return (
    <Card className="p-6 h-full flex flex-col justify-between bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{t('title')}</h2>
        <div className="p-2 bg-primary/10 text-primary rounded-full">
          <Timer size={20} />
        </div>
      </div>
      
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold">{hours}</span>
          <span className="text-muted-foreground font-medium">h</span>
          <span className="text-4xl font-bold ml-2">{minutes}</span>
          <span className="text-muted-foreground font-medium">m</span>
        </div>
        <p className="text-sm text-green-500 mt-2 font-medium">
          +15m {t('vsYesterday')}
        </p>
      </div>
    </Card>
  );
}
