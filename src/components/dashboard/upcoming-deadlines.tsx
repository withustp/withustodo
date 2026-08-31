'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useTasks } from '@/hooks/use-tasks';

/**
 * Upcoming Deadlines Widget
 * Renders user's actual tasks with upcoming deadlines.
 */
export function UpcomingDeadlines() {
  const t = useTranslations('Dashboard.UpcomingDeadlines');
  const { tasks } = useTasks();

  const upcomingTasks = tasks
    .filter((task) => task.due_date && task.status !== 'done')
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 5);

  return (
    <Card className="p-6 h-full flex flex-col bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">{t('title')}</h2>
        <Link href="/tasks" className="text-sm text-muted-foreground hover:text-foreground flex items-center">
          {t('viewAll')} <ChevronRight size={16} />
        </Link>
      </div>
      
      {upcomingTasks.length > 0 ? (
        <ul className="flex flex-col gap-4">
          {upcomingTasks.map((task) => (
            <li key={task.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: task.category?.color || '#6366f1' }} 
                />
                <span className="font-medium text-sm truncate max-w-[150px] sm:max-w-[200px]">
                  {task.title}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {format(new Date(task.due_date!), 'MMM d')}
                </span>
                <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'} className="text-[10px]">
                  {t(`priority.${task.priority}`)}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          {t('empty')}
        </div>
      )}
    </Card>
  );
}
