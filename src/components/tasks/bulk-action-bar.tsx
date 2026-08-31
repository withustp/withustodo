'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTaskStore } from '@/stores/task-store';
import { useTasks } from '@/hooks/use-tasks';
import { useTranslations } from 'next-intl';
import { Check, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Bulk action bar component
 */
export function BulkActionBar() {
  const { selectedTaskIds, clearSelection } = useTaskStore();
  const { updateTask, deleteTask } = useTasks();
  const t = useTranslations('tasks');

  const handleMarkDone = async () => {
    for (const id of selectedTaskIds) {
      await updateTask(id, { status: 'done' });
    }
    clearSelection();
  };

  const handleDelete = async () => {
    for (const id of selectedTaskIds) {
      await deleteTask(id);
    }
    clearSelection();
  };

  return (
    <AnimatePresence>
      {selectedTaskIds.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-background px-4 py-3 rounded-full shadow-2xl flex items-center space-x-4 z-40"
        >
          <span className="text-sm font-medium pl-2">
            {t('selectedCount', { count: selectedTaskIds.length })}
          </span>
          <div className="w-px h-4 bg-background/20" />
          <div className="flex items-center space-x-1">
            <Button size="sm" variant="ghost" onClick={handleMarkDone} className="text-background hover:bg-background/20 hover:text-background h-8">
              <Check className="w-4 h-4 mr-2" />
              {t('markDone')}
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDelete} className="text-background hover:bg-background/20 hover:text-background h-8">
              <Trash2 className="w-4 h-4 mr-2" />
              {t('delete')}
            </Button>
          </div>
          <div className="w-px h-4 bg-background/20" />
          <Button size="icon" variant="ghost" onClick={clearSelection} className="text-background hover:bg-background/20 hover:text-background h-8 w-8 rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
