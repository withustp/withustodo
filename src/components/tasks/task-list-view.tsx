'use client';

import { useTasks } from '@/hooks/use-tasks';
import { useTaskStore } from '@/stores/task-store';
import { TaskCard } from './task-card';
import { useTranslations } from 'next-intl';

/**
 * Task list view component
 */
export function TaskListView() {
  const { filters } = useTaskStore();
  const { tasks, isLoading } = useTasks(filters);
  const t = useTranslations('tasks');

  if (isLoading) {
    return <div className="p-4 text-muted-foreground">{t('loading')}</div>;
  }

  if (!tasks.length) {
    return <div className="p-8 text-center text-muted-foreground">{t('noTasks')}</div>;
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  const todoTasks = sortedTasks.filter(t => t.status === 'todo');
  const inProgressTasks = sortedTasks.filter(t => t.status === 'in_progress');
  const doneTasks = sortedTasks.filter(t => t.status === 'done');

  return (
    <div className="h-full overflow-y-auto pr-2">
      <div className="max-w-4xl mx-auto space-y-6">
        {todoTasks.length > 0 && (
          <section>
            <h3 className="font-semibold text-foreground mb-3">{t('status.todo')} ({todoTasks.length})</h3>
            <div>{todoTasks.map(task => <TaskCard key={task.id} task={task} />)}</div>
          </section>
        )}
        {inProgressTasks.length > 0 && (
          <section>
            <h3 className="font-semibold text-foreground mb-3">{t('status.in_progress')} ({inProgressTasks.length})</h3>
            <div>{inProgressTasks.map(task => <TaskCard key={task.id} task={task} />)}</div>
          </section>
        )}
        {doneTasks.length > 0 && (
          <section>
            <h3 className="font-semibold text-foreground mb-3">{t('status.done')} ({doneTasks.length})</h3>
            <div>{doneTasks.map(task => <TaskCard key={task.id} task={task} />)}</div>
          </section>
        )}
      </div>
    </div>
  );
}
