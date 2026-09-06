'use client';

import { useState, useEffect, useCallback, useId } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Task, TaskFilter } from '@/types';
import { useTaskStore } from '@/stores/task-store';
import { calculateNextDueDate } from '@/lib/recurrence';

/**
 * Hook for task operations with safe real-time updates and Zustand cache.
 */
export function useTasks(filter?: TaskFilter) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();
  const hookId = useId().replace(/:/g, '');
  const { tasks, setTasks, addTask, updateTask: updateTaskInStore, deleteTask: deleteTaskFromStore } = useTaskStore();

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTasks([]);
        setIsLoading(false);
        return;
      }

      let query = supabase
        .from('tasks')
        .select('*, category:categories(*), recurring_patterns(*)')
        .eq('user_id', user.id)
        .eq('is_deleted', false);
      
      if (filter) {
        if (filter.status && filter.status.length > 0) query = query.in('status', filter.status);
        if (filter.priority && filter.priority.length > 0) query = query.in('priority', filter.priority);
        if (filter.category_id) query = query.eq('category_id', filter.category_id);
        if (filter.search) query = query.ilike('title', `%${filter.search}%`);
      }

      const { data, error } = await query
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true });
      if (error) throw error;

      const formattedTasks: Task[] = ((data as any[]) || []).map((t) => {
        const patternRaw = Array.isArray(t.recurring_patterns)
          ? t.recurring_patterns[0]
          : t.recurring_patterns;
        return {
          ...t,
          is_recurring: Boolean(t.is_recurring),
          recurring_pattern: patternRaw
            ? {
                type: patternRaw.type,
                interval: patternRaw.interval_value ?? patternRaw.interval ?? 1,
                days_of_week: patternRaw.days_of_week,
                day_of_month: patternRaw.day_of_month,
                end_date: patternRaw.end_date,
              }
            : null,
        };
      });
      setTasks(formattedTasks);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [filter, supabase, setTasks]);

  useEffect(() => {
    fetchTasks();
    
    // Use unique channel identifier to prevent collision across concurrent components
    const channelName = `tasks-realtime-${hookId}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchTasks();
      });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTasks, hookId, supabase]);

  const createTask = async (task: Partial<Task>) => {
    try {
      let userId = task.user_id;
      if (!userId || userId === 'TEMP_USER_ID') {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('로그인이 필요합니다.');
        userId = user.id;
      }

      const { recurring_pattern, category, subtasks, labels, attachments, ...taskPayload } = task as any;
      const isRecurring = Boolean(task.is_recurring);

      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          ...taskPayload,
          user_id: userId,
          is_recurring: isRecurring,
          is_deleted: false,
        }])
        .select('*, category:categories(*)')
        .single();

      if (error) throw error;

      let savedPattern = null;
      if (isRecurring && recurring_pattern) {
        const { data: pData, error: pError } = await supabase
          .from('recurring_patterns')
          .insert([{
            task_id: data.id,
            type: recurring_pattern.type,
            interval_value: recurring_pattern.interval || 1,
            days_of_week: recurring_pattern.days_of_week || null,
            day_of_month: recurring_pattern.day_of_month || null,
            end_date: recurring_pattern.end_date || null,
          }])
          .select()
          .single();

        if (!pError && pData) {
          savedPattern = {
            type: pData.type,
            interval: pData.interval_value,
            days_of_week: pData.days_of_week,
            day_of_month: pData.day_of_month,
            end_date: pData.end_date,
          };
        }
      }

      const fullTask: Task = {
        ...data,
        is_recurring: isRecurring,
        recurring_pattern: savedPattern || recurring_pattern || null,
      };

      addTask(fullTask);
      return fullTask;
    } catch (err: any) {
      setError(err);
      throw err;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    updateTaskInStore(id, updates);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { recurring_pattern, category, subtasks, labels, attachments, ...dbUpdates } = updates as any;

      if (Object.keys(dbUpdates).length > 0) {
        let query = supabase.from('tasks').update(dbUpdates).eq('id', id);
        if (user) query = query.eq('user_id', user.id);
        const { error } = await query;
        if (error) throw error;
      }

      if (updates.is_recurring === false) {
        await supabase.from('recurring_patterns').delete().eq('task_id', id);
      } else if (recurring_pattern) {
        await supabase.from('recurring_patterns').upsert(
          {
            task_id: id,
            type: recurring_pattern.type,
            interval_value: recurring_pattern.interval || 1,
            days_of_week: recurring_pattern.days_of_week || null,
            day_of_month: recurring_pattern.day_of_month || null,
            end_date: recurring_pattern.end_date || null,
          },
          { onConflict: 'task_id' }
        );
      }
    } catch (err: any) {
      setError(err);
      fetchTasks();
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    updateTaskInStore(id, { is_deleted: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let query = supabase
        .from('tasks')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', id);
      if (user) query = query.eq('user_id', user.id);
      const { error } = await query;
      if (error) throw error;
    } catch (err: any) {
      setError(err);
      fetchTasks();
      throw err;
    }
  };

  const toggleStatus = async (id: string, currentStatus: Task['status']) => {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';
    const completedAt = newStatus === 'done' ? new Date().toISOString() : null;
    const existingTask = tasks.find((t) => t.id === id);

    await updateTask(id, {
      status: newStatus,
      completed_at: completedAt,
    });

    // Automatically generate next occurrence when a recurring task is completed
    if (newStatus === 'done' && existingTask?.is_recurring && existingTask.recurring_pattern) {
      const nextDueDate = calculateNextDueDate(
        existingTask.due_date || new Date(),
        existingTask.recurring_pattern
      );

      if (nextDueDate) {
        try {
          await createTask({
            title: existingTask.title,
            description: existingTask.description,
            priority: existingTask.priority,
            category_id: existingTask.category_id,
            status: 'todo',
            due_date: nextDueDate.toISOString(),
            is_recurring: true,
            recurring_pattern: existingTask.recurring_pattern,
          });
        } catch {
          // Failure to schedule next recurrence should not prevent completing current task
        }
      }
    }
  };

  const reorderTasks = async (tasksList: { id: string; sort_order: number }[]) => {
    try {
      const { error } = await supabase.from('tasks').upsert(tasksList.map(t => ({ id: t.id, sort_order: t.sort_order })));
      if (error) throw error;
    } catch (err: any) {
      setError(err);
      throw err;
    }
  };

  return {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleStatus,
    reorderTasks,
    refresh: fetchTasks
  };
}
