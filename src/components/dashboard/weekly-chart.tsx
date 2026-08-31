'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

const data = Array.from({ length: 7 }).map((_, i) => ({
  date: format(subDays(new Date(), 6 - i), 'MMM dd'),
  completed: Math.floor(Math.random() * 10) + 1
}));

/**
 * Weekly Chart Widget
 * Area chart of tasks completed over the last 7 days
 */
export function WeeklyChart() {
  const t = useTranslations('Dashboard.WeeklyChart');

  return (
    <Card className="p-6 h-full flex flex-col bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10">
      <h2 className="text-lg font-semibold mb-4">{t('title')}</h2>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
              itemStyle={{ color: 'var(--foreground)' }}
            />
            <Area type="monotone" dataKey="completed" stroke="var(--primary)" fillOpacity={1} fill="url(#colorCompleted)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
