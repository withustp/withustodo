'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';

const data = [
  { name: 'high', count: 5, color: '#ef4444' },
  { name: 'medium', count: 12, color: '#f59e0b' },
  { name: 'low', count: 8, color: '#3b82f6' },
  { name: 'none', count: 15, color: '#9ca3af' },
];

/**
 * Priority Distribution Widget
 * Horizontal stacked bar showing task priority counts
 */
export function PriorityDistribution() {
  const t = useTranslations('Dashboard.PriorityDistribution');
  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card className="p-6 h-full flex flex-col justify-center bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10">
      <h2 className="text-lg font-semibold mb-6">{t('title')}</h2>
      
      <div className="flex h-6 rounded-full overflow-hidden mb-4">
        {data.map((item) => (
          <div 
            key={item.name}
            style={{ width: `${(item.count / total) * 100}%`, backgroundColor: item.color }}
            className="h-full first:rounded-l-full last:rounded-r-full transition-all"
            title={`${t(`labels.${item.name}`)}: ${item.count}`}
          />
        ))}
      </div>
      
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
