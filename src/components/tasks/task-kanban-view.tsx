'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  useDroppable,
  CollisionDetection,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTasks } from '@/hooks/use-tasks';
import { useTaskStore } from '@/stores/task-store';
import { TaskCard } from './task-card';
import { useTranslations } from 'next-intl';
import { Task, TaskStatus } from '@/types';
import { cn } from '@/lib/utils';

const COLUMNS: TaskStatus[] = ['todo', 'in_progress', 'done'];

/**
 * Sortable wrapper around TaskCard enabling drag from any part of the card surface.
 * Utilizes CSS Translate for crisp sub-pixel rendering without scaling blur.
 *
 * @param props.task - The task entity to render and bind to dnd-kit sortable
 */
function SortableKanbanCard({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "touch-none select-none transition-opacity duration-150",
        isDragging && "opacity-25"
      )}
    >
      <TaskCard
        task={task}
        isDragging={isDragging}
        attributes={attributes}
        listeners={listeners}
      />
    </div>
  );
}

/**
 * Droppable column container representing a Kanban status lane.
 * Binds droppable target to ensure empty columns can receive dragged cards.
 *
 * @param props.status - Task status represented by this column
 * @param props.title - Localized column title
 * @param props.tasks - Tasks currently assigned to this status
 * @param props.isOver - Whether an active draggable item is currently hovering over this column
 */
function KanbanColumn({
  status,
  title,
  tasks,
  isOver,
}: {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  isOver: boolean;
}) {
  const { setNodeRef } = useDroppable({
    id: status,
    data: {
      type: 'column',
      status,
    },
  });

  const t = useTranslations('tasks');

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col flex-1 min-w-[320px] bg-muted/25 rounded-2xl p-4 transition-all duration-200 border-2",
        isOver
          ? "border-primary/60 bg-primary/5 ring-4 ring-primary/10 shadow-xl shadow-primary/5"
          : "border-border/40 hover:border-border/70"
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-all",
              status === 'todo' && "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]",
              status === 'in_progress' && "bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]",
              status === 'done' && "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
            )}
          />
          <h3 className="font-bold text-sm tracking-tight text-foreground capitalize">
            {title}
          </h3>
        </div>
        <span
          className={cn(
            "text-xs font-semibold px-2.5 py-0.5 rounded-full transition-colors",
            tasks.length > 0
              ? "bg-muted/80 text-foreground font-medium"
              : "bg-muted/30 text-muted-foreground/60"
          )}
        >
          {tasks.length}
        </span>
      </div>

      {/* Droppable Task List Container */}
      <SortableContext id={status} items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 overflow-y-auto space-y-1 min-h-[350px] p-1 rounded-xl">
          {tasks.map(task => (
            <SortableKanbanCard key={task.id} task={task} />
          ))}

          {/* Droppable Empty Placeholder */}
          {tasks.length === 0 && (
            <div
              className={cn(
                "h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-xs transition-all duration-200 gap-1.5",
                isOver
                  ? "border-primary bg-primary/10 text-primary font-medium scale-[1.01]"
                  : "border-border/40 text-muted-foreground/50 hover:border-border/70"
              )}
            >
              <span className="font-medium text-xs">
                {isOver ? t('dropHere') : t('emptyColumn')}
              </span>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

/**
 * Task Kanban board view with full-surface drag and drop across all status lanes.
 * Employs pointer sensors with movement threshold safeguards to balance clickability with effortless dragging.
 */
export function TaskKanbanView() {
  const { filters } = useTaskStore();
  const { tasks, isLoading, updateTask, reorderTasks } = useTasks(filters);
  const t = useTranslations('tasks');

  // Client hydration check
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Local optimistic state for fluid drag reordering across columns
  const [kanbanTasks, setKanbanTasks] = useState<Task[]>(tasks);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [hoveredColumn, setHoveredColumn] = useState<TaskStatus | null>(null);

  // Synchronize local tasks with server tasks when not in active drag
  useEffect(() => {
    if (!activeTaskId) {
      setKanbanTasks(tasks);
    }
  }, [tasks, activeTaskId]);

  // Pointer sensor requires 6px travel before dragging starts, preserving single-click actions
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activeTask = useMemo(
    () => (activeTaskId ? kanbanTasks.find(t => t.id === activeTaskId) ?? null : null),
    [kanbanTasks, activeTaskId]
  );

  // Group tasks by status column
  const tasksByColumn = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      done: [],
    };
    for (const task of kanbanTasks) {
      if (map[task.status]) {
        map[task.status].push(task);
      } else {
        map.todo.push(task);
      }
    }
    return map;
  }, [kanbanTasks]);

  // Hybrid collision detection prioritizing direct pointer hits on empty columns
  const customCollisionDetection: CollisionDetection = useCallback((args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }
    return closestCorners(args);
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveTaskId(String(active.id));
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) {
      setHoveredColumn(null);
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeItem = kanbanTasks.find(t => t.id === activeId);
    if (!activeItem) return;

    // Detect if hovering over a column container or a task inside a column
    const isOverColumn = COLUMNS.includes(overId as TaskStatus);
    let targetStatus: TaskStatus;

    if (isOverColumn) {
      targetStatus = overId as TaskStatus;
      setHoveredColumn(targetStatus);
    } else {
      const overItem = kanbanTasks.find(t => t.id === overId);
      if (!overItem) return;
      targetStatus = overItem.status;
      setHoveredColumn(targetStatus);
    }

    // Move task to target status column optimistically for live visual feedback
    if (activeItem.status !== targetStatus) {
      setKanbanTasks(prev => {
        const activeIndex = prev.findIndex(t => t.id === activeId);
        if (activeIndex === -1) return prev;

        const updated = [...prev];
        updated[activeIndex] = {
          ...updated[activeIndex],
          status: targetStatus,
        };

        if (!isOverColumn) {
          const overIndex = updated.findIndex(t => t.id === overId);
          if (overIndex !== -1) {
            return arrayMove(updated, activeIndex, overIndex);
          }
        }

        return updated;
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTaskId(null);
    setHoveredColumn(null);

    if (!over) {
      setKanbanTasks(tasks);
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    const originalTask = tasks.find(t => t.id === activeId);
    const currentTask = kanbanTasks.find(t => t.id === activeId);
    if (!originalTask || !currentTask) return;

    const isOverColumn = COLUMNS.includes(overId as TaskStatus);
    let targetStatus: TaskStatus = currentTask.status;

    if (isOverColumn) {
      targetStatus = overId as TaskStatus;
    } else {
      const overItem = kanbanTasks.find(t => t.id === overId);
      if (overItem) {
        targetStatus = overItem.status;
      }
    }

    // Persist reorder updates if item shifted positions within a column
    if (activeId !== overId && !isOverColumn) {
      const activeIndex = kanbanTasks.findIndex(t => t.id === activeId);
      const overIndex = kanbanTasks.findIndex(t => t.id === overId);
      if (activeIndex !== -1 && overIndex !== -1) {
        const reordered = arrayMove(kanbanTasks, activeIndex, overIndex);
        setKanbanTasks(reordered);

        const columnItems = reordered.filter(t => t.status === targetStatus);
        const updates = columnItems.map((t, index) => ({
          id: t.id,
          sort_order: index,
        }));
        try {
          await reorderTasks(updates);
        } catch {
          // Fallback handled by state refresh
        }
      }
    }

    // Persist status change to Supabase and Zustand store
    if (originalTask.status !== targetStatus) {
      const completedAt = targetStatus === 'done' ? new Date().toISOString() : null;
      try {
        await updateTask(activeId, {
          status: targetStatus,
          completed_at: completedAt,
        });
      } catch {
        setKanbanTasks(tasks);
      }
    }
  };

  const handleDragCancel = () => {
    setActiveTaskId(null);
    setHoveredColumn(null);
    setKanbanTasks(tasks);
  };

  if (!mounted || isLoading) {
    return <div className="p-4 text-muted-foreground">{t('loading')}</div>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex h-full gap-5 overflow-x-auto pb-4">
        {COLUMNS.map(status => (
          <KanbanColumn
            key={status}
            status={status}
            title={t(`status.${status}`)}
            tasks={tasksByColumn[status]}
            isOver={hoveredColumn === status}
          />
        ))}
      </div>

      <DragOverlay
        dropAnimation={{
          duration: 220,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}
      >
        {activeTask ? (
          <div className="rotate-1 scale-105 shadow-2xl shadow-primary/30 pointer-events-none">
            <TaskCard task={activeTask} isOverlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
