'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskStore } from '@/stores/task-store';
import { useTasks } from '@/hooks/use-tasks';
import { useTranslations } from 'next-intl';
import { X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

/**
 * Task detail panel component
 */
export function TaskDetailPanel() {
  const { detailPanelTaskId, closeDetailPanel } = useTaskStore();
  const { tasks, updateTask, deleteTask } = useTasks();
  const t = useTranslations('tasks');
  const [localTitle, setLocalTitle] = useState('');
  const [localDesc, setLocalDesc] = useState('');

  const task = tasks.find(t => t.id === detailPanelTaskId);

  useEffect(() => {
    if (task) {
      setLocalTitle(task.title);
      setLocalDesc(task.description || '');
    }
  }, [task]);

  if (!task) return null;

  const handleBlur = (field: 'title' | 'description', value: string) => {
    if (task[field] !== value) {
      updateTask(task.id, { [field]: value });
    }
  };

  const handleDelete = () => {
    deleteTask(task.id);
    closeDetailPanel();
  };

  return (
    <AnimatePresence>
      {detailPanelTaskId && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={closeDetailPanel}
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-card border-l border-border shadow-xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold text-foreground">{t('detailTitle')}</h2>
              <Button variant="ghost" size="icon" onClick={closeDetailPanel}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div>
                <Input 
                  value={localTitle} 
                  onChange={e => setLocalTitle(e.target.value)}
                  onBlur={e => handleBlur('title', e.target.value)}
                  className="text-lg font-semibold border-none px-0 focus-visible:ring-0 shadow-none bg-transparent"
                  placeholder={t('taskTitlePlaceholder')}
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">{t('description')}</label>
                <Textarea 
                  value={localDesc}
                  onChange={e => setLocalDesc(e.target.value)}
                  onBlur={e => handleBlur('description', e.target.value)}
                  placeholder={t('addDescription')}
                  className="resize-none min-h-[100px]"
                />
              </div>
              
              {/* Additional fields would go here */}
            </div>

            <div className="p-4 border-t border-border flex justify-end">
              <Button variant="destructive" size="sm" onClick={handleDelete} className="flex items-center">
                <Trash2 className="w-4 h-4 mr-2" />
                {t('delete')}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
