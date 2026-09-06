'use client';

import { useState, useEffect, useCallback, useId, useMemo } from 'react';
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

      const { recurring_pattern, category, subtasks, labels, attachments, ...taskPayload } = task as any;
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
    updateTaskInStore(id, updates);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { recurring_pattern, category, subtasks, labels, attachments, ...dbUpdates } = updates as any;
      const existingTask = allTasks.find((t) => t.id === id);

      if (
        updates.recurring_pattern !== undefined ||
        updates.is_recurring !== undefined ||
        updates.description !== undefined
      ) {
        const targetPattern =
          updates.is_recurring === false
            ? null
            : (updates.recurring_pattern !== undefined
                ? updates.recurring_pattern
                : existingTask?.recurring_pattern);
        const baseDesc =
          updates.description !== undefined
            ? updates.description
            : existingTask?.description;
        dbUpdates.description = attachRecurrenceToDescription(baseDesc, targetPattern);
      }

      if (Object.keys(dbUpdates).length > 0) {
        let query = supabase.from('tasks').update(dbUpdates).eq('id', id);
        if (user) query = query.eq('user_id', user.id);
        const { error } = await query;
        if (error) throw error;
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
    const existingTask = allTasks.find((t) => t.id === id);

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
