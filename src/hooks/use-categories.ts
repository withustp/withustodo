'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Category } from '@/types';

/**
 * Hook for category operations with task counting, authenticated user_id injection, and realtime sync
 */
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch categories
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true });

      if (catError) throw catError;

      // 2. Fetch tasks to compute live task_count
      const { data: taskData } = await supabase
        .from('tasks')
        .select('category_id')
        .eq('user_id', user.id)
        .eq('is_deleted', false);

      const taskCounts: Record<string, number> = {};
      (taskData || []).forEach((t) => {
        if (t.category_id) {
          taskCounts[t.category_id] = (taskCounts[t.category_id] || 0) + 1;
        }
      });

      const categoriesWithCount = (catData || []).map((cat) => ({
        ...cat,
        task_count: taskCounts[cat.id] || 0,
      }));

      setCategories(categoriesWithCount);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = async (category: Partial<Category>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('로그인이 필요합니다.');

    const categoryWithUser = {
      name: category.name,
      color: category.color || '#6366f1',
      icon: category.icon || 'Tag',
      user_id: user.id,
      sort_order: category.sort_order ?? categories.length,
    };

    const { data, error } = await supabase
      .from('categories')
      .insert([categoryWithUser])
      .select()
      .single();

    if (error) throw error;
    setCategories((prev) => [...prev, { ...(data as any), task_count: 0 }]);
    return data;
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    const { error } = await supabase.from('categories').update(updates).eq('id', id);
    if (error) {
      fetchCategories();
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      fetchCategories();
      throw error;
    }
  };

  return {
    categories,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
    refresh: fetchCategories,
  };
}
