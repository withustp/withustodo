'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Task, TaskFilter } from '@/types';
import { useTaskStore } from '@/stores/task-store';

/**
 * Hook for task operations
 */
export function useTasks(filter?: TaskFilter) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();
  const { tasks, setTasks, addTask, updateTask: updateTaskInStore, deleteTask: deleteTaskFromStore } = useTaskStore();

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase.from('tasks').select('*, category:categories(*)').eq('is_deleted', false);
      
      if (filter) {
        if (filter.status && filter.status.length > 0) query = query.in('status', filter.status);
        if (filter.priority && filter.priority.length > 0) query = query.in('priority', filter.priority);
        if (filter.category_id) query = query.eq('category_id', filter.category_id);
        if (filter.search) query = query.ilike('title', `%${filter.search}%`);
      }

      const { data, error } = await query.order('sort_order', { ascending: true });
      if (error) throw error;
      setTasks((data as any) || []);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [filter, supabase, setTasks]);

  useEffect(() => {
    fetchTasks();
    
    const channel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchTasks();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTasks, supabase]);

  const createTask = async (task: Partial<Task>) => {
    try {
      let userId = task.user_id;
      if (!userId || userId === 'TEMP_USER_ID') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          userId = user.id;
        }
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...task, user_id: userId, is_deleted: false }])
        .select('*, category:categories(*)')
        .single();

      if (error) throw error;
      addTask(data as any);
      return data;
    } catch (err: any) {
      setError(err);
      throw err;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    updateTaskInStore(id, updates);
    try {
      const { error } = await supabase.from('tasks').update(updates).eq('id', id);
      if (error) throw error;
    } catch (err: any) {
      setError(err);
      fetchTasks();
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    updateTaskInStore(id, { is_deleted: true });
    try {
      const { error } = await supabase.from('tasks').update({ is_deleted: true }).eq('id', id);
      if (error) throw error;
    } catch (err: any) {
      setError(err);
      fetchTasks();
      throw err;
    }
  };

  const toggleStatus = async (id: string, currentStatus: Task['status']) => {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';
    await updateTask(id, { status: newStatus });
  };

  const reorderTasks = async (tasks: { id: string; sort_order: number }[]) => {
    try {
      const { error } = await supabase.from('tasks').upsert(tasks.map(t => ({ id: t.id, sort_order: t.sort_order })));
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
