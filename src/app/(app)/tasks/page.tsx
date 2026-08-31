'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { List, Kanban, Table as TableIcon } from 'lucide-react';
import { useTaskStore } from '@/stores/task-store';
import { TaskListView } from '@/components/tasks/task-list-view';
import { TaskKanbanView } from '@/components/tasks/task-kanban-view';
import { TaskTableView } from '@/components/tasks/task-table-view';
import { TaskCreateModal } from '@/components/tasks/task-create-modal';
import { TaskDetailPanel } from '@/components/tasks/task-detail-panel';
import { TaskFilters } from '@/components/tasks/task-filters';
import { BulkActionBar } from '@/components/tasks/bulk-action-bar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Tasks page component
 */
export default function TasksPage() {
  const t = useTranslations('tasks');
  const { viewMode, setViewMode, isCreateModalOpen, detailPanelTaskId, selectedTaskIds, openCreateModal } = useTaskStore();

  return (
    <motion.div 
      className="flex flex-col h-full bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h1 className="text-2xl font-semibold text-foreground">{t('title')}</h1>
        <div className="flex items-center space-x-2">
          <div className="flex bg-muted rounded-md p-1">
            <button
              onClick={() => setViewMode('list')}
              className={cn("p-2 rounded-sm transition-colors", viewMode === 'list' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={cn("p-2 rounded-sm transition-colors", viewMode === 'kanban' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}
            >
              <Kanban className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn("p-2 rounded-sm transition-colors", viewMode === 'table' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
          <Button onClick={openCreateModal}>{t('createTask')}</Button>
        </div>
      </div>

      <TaskFilters />

      <div className="flex-1 overflow-hidden relative p-4">
        {viewMode === 'list' && <TaskListView />}
        {viewMode === 'kanban' && <TaskKanbanView />}
        {viewMode === 'table' && <TaskTableView />}
      </div>

      {isCreateModalOpen && <TaskCreateModal />}
      {detailPanelTaskId && <TaskDetailPanel />}
      {selectedTaskIds.length > 0 && <BulkActionBar />}
    </motion.div>
  );
}
