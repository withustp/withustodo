'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTasks } from '@/hooks/use-tasks';
import { PieChart as PieIcon } from 'lucide-react';

/**
 * Category Breakdown Widget
 * Modern donut chart with clean glassmorphic design and zero layout overlap.
 */
export function CategoryBreakdown() {
  const t = useTranslations('Dashboard.CategoryBreakdown');
  const { tasks } = useTasks();

  const nonDeleted = tasks.filter(task => !task.is_deleted);
  const totalTasks = nonDeleted.length;

  const categoryMap: Record<string, { name: string; value: number; color: string }> = {};

  nonDeleted.forEach((task) => {
    const categoryName = task.category?.name || '미분류';
    const categoryColor = task.category?.color || '#6366f1';

    if (!categoryMap[categoryName]) {
      categoryMap[categoryName] = { name: categoryName, value: 0, color: categoryColor };
    }
    categoryMap[categoryName].value += 1;
  });

  const chartData = Object.values(categoryMap);

  return (
    <Card className="p-6 h-full flex flex-col justify-between bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <PieIcon size={16} className="text-primary" />
          {t('title')}
        </h2>
        <span className="text-xs text-muted-foreground font-medium">총 {totalTasks}개</span>
      </div>

      {chartData.length === 0 ? (
        <div className="h-44 flex items-center justify-center text-center text-xs text-muted-foreground">
          할 일을 추가하면 분석 차트가 표시됩니다.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Donut Chart Container */}
          <div className="relative h-[140px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={45}
                  outerRadius={62}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const percent = totalTasks > 0 ? Math.round((data.value / totalTasks) * 100) : 0;
                      return (
                        <div className="px-2.5 py-1.5 rounded-lg bg-popover/95 border border-border shadow-xl backdrop-blur-md text-xs">
                          <span className="font-semibold text-foreground">{data.name}</span>: {data.value}개 ({percent}%)
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Total Summary */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-bold text-foreground tracking-tight">{totalTasks}</span>
              <span className="text-[10px] text-muted-foreground">작업</span>
            </div>
          </div>

          {/* Clean Category Legend Badges */}
          <div className="flex flex-wrap gap-2 justify-center max-h-[80px] overflow-y-auto pt-1">
            {chartData.map((item) => {
              const percent = totalTasks > 0 ? Math.round((item.value / totalTasks) * 100) : 0;
              return (
                <div 
                  key={item.name} 
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border/50 bg-background/40 text-xs"
                >
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="font-medium text-foreground truncate max-w-[90px]">{item.name}</span>
                  <span className="text-muted-foreground text-[11px] font-mono">{percent}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
