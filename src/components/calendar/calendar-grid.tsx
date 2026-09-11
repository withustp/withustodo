'use client';

import { useTranslations } from 'next-intl';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { DayDetail } from './day-detail';
import { useTasks } from '@/hooks/use-tasks';
import { useTaskStore } from '@/stores/task-store';
import { isTaskScheduledOnDate } from '@/lib/recurrence';

interface CalendarGridProps {
  currentDate: Date;
  view: 'month' | 'week';
}

/**
 * Calendar Grid
 * Renders the days of the month with real task due dates and recurring task projections
 */
export function CalendarGrid({ currentDate, view }: CalendarGridProps) {
  const t = useTranslations('Calendar.Grid');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { tasks } = useTasks();
  const { openDetailPanel } = useTaskStore();

  const isWeekView = view === 'week';
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = isWeekView ? startOfWeek(currentDate) : startOfWeek(monthStart);
  const endDate = isWeekView ? endOfWeek(currentDate) : endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Map real tasks and projected recurring occurrences by calendar date (YYYY-MM-DD)
  const taskMap: Record<string, typeof tasks> = {};
  days.forEach((day) => {
    const d = format(day, 'yyyy-MM-dd');
    const matched = tasks.filter((task) => isTaskScheduledOnDate(task, day));
    const seenIds = new Set<string>();
    const seenActiveKeys = new Set<string>();

    taskMap[d] = matched.filter((task) => {
      if (seenIds.has(task.id)) return false;
      seenIds.add(task.id);

      if (task.status !== 'done' && task.is_recurring) {
        const key = `${task.title.trim().toLowerCase()}_${task.category_id || 'none'}`;
        if (seenActiveKeys.has(key)) return false;
        seenActiveKeys.add(key);
      }
      return true;
    });
  });

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="grid grid-cols-7 border-b border-border">
          {weekDays.map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
              {t(`days.${day.toLowerCase()}`)}
            </div>
          ))}
        </div>
        <div className={cn(
          "flex-1 grid grid-cols-7",
          isWeekView ? "grid-rows-1" : "grid-rows-5 md:grid-rows-6"
        )}>
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayTasks = taskMap[dateStr] || [];
            
            return (
              <div 
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "p-2 border-b border-r border-border/50 transition-colors hover:bg-muted/30 cursor-pointer flex flex-col gap-1 overflow-hidden",
                  isWeekView ? "min-h-[300px]" : "min-h-[85px]",
                  !isWeekView && !isSameMonth(day, monthStart) && "bg-muted/10 opacity-50",
                  isToday(day) && "bg-primary/5"
                )}
              >
                <div className="flex justify-between items-start">
                  <span className={cn(
                    "text-xs w-6 h-6 flex items-center justify-center rounded-full",
                    isToday(day) && "bg-primary text-primary-foreground font-semibold"
                  )}>
                    {format(day, 'd')}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] text-muted-foreground font-medium sm:hidden">
                      {dayTasks.length}
                    </span>
                  )}
                </div>

                {/* Visible Task Badges on Desktop/Tablet */}
                <div className="hidden sm:flex flex-col gap-1 w-full mt-0.5 overflow-hidden">
                  {dayTasks.slice(0, isWeekView ? 8 : 2).map((task) => (
                    <div 
                      key={task.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetailPanel(task.id);
                      }}
                      className={cn(
                        "flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[11px] font-medium truncate transition-colors border cursor-pointer hover:bg-white/15",
                        task.status === 'done'
                          ? "line-through text-muted-foreground bg-white/[0.02] border-white/5 opacity-60"
                          : "text-foreground bg-white/[0.05] hover:bg-white/10 border-white/10"
                      )}
                      style={{ 
                        borderLeftColor: task.category?.color || (
                          task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#3b82f6'
                        ),
                        borderLeftWidth: '3px'
                      }}
                      title={`${task.title} (클릭하여 수정)`}
                    >
                      <span className="truncate">{task.title}</span>
                    </div>
                  ))}
                  {dayTasks.length > (isWeekView ? 8 : 2) && (
                    <span className="text-[10px] text-muted-foreground font-medium pl-1">
                      +{dayTasks.length - (isWeekView ? 8 : 2)}개 더보기
                    </span>
                  )}
                </div>

                {/* Compact Color Dots on Mobile */}
                <div className="flex sm:hidden flex-wrap gap-1 mt-auto">
                  {dayTasks.map((task) => (
                    <div 
                      key={task.id}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ 
                        backgroundColor: task.category?.color || (
                          task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#3b82f6'
                        ) 
                      }}
                      title={task.title}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {selectedDate && (
        <DayDetail date={selectedDate} onClose={() => setSelectedDate(null)} />
      )}
    </>
  );
}
