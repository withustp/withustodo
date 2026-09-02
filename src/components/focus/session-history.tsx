'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Clock, CheckCircle2 } from 'lucide-react';
import { useTimeEntries } from '@/hooks/use-time-entries';
import { format } from 'date-fns';

/**
 * Session History Component
 * List of real completed focus sessions from Supabase DB.
 */
export function SessionHistory() {
  const t = useTranslations('Focus.History');
  const { entries, todayMinutes, isLoading } = useTimeEntries();

  const hours = Math.floor(todayMinutes / 60);
  const mins = todayMinutes % 60;
  const timeFormatted = `${hours}h ${mins}m`;

  return (
    <Card className="h-full bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col overflow-hidden shadow-lg">
      <div className="p-6 border-b border-border bg-card/50">
        <h2 className="text-lg font-semibold text-foreground mb-2">{t('title')}</h2>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock size={16} className="text-primary" />
          <span className="text-sm font-medium text-foreground">
            {t('totalTime', { time: timeFormatted })}
          </span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            기록을 불러오는 중...
          </div>
        ) : entries.length > 0 ? (
          entries.map((session) => (
            <div 
              key={session.id} 
              className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-background/40 hover:bg-background/80 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-sm text-foreground truncate">
                    {session.task?.title || '자유 집중 세션'}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {session.completed_at ? format(new Date(session.completed_at), 'MMM d, HH:mm') : ''}
                  </span>
                </div>
              </div>
              <div className="text-xs font-semibold text-primary shrink-0 ml-2">
                {session.duration_minutes} {t('minutes')}
              </div>
            </div>
          ))
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm py-12">
            {t('empty')}
          </div>
        )}
      </div>
    </Card>
  );
}
