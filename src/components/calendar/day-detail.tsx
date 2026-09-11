'use client';

import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Repeat } from 'lucide-react';
import { useTasks } from '@/hooks/use-tasks';
import { useTaskStore } from '@/stores/task-store';
import { formatRecurrenceSummary, isTaskScheduledOnDate } from '@/lib/recurrence';

interface DayDetailProps {
  date: Date;
  onClose: () => void;
}

/**
 * Day Detail
 * Modal showing tasks and recurring occurrences for a specific date
 */
export function DayDetail({ date, onClose }: DayDetailProps) {
  const t = useTranslations('Calendar.DayDetail');
  const { tasks, toggleStatus } = useTasks();
  const { openDetailPanel } = useTaskStore();

  const dayTasks = tasks.filter((task) => isTaskScheduledOnDate(task, date));

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
                onClick={() => {
                  openDetailPanel(task.id);
                  onClose();
                }}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 hover:border-primary/30 transition-all cursor-pointer group"
                title="클릭하여 상세 정보 수정"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStatus(task.id, task.status, date);
                  }}
                  className="shrink-0 p-0.5 rounded-full hover:bg-muted focus:outline-none transition-colors"
                  title={isDone ? '완료 취소' : '완료로 표시'}
                >
                  {isDone ? (
                    <CheckCircle2 className="text-green-500 shrink-0" size={20} />
                  ) : (
                    <Circle className="text-muted-foreground shrink-0 group-hover:text-primary transition-colors" size={20} />
                  )}
                </button>
                <div className="flex-1 flex flex-col min-w-0">
                  <span className={`font-medium truncate group-hover:text-primary transition-colors ${isDone ? 'line-through text-muted-foreground' : ''}`}>
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
                    {task.is_recurring && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-indigo-400 font-medium">
                        <Repeat size={10} />
                        {task.recurring_pattern ? formatRecurrenceSummary(task.recurring_pattern, 'ko') : '반복'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'} className="text-[10px]">
                    {t(`priority.${task.priority}`)}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    수정
                  </span>
                </div>
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
