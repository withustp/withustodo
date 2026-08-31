'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'Work', value: 12, color: '#3b82f6' },
  { name: 'Personal', value: 8, color: '#10b981' },
  { name: 'Study', value: 5, color: '#f59e0b' },
];

/**
 * Category Breakdown Widget
 * Donut chart showing tasks by category
 */
export function CategoryBreakdown() {
  const t = useTranslations('Dashboard.CategoryBreakdown');

  return (
    <Card className="p-6 h-full flex flex-col bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10">
      <h2 className="text-lg font-semibold mb-4">{t('title')}</h2>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
