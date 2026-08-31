'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Task } from '@/types';
import { useTaskStore } from '@/stores/task-store';
import { useTasks } from '@/hooks/use-tasks';
import { GripVertical, Paperclip, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
}

/**
 * Task card component
 */
export function TaskCard({ task }: TaskCardProps) {
  const { selectedTaskIds, toggleTaskSelection, openDetailPanel } = useTaskStore();
  const { toggleStatus } = useTasks();
  const isSelected = selectedTaskIds.includes(task.id);

  const handleToggleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleStatus(task.id, task.status);
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTaskSelection(task.id);
  };

  const priorityColor = {
    high: 'border-l-destructive',
    medium: 'border-l-warning',
    low: 'border-l-primary',
    none: 'border-l-transparent'
  }[task.priority];

  return (
    <motion.div
      layout
      onClick={() => openDetailPanel(task.id)}
      className={cn(
        "group relative flex items-center p-3 mb-2 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-all",
        "border-l-4", priorityColor,
        isSelected && "ring-1 ring-primary border-primary"
      )}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab pr-2">
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="pr-3" onClick={handleSelect}>
        <Checkbox checked={isSelected} />
      </div>

      <div 
        className={cn(
          "w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer mr-3",
          task.status === 'done' ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"
        )}
        onClick={handleToggleStatus}
      >
        {task.status === 'done' && <Check className="w-3 h-3" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className={cn("text-sm font-medium truncate text-foreground", task.status === 'done' && "line-through text-muted-foreground")}>
          {task.title}
        </div>
        <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
          {task.category && (
            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
              {task.category.name}
            </Badge>
          )}
          {task.due_date && (
            <span className={cn(new Date(task.due_date) < new Date() && task.status !== 'done' && "text-destructive font-medium")}>
              {format(new Date(task.due_date), 'MMM d')}
            </span>
          )}
          {task.attachments && task.attachments.length > 0 && (
            <div className="flex items-center">
              <Paperclip className="w-3 h-3 mr-1" />
              {task.attachments.length}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
