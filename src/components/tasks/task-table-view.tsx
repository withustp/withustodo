'use client';

import { useTasks } from '@/hooks/use-tasks';
import { useTaskStore } from '@/stores/task-store';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * Task table view component
 */
export function TaskTableView() {
  const { filters, selectedTaskIds, toggleTaskSelection, openDetailPanel } = useTaskStore();
  const { tasks, isLoading } = useTasks(filters);
  const t = useTranslations('tasks');

  if (isLoading) {
    return <div className="p-4 text-muted-foreground">{t('loading')}</div>;
  }

  return (
    <div className="h-full overflow-auto bg-card rounded-lg border border-border">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-muted-foreground text-sm">
            <th className="p-3 w-10"></th>
            <th className="p-3 font-medium">{t('table.title')}</th>
            <th className="p-3 font-medium">{t('table.status')}</th>
            <th className="p-3 font-medium">{t('table.priority')}</th>
            <th className="p-3 font-medium">{t('table.category')}</th>
            <th className="p-3 font-medium">{t('table.dueDate')}</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => {
            const isSelected = selectedTaskIds.includes(task.id);
            return (
              <tr 
                key={task.id} 
                onClick={() => openDetailPanel(task.id)}
                className={cn(
                  "border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors",
                  isSelected && "bg-primary/5"
                )}
              >
                <td className="p-3" onClick={e => { e.stopPropagation(); toggleTaskSelection(task.id); }}>
                  <Checkbox checked={isSelected} />
                </td>
                <td className={cn("p-3 text-sm text-foreground", task.status === 'done' && "line-through text-muted-foreground")}>
                  {task.title}
                </td>
                <td className="p-3">
                  <Badge variant="outline" className="capitalize text-xs">{t(`status.${task.status}`)}</Badge>
                </td>
                <td className="p-3">
                  <Badge variant="outline" className={cn(
                    "capitalize text-xs",
                    task.priority === 'high' && "text-destructive border-destructive/50",
                    task.priority === 'medium' && "text-warning border-warning/50",
                    task.priority === 'low' && "text-primary border-primary/50"
                  )}>
                    {t(`priority.${task.priority}`)}
                  </Badge>
                </td>
                <td className="p-3 text-xs text-muted-foreground">
                  {task.category?.name || '-'}
                </td>
                <td className="p-3 text-xs text-muted-foreground">
                  {task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
