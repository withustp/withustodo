'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Category } from '@/types';

/**
 * Hook for category operations
 */
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
      if (error) throw error;
      setCategories((data as any) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = async (category: Partial<Category>) => {
    const { data, error } = await supabase.from('categories').insert([category]).select().single();
    if (error) throw error;
    setCategories([...categories, data as any]);
    return data;
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    setCategories(categories.map(c => c.id === id ? { ...c, ...updates } : c));
    const { error } = await supabase.from('categories').update(updates).eq('id', id);
    if (error) {
      fetchCategories();
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
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
    deleteCategory
  };
}
