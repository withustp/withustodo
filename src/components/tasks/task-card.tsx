'use client';

import { motion } from 'framer-motion';
import { Task } from '@/types';
import { useTaskStore } from '@/stores/task-store';
import { useTasks } from '@/hooks/use-tasks';
import { GripVertical, Paperclip, Check, Calendar as CalendarIcon, AlertCircle, Clock, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { formatRecurrenceSummary } from '@/lib/recurrence';
import { getDueDateStatus } from '@/lib/date-utils';

export interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  isOverlay?: boolean;
  attributes?: Record<string, any>;
  listeners?: Record<string, any>;
}

/**
 * Task card component with high-contrast glowing status circle and rich category pills.
 * Enables dragging across the entire card surface while isolating child button interactions.
 *
 * @param props - TaskCardProps containing task data and dnd-kit attributes/listeners
 */
export function TaskCard({ task, isDragging, isOverlay, attributes, listeners }: TaskCardProps) {
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

  const handleClick = () => {
    // Suppress opening detail panel if card is currently actively dragging or an overlay
    if (isDragging || isOverlay) return;
    openDetailPanel(task.id);
  };

  const dueDateStatus = getDueDateStatus(task.due_date, isDone);
  const isOverdue = Boolean(dueDateStatus?.isOverdue);

  return (
    <motion.div
      layout={!isOverlay}
      onClick={handleClick}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative flex items-center p-3.5 mb-2.5 rounded-xl border select-none transition-all",
        isOverlay
          ? "border-primary bg-card/95 backdrop-blur-xl shadow-2xl shadow-primary/30 ring-2 ring-primary/40 cursor-grabbing z-50"
          : isDragging
          ? "border-dashed border-primary/40 bg-primary/5 opacity-30 shadow-inner cursor-grabbing"
          : isSelected
          ? "border-primary bg-primary/10 ring-1 ring-primary/40 shadow-md cursor-grab active:cursor-grabbing"
          : isDone
          ? "border-border/30 bg-card/40 opacity-60 hover:opacity-100 hover:border-border/60 cursor-grab active:cursor-grabbing"
          : "border-border/50 bg-card/70 hover:bg-card/90 hover:border-border/80 hover:shadow-sm cursor-grab active:cursor-grabbing"
      )}
      whileHover={isOverlay ? undefined : { scale: 1.008 }}
      transition={{ duration: 0.15 }}
    >
      {/* Priority Color Stripe on the Left */}
      <div 
        className={cn(
          "absolute left-0 top-2 bottom-2 w-1 rounded-r-full transition-all",
          task.priority === 'high' && "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]",
          task.priority === 'medium' && "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
          task.priority === 'low' && "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]",
          task.priority === 'none' && "bg-transparent"
        )} 
      />

      {/* Drag Handle Indicator */}
      <div className="text-muted-foreground/30 group-hover:text-muted-foreground/70 transition-colors mr-1 cursor-grab active:cursor-grabbing">
        <GripVertical size={14} />
      </div>

      {/* Select Checkbox (Hover/Selected) */}
      <div 
        onClick={handleSelect}
        className={cn(
          "mr-2 transition-opacity",
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-within:opacity-100"
        )}
      >
        <Checkbox 
          checked={isSelected} 
          className="h-4 w-4 border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
      </div>

      {/* Glowing Completion Toggle Circle */}
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={handleToggleStatus}
        className={cn(
          "relative flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all mr-3 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          isDone
            ? "border-primary bg-primary text-primary-foreground shadow-[0_0_10px_rgba(99,102,241,0.5)]"
            : "border-muted-foreground/40 hover:border-primary hover:scale-105"
        )}
      >
        {isDone && <Check size={11} className="stroke-[3]" />}
      </button>

      {/* Content Area */}
      <div className="flex-1 min-w-0 pr-2">
        {/* Title */}
        <h4 className={cn(
          "text-sm font-semibold tracking-tight transition-all truncate text-foreground",
          isDone && "line-through text-muted-foreground font-normal"
        )}>
          {task.title}
        </h4>

        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-muted-foreground">
          {/* Category Chip */}
          {task.category && (
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-all"
              style={{
                backgroundColor: `${task.category.color}15`,
                borderColor: `${task.category.color}40`,
                color: task.category.color,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: task.category.color }}
              />
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

          {/* Due Date & Remaining Days Countdown */}
          {dueDateStatus && (
            <span className={cn(
              "inline-flex items-center gap-1 font-medium text-[11px]",
              dueDateStatus.isOverdue
                ? "text-destructive font-semibold"
                : dueDateStatus.isToday
                ? "text-amber-500 font-semibold"
                : dueDateStatus.isTomorrow
                ? "text-amber-400 font-medium"
                : "text-muted-foreground"
            )}>
              {dueDateStatus.isOverdue ? (
                <AlertCircle size={11} className="shrink-0" />
              ) : dueDateStatus.isToday ? (
                <Clock size={11} className="shrink-0 text-amber-500" />
              ) : (
                <CalendarIcon size={11} className="shrink-0" />
              )}
              <span>{dueDateStatus.formattedDate}</span>
              {dueDateStatus.remainingText && (
                <span>({dueDateStatus.remainingText})</span>
              )}
            </span>
          )}

          {/* Recurring Schedule Badge */}
          {task.is_recurring && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border border-indigo-500/30 bg-indigo-500/10 text-indigo-400"
              title={task.recurring_pattern ? formatRecurrenceSummary(task.recurring_pattern, 'ko') : '반복 일정'}
            >
              <Repeat size={10} className="stroke-[2.5]" />
              {task.recurring_pattern
                ? formatRecurrenceSummary(task.recurring_pattern, 'ko')
                : '반복'}
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
