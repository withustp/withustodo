'use client';

import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle } from 'lucide-react';

interface DayDetailProps {
  date: Date;
  onClose: () => void;
}

const mockTasks = [
  { id: 1, title: 'Finish report', status: 'completed', priority: 'high', category: 'Work', color: '#3b82f6' },
  { id: 2, title: 'Read book', status: 'pending', priority: 'low', category: 'Personal', color: '#10b981' },
];

/**
 * Day Detail
 * Modal showing tasks for a specific date
 */
export function DayDetail({ date, onClose }: DayDetailProps) {
  const t = useTranslations('Calendar.DayDetail');

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{format(date, 'EEEE, MMMM do')}</DialogTitle>
        </DialogHeader>
        <div className="py-4 flex flex-col gap-3">
          {mockTasks.map(task => (
            <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              {task.status === 'completed' ? (
                <CheckCircle2 className="text-green-500" size={20} />
              ) : (
                <Circle className="text-muted-foreground" size={20} />
              )}
              <div className="flex-1 flex flex-col">
                <span className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                  {task.title}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: task.color }} />
                    <span className="text-xs text-muted-foreground">{task.category}</span>
                  </div>
                </div>
              </div>
              <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'} className="text-[10px]">
                {t(`priority.${task.priority}`)}
              </Badge>
            </div>
          ))}
          {mockTasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {t('empty')}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
