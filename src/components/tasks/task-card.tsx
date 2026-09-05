'use client';

import { motion } from 'framer-motion';
import { Task } from '@/types';
import { useTaskStore } from '@/stores/task-store';
import { useTasks } from '@/hooks/use-tasks';
import { GripVertical, Paperclip, Check, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
}

/**
 * Task card component with high-contrast glowing status circle and rich category pills
 */
export function TaskCard({ task }: TaskCardProps) {
  const { selectedTaskIds, toggleTaskSelection, openDetailPanel } = useTaskStore();
  const { toggleStatus } = useTasks();
  const isSelected = selectedTaskIds.includes(task.id);
  const isDone = task.status === 'done';

  const handleToggleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleStatus(task.id, task.status);
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTaskSelection(task.id);
  };

  const isOverdue = task.due_date && !isDone && new Date(task.due_date) < new Date();

  return (
    <motion.div
      layout
      onClick={() => openDetailPanel(task.id)}
      className={cn(
        "group relative flex items-center p-3.5 mb-2.5 rounded-xl border transition-all cursor-pointer",
        isSelected
          ? "border-primary bg-primary/10 ring-1 ring-primary/40 shadow-md"
          : "border-border/70 bg-card/70 hover:border-primary/40 hover:bg-muted/40 shadow-sm",
        isDone && "opacity-60 bg-muted/20"
      )}
      whileHover={{ scale: 1.008 }}
      transition={{ duration: 0.15 }}
    >
      {/* Priority Color Bar on Left */}
      <div 
        className={cn(
          "absolute left-0 top-2 bottom-2 w-1 rounded-r-full transition-colors",
          task.priority === 'high' && "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]",
          task.priority === 'medium' && "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
          task.priority === 'low' && "bg-blue-500",
          task.priority === 'none' && "bg-transparent"
        )}
      />

      {/* Drag Grip handle */}
      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab pl-1 pr-1.5 text-muted-foreground">
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      {/* Selection Checkbox (visible on hover or when selected) */}
      <div 
        className={cn(
          "pr-2.5 transition-opacity",
          isSelected ? "opacity-100" : "opacity-40 group-hover:opacity-100"
        )} 
        onClick={handleSelect}
      >
        <Checkbox checked={isSelected} className="border-border/80 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
      </div>

      {/* Crisp Glowing Status Circle Toggle */}
      <button 
        type="button"
        onClick={handleToggleStatus}
        className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer mr-3 transition-all shrink-0",
          isDone 
            ? "bg-primary border-primary text-primary-foreground shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
            : "border-primary/60 hover:border-primary hover:bg-primary/20 hover:scale-110 shadow-sm"
        )}
        title={isDone ? "완료 취소" : "완료 처리"}
      >
        {isDone && <Check className="w-3 h-3 stroke-[3]" />}
      </button>

      {/* Task Content */}
      <div className="flex-1 min-w-0 pr-2">
        <div className={cn(
          "text-sm font-semibold truncate transition-colors",
          isDone ? "line-through text-muted-foreground" : "text-foreground"
        )}>
          {task.title}
        </div>

        {/* Metadata Badges */}
        <div className="flex items-center flex-wrap gap-2 mt-1.5 text-xs text-muted-foreground">
          {/* Category Pill */}
          {task.category && (
            <span 
              className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border"
              style={{
                backgroundColor: `${task.category.color}15`,
                borderColor: `${task.category.color}35`,
                color: task.category.color
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.category.color }} />
              {task.category.name}
            </span>
          )}

          {/* Priority Badge */}
          {task.priority !== 'none' && (
            <Badge 
              variant="outline" 
              className={cn(
                "text-[10px] px-1.5 py-0 h-4 font-semibold",
                task.priority === 'high' && "text-destructive border-destructive/40 bg-destructive/10",
                task.priority === 'medium' && "text-amber-500 border-amber-500/40 bg-amber-500/10",
                task.priority === 'low' && "text-blue-400 border-blue-500/40 bg-blue-500/10"
              )}
            >
              {task.priority === 'high' ? '높음' : task.priority === 'medium' ? '보통' : '낮음'}
            </Badge>
          )}

          {/* Due Date */}
          {task.due_date && (
            <span className={cn(
              "inline-flex items-center gap-1 font-medium text-[11px]",
              isOverdue ? "text-destructive font-semibold" : "text-muted-foreground"
            )}>
              {isOverdue ? <AlertCircle size={11} /> : <CalendarIcon size={11} />}
              {format(new Date(task.due_date), 'MMM d')}
              {isOverdue && ' (기한 초과)'}
            </span>
          )}

          {/* Attachments */}
          {task.attachments && task.attachments.length > 0 && (
            <span className="inline-flex items-center text-[11px]">
              <Paperclip className="w-3 h-3 mr-0.5" />
              {task.attachments.length}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
