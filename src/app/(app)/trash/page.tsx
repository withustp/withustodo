'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, RefreshCcw, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const mockDeletedTasks = [
  { id: '1', title: 'Buy groceries', category: 'Personal', deletedAt: new Date() },
  { id: '2', title: 'Call John', category: 'Work', deletedAt: new Date(Date.now() - 86400000) },
];

/**
 * Trash Page
 * Manage soft-deleted tasks
 */
export default function TrashPage() {
  const t = useTranslations('Trash');

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Button variant="destructive" className="gap-2">
          <Trash2 size={16} />
          {t('emptyTrash')}
        </Button>
      </div>

      <div className="flex items-center gap-2 p-4 bg-muted/50 text-muted-foreground rounded-lg text-sm">
        <AlertCircle size={16} />
        {t('info')}
      </div>

      <div className="flex flex-col gap-4 mt-2">
        {mockDeletedTasks.length > 0 ? (
          mockDeletedTasks.map((task) => (
            <Card key={task.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10">
              <div>
                <h3 className="font-medium line-through text-muted-foreground">{task.title}</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span>{task.category}</span>
                  <span>•</span>
                  <span>{t('deletedOn')} {format(task.deletedAt, 'MMM d, yyyy')}</span>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="secondary" size="sm" className="flex-1 sm:flex-none gap-2">
                  <RefreshCcw size={14} />
                  {t('restore')}
                </Button>
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none gap-2 text-destructive hover:bg-destructive/10">
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
