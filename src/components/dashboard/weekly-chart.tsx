'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { useTasks } from '@/hooks/use-tasks';
import { useMemo } from 'react';

/**
 * Weekly Chart Widget
 * Area chart aggregating real completed and created tasks over the last 7 days.
 */
export function WeeklyChart() {
  const t = useTranslations('Dashboard.WeeklyChart');
  const { tasks } = useTasks();

  const data = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const dayDate = subDays(new Date(), 6 - i);
      const dayStr = dayDate.toDateString();

      const completedCount = tasks.filter(task => {
        if (task.status !== 'done' || !task.updated_at) return false;
        return new Date(task.updated_at).toDateString() === dayStr;
      }).length;

      const createdCount = tasks.filter(task => {
        if (!task.created_at) return false;
        return new Date(task.created_at).toDateString() === dayStr;
      }).length;

      return {
        date: format(dayDate, 'MMM dd'),
        completed: completedCount,
        created: createdCount
      };
    });
  }, [tasks]);

  return (
    <Card className="p-6 h-full flex flex-col bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">{t('title')}</h2>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span>{t('completed')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            <span>{t('created')}</span>
          </div>
        </div>
      </div>
      
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c084fc" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#c084fc" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', fontSize: '12px' }}
              itemStyle={{ color: 'var(--foreground)' }}
            />
            <Area type="monotone" dataKey="completed" stroke="var(--primary)" fillOpacity={1} fill="url(#colorCompleted)" strokeWidth={2} />
            <Area type="monotone" dataKey="created" stroke="#c084fc" fillOpacity={1} fill="url(#colorCreated)" strokeWidth={1.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
