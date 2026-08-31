'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';

const mockHistory = [
  { id: 1, taskTitle: 'Finish Q3 Report', duration: 25, startTime: '10:00 AM' },
  { id: 2, taskTitle: 'Finish Q3 Report', duration: 25, startTime: '10:30 AM' },
  { id: 3, taskTitle: 'No task', duration: 25, startTime: '11:15 AM' },
];

/**
 * Session History Component
 * List of completed sessions for today
 */
export function SessionHistory() {
  const t = useTranslations('Focus.History');
  
  const totalMinutes = mockHistory.reduce((acc, curr) => acc + curr.duration, 0);

  return (
    <Card className="h-full bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-border bg-card/50">
        <h2 className="text-lg font-semibold mb-2">{t('title')}</h2>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock size={16} />
          <span className="text-sm font-medium">{t('totalTime', { time: `${Math.floor(totalMinutes/60)}h ${totalMinutes%60}m` })}</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {mockHistory.length > 0 ? (
          mockHistory.map((session) => (
            <div key={session.id} className="flex flex-col gap-1 pb-4 border-b border-border/50 last:border-0 last:pb-0">
              <span className="font-medium">{session.taskTitle}</span>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{session.startTime}</span>
                <span>{session.duration} {t('minutes')}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            {t('empty')}
          </div>
        )}
      </div>
    </Card>
  );
}
