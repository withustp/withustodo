'use client';

import { useState } from 'react';
import { useTaskStore } from '@/stores/task-store';
import { useTasks } from '@/hooks/use-tasks';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * Task create modal component
 */
export function TaskCreateModal() {
  const { isCreateModalOpen, closeCreateModal } = useTaskStore();
  const { createTask } = useTasks();
  const t = useTranslations('tasks');
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await createTask({
        title,
        status: 'todo',
        priority: 'none',
      });
      setTitle('');
      closeCreateModal();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isCreateModalOpen} onClose={closeCreateModal} title={t('createTask')}>
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div>
          <Input
            autoFocus
            placeholder={t('taskTitlePlaceholder')}
            value={title}
            onChange={e => setTitle(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="ghost" onClick={closeCreateModal} disabled={isSubmitting}>
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={!title.trim() || isSubmitting}>
            {t('save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
