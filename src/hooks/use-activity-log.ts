'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Activity {
  id: string;
  action: string;
  details: string;
  created_at: string;
}

/**
 * useActivityLog Hook
 * Logs and fetches activity
 */
export function useActivityLog(taskId?: string) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const logActivity = useCallback(async (action: string, id?: string, details?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('activity_log').insert({
      user_id: user.id,
      task_id: id || taskId,
      action,
      details,
    });
  }, [supabase, taskId]);

  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    let query = supabase.from('activity_log').select('*').order('created_at', { ascending: false });
    
    if (taskId) {
      query = query.eq('task_id', taskId);
    }

    const { data } = await query;
    if (data) {
      setActivities(data);
    }
    setIsLoading(false);
  }, [supabase, taskId]);

  return { activities, isLoading, logActivity, fetchActivities };
}
