'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, RefreshCcw, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Task } from '@/types';
import { toast } from 'sonner';

/**
 * Trash Page
 * Manage soft-deleted tasks with restore and permanent purge actions
 */
export default function TrashPage() {
  const t = useTranslations('Trash');
  const [deletedTasks, setDeletedTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchDeleted = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, category:categories(*)')
        .eq('is_deleted', true)
        .order('deleted_at', { ascending: false });

      if (error) throw error;
      setDeletedTasks((data as any) || []);
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchDeleted();
  }, [fetchDeleted]);

  const handleRestore = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_deleted: false, deleted_at: null })
        .eq('id', id);

      if (error) throw error;
      setDeletedTasks(prev => prev.filter(t => t.id !== id));
      toast.success(t('restore') + ' 완료!');
    } catch {
      toast.error('복원에 실패했습니다.');
    }
  };

  const handlePermanentDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setDeletedTasks(prev => prev.filter(t => t.id !== id));
      toast.success(t('delete') + ' 완료!');
    } catch {
      toast.error('삭제에 실패했습니다.');
    }
  };

  const handleEmptyTrash = async () => {
    if (deletedTasks.length === 0) return;
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('is_deleted', true);

      if (error) throw error;
      setDeletedTasks([]);
      toast.success(t('emptyTrash') + ' 완료!');
    } catch {
      toast.error('휴지통 비우기 실패');
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Button 
          variant="destructive" 
          className="gap-2"
          onClick={handleEmptyTrash}
          disabled={deletedTasks.length === 0}
        >
          <Trash2 size={16} />
          {t('emptyTrash')}
        </Button>
      </div>

      <div className="flex items-center gap-2 p-4 bg-muted/50 text-muted-foreground rounded-lg text-sm">
        <AlertCircle size={16} />
        {t('info')}
      </div>

      <div className="flex flex-col gap-4 mt-2">
        {isLoading ? (
          <div className="text-center py-10 text-muted-foreground">로딩 중...</div>
        ) : deletedTasks.length > 0 ? (
          deletedTasks.map((task) => (
            <Card key={task.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10">
              <div>
                <h3 className="font-medium line-through text-muted-foreground">{task.title}</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span>{task.category?.name || '기본'}</span>
                  <span>•</span>
                  <span>{t('deletedOn')} {task.deleted_at ? format(new Date(task.deleted_at), 'MMM d, yyyy') : '최근'}</span>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="flex-1 sm:flex-none gap-2"
                  onClick={() => handleRestore(task.id)}
                >
                  <RefreshCcw size={14} />
                  {t('restore')}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 sm:flex-none gap-2 text-destructive hover:bg-destructive/10"
                  onClick={() => handlePermanentDelete(task.id)}
                >
                  <Trash2 size={14} />
                  {t('delete')}
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Trash2 size={48} className="mb-4 opacity-20" />
            <p>{t('emptyState')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
