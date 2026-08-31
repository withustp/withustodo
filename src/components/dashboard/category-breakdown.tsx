'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTasks } from '@/hooks/use-tasks';

/**
 * Category Breakdown Widget
 * Dynamically computes task distribution across categories.
 */
export function CategoryBreakdown() {
  const t = useTranslations('Dashboard.CategoryBreakdown');
  const { tasks } = useTasks();

  const categoryMap: Record<string, { name: string; value: number; color: string }> = {};

  tasks.forEach((task) => {
    const categoryName = task.category?.name || '미분류';
    const categoryColor = task.category?.color || '#6366f1';

    if (!categoryMap[categoryName]) {
      categoryMap[categoryName] = { name: categoryName, value: 0, color: categoryColor };
    }
    categoryMap[categoryName].value += 1;
  });

  const chartData = Object.values(categoryMap);

  return (
    <Card className="p-6 h-full flex flex-col bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10">
      <h2 className="text-lg font-semibold mb-4">{t('title')}</h2>
      <div className="h-[200px] w-full flex items-center justify-center">
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground">할 일을 추가하면 분석 차트가 표시됩니다.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
