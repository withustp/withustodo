'use client';

import { useTasks } from '@/hooks/use-tasks';
import { useTaskStore } from '@/stores/task-store';
import { TaskCard } from './task-card';
import { useTranslations } from 'next-intl';

/**
 * Task kanban view component
 */
export function TaskKanbanView() {
  const { filters } = useTaskStore();
  const { tasks, isLoading } = useTasks(filters);
  const t = useTranslations('tasks');

  if (isLoading) {
    return <div className="p-4 text-muted-foreground">{t('loading')}</div>;
  }

  const columns = ['todo', 'in_progress', 'done'] as const;

  return (
    <div className="flex h-full gap-4 overflow-x-auto pb-4">
      {columns.map(status => {
        const columnTasks = tasks.filter(task => task.status === status);
        return (
          <div key={status} className="flex flex-col flex-1 min-w-[300px] bg-muted/20 rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-4 capitalize flex items-center justify-between">
              {t(`status.${status}`)}
              <span className="bg-muted text-muted-foreground text-xs py-1 px-2 rounded-full">{columnTasks.length}</span>
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2">
              {columnTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
