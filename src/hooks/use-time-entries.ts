'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface TimeEntry {
  id: string;
  user_id: string;
  task_id: string | null;
  duration_minutes: number;
  type: 'pomodoro' | 'short_break' | 'long_break';
  completed_at: string;
  task?: {
    title: string;
  };
}

/**
 * Hook to manage pomodoro and focus time entries stored in Supabase DB.
 */
export function useTimeEntries() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('time_entries')
        .select('*, task:tasks(title)')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      setEntries((data as any) || []);
    } catch {
      // Graceful fallback
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const addTimeEntry = async (entry: {
    duration_minutes: number;
    task_id?: string | null;
    type?: 'pomodoro' | 'short_break' | 'long_break';
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('time_entries')
        .insert([{
          user_id: user.id,
          task_id: entry.task_id === 'none' ? null : entry.task_id,
          duration_minutes: entry.duration_minutes,
          type: entry.type || 'pomodoro',
          completed_at: new Date().toISOString()
        }])
        .select('*, task:tasks(title)')
        .single();

      if (error) throw error;

      // If tied to a task, increment actual_minutes on that task
      if (entry.task_id && entry.task_id !== 'none') {
        const { data: taskData } = await supabase.from('tasks').select('actual_minutes').eq('id', entry.task_id).single();
        const currentMins = taskData?.actual_minutes || 0;
        await supabase.from('tasks').update({
          actual_minutes: currentMins + entry.duration_minutes
        }).eq('id', entry.task_id);
      }

      setEntries((prev) => [data as any, ...prev]);
      return data;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to log time entry:', err);
    }
  };

  // Calculate total focus minutes for today
  const todayStr = new Date().toDateString();
  const todayEntries = entries.filter(e => new Date(e.completed_at).toDateString() === todayStr);
  const todayMinutes = todayEntries.reduce((acc, curr) => acc + (curr.duration_minutes || 0), 0);

  // Calculate total focus minutes for yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  const yesterdayEntries = entries.filter(e => new Date(e.completed_at).toDateString() === yesterdayStr);
  const yesterdayMinutes = yesterdayEntries.reduce((acc, curr) => acc + (curr.duration_minutes || 0), 0);

  return {
    entries,
    todayEntries,
    todayMinutes,
    yesterdayMinutes,
    isLoading,
    addTimeEntry,
    refresh: fetchEntries
  };
}
