'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Today Summary Widget
 * Shows pending, completed, and overdue tasks.
 */
export function TodaySummary() {
  const t = useTranslations('Dashboard.TodaySummary');
  const [stats, setStats] = useState({ pending: 0, completed: 0, overdue: 0 });

  useEffect(() => {
    // In a real app, fetch these from Supabase based on current date
    setStats({ pending: 5, completed: 3, overdue: 1 });
  }, []);

  const total = stats.pending + stats.completed + stats.overdue;
  const progress = total > 0 ? (stats.completed / total) * 100 : 0;

  return (
    <Card className="p-6 h-full flex flex-col justify-between bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">{t('title')}</h2>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-blue-500">
            <Clock size={16} />
            <span className="text-sm font-medium">{t('pending')}</span>
          </div>
          <span className="text-3xl font-bold">{stats.pending}</span>
        </div>
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-green-500">
            <CheckCircle2 size={16} />
            <span className="text-sm font-medium">{t('completed')}</span>
          </div>
          <span className="text-3xl font-bold">{stats.completed}</span>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle size={16} />
            <span className="text-sm font-medium">{t('overdue')}</span>
          </div>
          <span className="text-3xl font-bold">{stats.overdue}</span>
        </div>
      </div>

      <div className="relative pt-4 border-t border-border">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">{t('completionRate')}</span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </Card>
  );
}
