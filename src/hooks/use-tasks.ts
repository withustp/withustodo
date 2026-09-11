'use client';

import { useState, useEffect, useCallback, useId, useMemo } from 'react';
import { format } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import { Task, TaskFilter } from '@/types';
import { useTaskStore } from '@/stores/task-store';
import {
  calculateNextDueDate,
  extractRecurrenceFromDescription,
  attachRecurrenceToDescription,
} from '@/lib/recurrence';

/**
 * Hook for task operations with safe real-time updates, Zustand global cache,
 * and reactive client-side filtering by category, status, priority, and search.
 */
export function useTasks(filter?: TaskFilter) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();
  const hookId = useId().replace(/:/g, '');
  const { tasks: allTasks, setTasks, addTask, updateTask: updateTaskInStore, deleteTask: deleteTaskFromStore } = useTaskStore();

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

      // Always fetch full task collection so category counts and global views stay consistent
      const { data, error } = await supabase
        .from('tasks')
        .select('*, category:categories(*)')
        .eq('user_id', user.id)
        .eq('is_deleted', false)
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedTasks: Task[] = ((data as any[]) || []).map((t) => {
        const { cleanDescription, pattern } = extractRecurrenceFromDescription(t.description);
        return {
          ...t,
          description: cleanDescription,
          is_recurring: Boolean(t.is_recurring),
          recurring_pattern: pattern,
        };
      });
      setTasks(formattedTasks);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, setTasks]);

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

  // Reactive client-side filtering: instant feedback with zero network latency or state collisions
  const filteredTasks = useMemo(() => {
    if (!filter || Object.keys(filter).length === 0) return allTasks;

    return allTasks.filter((task) => {
      if (task.is_deleted) return false;
      if (filter.category_id && task.category_id !== filter.category_id) return false;
      if (filter.status && filter.status.length > 0 && !filter.status.includes(task.status)) return false;
      if (filter.priority && filter.priority.length > 0 && !filter.priority.includes(task.priority)) return false;
      if (filter.search && !task.title.toLowerCase().includes(filter.search.toLowerCase())) return false;
      return true;
    });
  }, [allTasks, filter]);

  const createTask = async (task: Partial<Task>) => {
    try {
      let userId = task.user_id;
      if (!userId || userId === 'TEMP_USER_ID') {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('로그인이 필요합니다.');
        userId = user.id;
      }

      const { recurring_pattern, category, subtasks, labels, attachments, completed_at, ...taskPayload } = task as any;
      const isRecurring = Boolean(task.is_recurring);
      const descWithRecurrence = isRecurring && recurring_pattern
        ? attachRecurrenceToDescription(taskPayload.description, recurring_pattern)
        : (taskPayload.description || null);

      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          ...taskPayload,
          description: descWithRecurrence,
          user_id: userId,
          is_recurring: isRecurring,
          is_deleted: false,
        }])
        .select('*, category:categories(*)')
        .single();

      if (error) throw error;

      const fullTask: Task = {
        ...data,
        description: taskPayload.description || null,
        is_recurring: isRecurring,
        recurring_pattern: recurring_pattern || null,
      };

      addTask(fullTask);
      return fullTask;
    } catch (err: any) {
      setError(err);
      throw err;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const existingTask = allTasks.find((t) => t.id === id);
      const appliedUpdates = { ...updates };

      // If completing a task that has no due date, persist a concrete completion date
      // so it remains anchored to that calendar date instead of disappearing
      if (
        appliedUpdates.status === 'done' &&
        existingTask &&
        existingTask.status !== 'done' &&
        !existingTask.due_date &&
        !appliedUpdates.due_date
      ) {
        appliedUpdates.due_date = new Date().toISOString();
      }

      updateTaskInStore(id, appliedUpdates);

      const { data: { user } } = await supabase.auth.getUser();
      const { recurring_pattern, category, subtasks, labels, attachments, completed_at, ...dbUpdates } = appliedUpdates as any;

      if (
        appliedUpdates.recurring_pattern !== undefined ||
        appliedUpdates.is_recurring !== undefined ||
        appliedUpdates.description !== undefined
      ) {
        const targetPattern =
          appliedUpdates.is_recurring === false
            ? null
            : (appliedUpdates.recurring_pattern !== undefined
                ? appliedUpdates.recurring_pattern
                : existingTask?.recurring_pattern);
        const baseDesc =
          appliedUpdates.description !== undefined
            ? appliedUpdates.description
            : existingTask?.description;
        dbUpdates.description = attachRecurrenceToDescription(baseDesc, targetPattern);
      }

      // Always maintain accurate updated_at timestamp in Supabase
      dbUpdates.updated_at = new Date().toISOString();

      if (Object.keys(dbUpdates).length > 0) {
        let query = supabase.from('tasks').update(dbUpdates).eq('id', id);
        if (user) query = query.eq('user_id', user.id);
        const { error } = await query;
        if (error) throw error;
      }

      // Automatically generate next occurrence when a recurring task is transitioned to 'done'
      if (
        appliedUpdates.status === 'done' &&
        existingTask &&
        existingTask.status !== 'done' &&
        existingTask.is_recurring &&
        existingTask.recurring_pattern
      ) {
        const baseDate = appliedUpdates.due_date || existingTask.due_date || new Date();
        const nextDueDate = calculateNextDueDate(
          baseDate,
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
            // Failure to schedule next recurrence should not block updating current task
          }
        }
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

  const toggleStatus = async (
    id: string,
    currentStatus: Task['status'],
    targetDate?: Date | string
  ) => {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';
    const existingTask = allTasks.find((t) => t.id === id);

    const updates: Partial<Task> = {
      status: newStatus,
    };

    if (newStatus === 'done') {
      if (targetDate) {
        const dateStr =
          typeof targetDate === 'string'
            ? targetDate
            : format(targetDate, "yyyy-MM-dd'T'12:00:00XXX");
        if (!existingTask?.due_date) {
          updates.due_date = dateStr;
        }
      } else if (!existingTask?.due_date) {
        updates.due_date = new Date().toISOString();
      }
    }

    await updateTask(id, updates);
  };

  const reorderTasks = async (tasksList: { id: string; sort_order: number }[]) => {
    // Optimistically update store
    const sortMap = new Map(tasksList.map((t) => [t.id, t.sort_order]));
    useTaskStore.setState((state) => ({
      tasks: state.tasks.map((t) => (sortMap.has(t.id) ? { ...t, sort_order: sortMap.get(t.id)! } : t)),
    }));

    try {
      await Promise.all(
        tasksList.map((t) =>
          supabase.from('tasks').update({ sort_order: t.sort_order }).eq('id', t.id)
        )
      );
    } catch (err: any) {
      setError(err);
      fetchTasks();
      throw err;
    }
  };

  return {
    tasks: filteredTasks,
    allTasks,
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
