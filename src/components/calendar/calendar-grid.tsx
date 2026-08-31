'use client';

import { useTranslations } from 'next-intl';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { DayDetail } from './day-detail';
import { useTasks } from '@/hooks/use-tasks';

interface CalendarGridProps {
  currentDate: Date;
  view: 'month' | 'week';
}

/**
 * Calendar Grid
 * Renders the days of the month with real task due dates
 */
export function CalendarGrid({ currentDate }: CalendarGridProps) {
  const t = useTranslations('Calendar.Grid');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { tasks } = useTasks();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Map real tasks by their due_date (YYYY-MM-DD)
  const taskMap: Record<string, typeof tasks> = {};
  tasks.forEach((task) => {
    if (task.due_date && !task.is_deleted) {
      const d = format(new Date(task.due_date), 'yyyy-MM-dd');
      if (!taskMap[d]) taskMap[d] = [];
      taskMap[d].push(task);
    }
  });

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="grid grid-cols-7 border-b border-border">
          {weekDays.map((day) => (
            <div key={day} className="p-4 text-center text-sm font-medium text-muted-foreground">
              {t(`days.${day.toLowerCase()}`)}
            </div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-7 grid-rows-5 md:grid-rows-6">
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayTasks = taskMap[dateStr] || [];
            
            return (
              <div 
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "p-2 border-b border-r border-border/50 transition-colors hover:bg-muted/30 cursor-pointer min-h-[80px] flex flex-col gap-1",
                  !isSameMonth(day, monthStart) && "bg-muted/10 opacity-50",
                  isToday(day) && "bg-primary/5"
                )}
              >
                <div className="flex justify-between items-start">
                  <span className={cn(
                    "text-sm w-7 h-7 flex items-center justify-center rounded-full",
                    isToday(day) && "bg-primary text-primary-foreground font-semibold"
                  )}>
                    {format(day, 'd')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-auto">
                  {dayTasks.map((task) => (
                    <div 
                      key={task.id}
                      className="w-2 h-2 rounded-full"
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
