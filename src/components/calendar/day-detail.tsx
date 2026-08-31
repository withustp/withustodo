'use client';

import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle } from 'lucide-react';
import { useTasks } from '@/hooks/use-tasks';

interface DayDetailProps {
  date: Date;
  onClose: () => void;
}

/**
 * Day Detail
 * Modal showing tasks for a specific date from real store
 */
export function DayDetail({ date, onClose }: DayDetailProps) {
  const t = useTranslations('Calendar.DayDetail');
  const { tasks, toggleStatus } = useTasks();
  const dateStr = format(date, 'yyyy-MM-dd');

  const dayTasks = tasks.filter((task) => {
    if (!task.due_date || task.is_deleted) return false;
    return format(new Date(task.due_date), 'yyyy-MM-dd') === dateStr;
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{format(date, 'EEEE, MMMM do')}</DialogTitle>
        </DialogHeader>
        <div className="py-4 flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
          {dayTasks.map(task => {
            const isDone = task.status === 'done';
            return (
              <div 
                key={task.id} 
                onClick={() => toggleStatus(task.id, task.status)}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
              >
                {isDone ? (
                  <CheckCircle2 className="text-green-500 shrink-0" size={20} />
                ) : (
                  <Circle className="text-muted-foreground shrink-0" size={20} />
                )}
                <div className="flex-1 flex flex-col min-w-0">
                  <span className={`font-medium truncate ${isDone ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <div 
                        className="w-2 h-2 rounded-full shrink-0" 
                        style={{ backgroundColor: task.category?.color || '#6366f1' }} 
                      />
                      <span className="text-xs text-muted-foreground truncate">{task.category?.name || '미분류'}</span>
                    </div>
                  </div>
                </div>
                <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'} className="text-[10px] shrink-0">
                  {t(`priority.${task.priority}`)}
                </Badge>
              </div>
            );
          })}
          {dayTasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {t('empty')}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
