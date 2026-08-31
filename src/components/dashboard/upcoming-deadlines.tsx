'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, addDays } from 'date-fns';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const mockDeadlines = [
  { id: '1', title: 'Finish Q3 Report', categoryColor: '#3b82f6', dueDate: new Date(), priority: 'high' },
  { id: '2', title: 'Call Client', categoryColor: '#10b981', dueDate: addDays(new Date(), 1), priority: 'medium' },
  { id: '3', title: 'Pay Bills', categoryColor: '#f59e0b', dueDate: addDays(new Date(), 2), priority: 'low' },
];

/**
 * Upcoming Deadlines Widget
 * List of upcoming tasks
 */
export function UpcomingDeadlines() {
  const t = useTranslations('Dashboard.UpcomingDeadlines');

  return (
    <Card className="p-6 h-full flex flex-col bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">{t('title')}</h2>
        <Link href="/tasks?filter=upcoming" className="text-sm text-muted-foreground hover:text-foreground flex items-center">
          {t('viewAll')} <ChevronRight size={16} />
        </Link>
      </div>
      
      {mockDeadlines.length > 0 ? (
        <ul className="flex flex-col gap-4">
          {mockDeadlines.map((task) => (
            <li key={task.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: task.categoryColor }} 
                />
                <span className="font-medium text-sm truncate max-w-[150px] sm:max-w-[200px]">
                  {task.title}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {format(task.dueDate, 'MMM d')}
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
