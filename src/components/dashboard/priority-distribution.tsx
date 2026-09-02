'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { useTasks } from '@/hooks/use-tasks';

/**
 * Priority Distribution Widget
 * Horizontal stacked bar showing real task priority counts
 */
export function PriorityDistribution() {
  const t = useTranslations('Dashboard.PriorityDistribution');
  const { tasks } = useTasks();

  const counts = {
    high: 0,
    medium: 0,
    low: 0,
    none: 0
  };

  tasks.forEach((t) => {
    if (t.status !== 'done' && !t.is_deleted) {
      if (t.priority === 'high') counts.high++;
      else if (t.priority === 'medium') counts.medium++;
      else if (t.priority === 'low') counts.low++;
      else counts.none++;
    }
  });

  const total = counts.high + counts.medium + counts.low + counts.none;

  const data = [
    { name: 'high', count: counts.high, color: '#ef4444' },
    { name: 'medium', count: counts.medium, color: '#f59e0b' },
    { name: 'low', count: counts.low, color: '#3b82f6' },
    { name: 'none', count: counts.none, color: '#9ca3af' },
  ];

  return (
    <Card className="p-6 h-full flex flex-col justify-center bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10">
      <h2 className="text-lg font-semibold mb-6">{t('title')}</h2>
      
      {total > 0 ? (
        <div className="flex h-6 rounded-full overflow-hidden mb-4 bg-muted/20">
          {data.map((item) => (
            <div 
              key={item.name}
              style={{ width: `${(item.count / total) * 100}%`, backgroundColor: item.color }}
              className="h-full first:rounded-l-full last:rounded-r-full transition-all"
              title={`${t(`labels.${item.name}`)}: ${item.count}`}
            />
          ))}
        </div>
      ) : (
        <div className="h-6 rounded-full bg-muted/20 mb-4 flex items-center justify-center text-[10px] text-muted-foreground">
          대기 중인 작업 없음
        </div>
      )}
      
      <div className="flex justify-between gap-2 text-xs">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-muted-foreground">{t(`labels.${item.name}`)}</span>
            <span className="font-medium">{item.count}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
