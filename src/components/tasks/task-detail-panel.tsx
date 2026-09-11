'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskStore } from '@/stores/task-store';
import { useTasks } from '@/hooks/use-tasks';
import { useCategories } from '@/hooks/use-categories';
import { useTranslations } from 'next-intl';
import { X, Trash2, Calendar as CalendarIcon, Flag, Tag, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Priority, RecurringType } from '@/types';
import { cn } from '@/lib/utils';
import { formatRecurrenceSummary } from '@/lib/recurrence';
import { getDueDateStatus } from '@/lib/date-utils';

/**
 * Task detail drawer panel component allowing real-time editing of
 * title, description, priority, category, due date, and recurring schedule rules.
 */
export function TaskDetailPanel() {
  const { detailPanelTaskId, closeDetailPanel } = useTaskStore();
  const { tasks, updateTask, deleteTask } = useTasks();
  const { categories } = useCategories();
  const t = useTranslations('tasks');

  const task = tasks.find((t) => t.id === detailPanelTaskId);

  const [localTitle, setLocalTitle] = useState('');
  const [localDesc, setLocalDesc] = useState('');
  const [priority, setPriority] = useState<Priority>('none');
  const [categoryId, setCategoryId] = useState<string>('none');
  const [dueDate, setDueDate] = useState('');

  // Recurrence state
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState<RecurringType>('weekly');
  const [interval, setInterval] = useState(1);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1]);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (task) {
      setLocalTitle(task.title);
      setLocalDesc(task.description || '');
      setPriority(task.priority || 'none');
      setCategoryId(task.category_id || 'none');
      setDueDate(task.due_date ? task.due_date.split('T')[0] : '');

      const rec = task.recurring_pattern;
      setIsRecurring(Boolean(task.is_recurring));
      if (rec) {
        setRecurringType(rec.type || 'weekly');
        setInterval(rec.interval || 1);
        setDaysOfWeek(rec.days_of_week && rec.days_of_week.length > 0 ? rec.days_of_week : [1]);
        setHasEndDate(Boolean(rec.end_date));
        setEndDate(rec.end_date ? rec.end_date.split('T')[0] : '');
      } else {
        setRecurringType('weekly');
        setInterval(1);
        setDaysOfWeek([1]);
        setHasEndDate(false);
        setEndDate('');
      }
    }
  }, [task]);

  if (!task) return null;

  const handleBlur = (field: 'title' | 'description', value: string) => {
    if (task[field] !== value) {
      updateTask(task.id, { [field]: value });
    }
  };

  const handlePriorityChange = (val: Priority) => {
    setPriority(val);
    updateTask(task.id, { priority: val });
  };

  const handleCategoryChange = (val: string) => {
    setCategoryId(val);
    updateTask(task.id, { category_id: val === 'none' ? null : val });
  };

  const handleDueDateChange = (val: string) => {
    setDueDate(val);
    const isoDate = val ? new Date(val).toISOString() : null;
    updateTask(task.id, { due_date: isoDate });
  };

  const saveRecurrence = (
    nextRecurring: boolean,
    nextType: RecurringType,
    nextInt: number,
    nextDays: number[],
    nextHasEnd: boolean,
    nextEnd: string
  ) => {
    if (!nextRecurring) {
      updateTask(task.id, {
        is_recurring: false,
        recurring_pattern: null,
      });
      return;
    }

    const pattern = {
      type: nextType,
      interval: Math.max(1, nextInt),
      days_of_week: nextType === 'weekly' ? nextDays : undefined,
      day_of_month: nextType === 'monthly'
        ? (dueDate ? new Date(dueDate).getDate() : new Date().getDate())
        : undefined,
      end_date: nextHasEnd && nextEnd ? new Date(nextEnd).toISOString() : undefined,
    };

    updateTask(task.id, {
      is_recurring: true,
      recurring_pattern: pattern,
    });
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={closeDetailPanel}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full md:w-[440px] bg-card border-l border-border shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold text-foreground">{t('detailTitle')}</h2>
              <Button variant="ghost" size="icon" onClick={closeDetailPanel}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Title */}
              <div>
                <Input
                  value={localTitle}
                  onChange={(e) => setLocalTitle(e.target.value)}
                  onBlur={(e) => handleBlur('title', e.target.value)}
                  className="text-lg font-semibold border-none px-0 focus-visible:ring-0 shadow-none bg-transparent"
                  placeholder={t('taskTitlePlaceholder')}
                />
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/20 border border-border/60 rounded-xl">
                {/* Priority */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <Flag size={11} />
                    {t('table.priority')}
                  </label>
                  <Select value={priority} onValueChange={(val: string) => handlePriorityChange(val as Priority)}>
                    <SelectTrigger className="h-8 text-xs bg-background">
                      <SelectValue placeholder={t('priority.none')}>
                        {priority === 'high' ? (
                          <span className="text-destructive font-semibold">{t('priority.high')}</span>
                        ) : priority === 'medium' ? (
                          <span className="text-amber-500 font-medium">{t('priority.medium')}</span>
                        ) : priority === 'low' ? (
                          <span className="text-blue-500 font-medium">{t('priority.low')}</span>
                        ) : (
                          <span>{t('priority.none')}</span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t('priority.none')}</SelectItem>
                      <SelectItem value="low" className="text-blue-500">{t('priority.low')}</SelectItem>
                      <SelectItem value="medium" className="text-amber-500">{t('priority.medium')}</SelectItem>
                      <SelectItem value="high" className="text-destructive font-semibold">{t('priority.high')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <Tag size={11} />
                    {t('category')}
                  </label>
                  <Select value={categoryId} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="h-8 text-xs bg-background">
                      <SelectValue placeholder="미분류">
                        {(() => {
                          if (categoryId === 'none') return '미분류';
                          const selectedCategory = categories.find((c) => c.id === categoryId) || task?.category;
                          if (!selectedCategory) return '미분류';
                          return (
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: selectedCategory.color }} />
                              <span className="truncate">{selectedCategory.name}</span>
                            </span>
                          );
                        })()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">미분류</SelectItem>
                      {(() => {
                        const activeCat = categories.find((c) => c.id === categoryId) || task?.category;
                        return activeCat && !categories.some((c) => c.id === activeCat.id) ? (
                          <SelectItem key={activeCat.id} value={activeCat.id}>
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeCat.color }} />
                              {activeCat.name}
                            </span>
                          </SelectItem>
                        ) : null;
                      })()}
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                            {cat.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Due Date */}
                <div className="space-y-1 col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                      <CalendarIcon size={11} />
                      {t('dueDate')}
                    </label>
                    {(() => {
                      const status = getDueDateStatus(dueDate, task?.status === 'done');
                      if (!status || !status.remainingText) return null;
                      return (
                        <span className={cn(
                          "text-[10px] font-semibold px-1.5 py-0.5 rounded border",
                          status.isOverdue && "bg-destructive/10 text-destructive border-destructive/30",
                          status.isToday && "bg-amber-500/10 text-amber-500 border-amber-500/30",
                          status.isTomorrow && "bg-amber-400/10 text-amber-400 border-amber-400/30",
                          !status.isOverdue && !status.isToday && !status.isTomorrow && "bg-primary/10 text-primary border-primary/30"
                        )}>
                          {status.remainingText}
                        </span>
                      );
                    })()}
                  </div>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => handleDueDateChange(e.target.value)}
                    className="h-8 text-xs bg-background"
                  />
                </div>
              </div>

              {/* Recurring Schedule Settings */}
              <div className="p-3.5 bg-muted/20 border border-border/60 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label 
                    className="text-xs font-semibold text-foreground flex items-center gap-1.5 cursor-pointer"
                    onClick={() => {
                      const next = !isRecurring;
                      setIsRecurring(next);
                      saveRecurrence(next, recurringType, interval, daysOfWeek, hasEndDate, endDate);
                    }}
                  >
                    <Repeat size={14} className={isRecurring ? "text-primary" : "text-muted-foreground"} />
                    반복 일정 설정 (주간/월간/기한)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !isRecurring;
                      setIsRecurring(next);
                      saveRecurrence(next, recurringType, interval, daysOfWeek, hasEndDate, endDate);
                    }}
                    className={cn(
                      "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none",
                      isRecurring ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                        isRecurring ? "translate-x-4.5" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>

                <AnimatePresence>
                  {isRecurring && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3 pt-1 overflow-hidden"
                    >
                      <div className="grid grid-cols-2 gap-2.5">
                        {/* Type */}
                        <div className="space-y-1">
                          <span className="text-[11px] text-muted-foreground">반복 주기</span>
                          <Select
                            value={recurringType}
                            onValueChange={(val: string) => {
                              const typedVal = val as RecurringType;
                              setRecurringType(typedVal);
                              saveRecurrence(isRecurring, typedVal, interval, daysOfWeek, hasEndDate, endDate);
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">매일</SelectItem>
                              <SelectItem value="weekly">매주</SelectItem>
                              <SelectItem value="monthly">매월</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Interval */}
                        <div className="space-y-1">
                          <span className="text-[11px] text-muted-foreground">반복 간격</span>
                          <Select
                            value={String(interval)}
                            onValueChange={(val: string) => {
                              const nextInt = parseInt(val) || 1;
                              setInterval(nextInt);
                              saveRecurrence(isRecurring, recurringType, nextInt, daysOfWeek, hasEndDate, endDate);
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">
                                {recurringType === 'daily' ? '매일 (1일마다)' : recurringType === 'weekly' ? '매주 (1주마다)' : '매월 (1개월마다)'}
                              </SelectItem>
                              <SelectItem value="2">
                                {recurringType === 'daily' ? '2일마다' : recurringType === 'weekly' ? '2주마다' : '2개월마다'}
                              </SelectItem>
                              <SelectItem value="3">
                                {recurringType === 'daily' ? '3일마다' : recurringType === 'weekly' ? '3주마다' : '3개월마다'}
                              </SelectItem>
                              <SelectItem value="4">
                                {recurringType === 'daily' ? '4일마다' : recurringType === 'weekly' ? '4주마다' : '4개월마다'}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Weekly Day Buttons */}
                      {recurringType === 'weekly' && (
                        <div className="space-y-1">
                          <span className="text-[11px] text-muted-foreground">반복 요일</span>
                          <div className="grid grid-cols-7 gap-1">
                            {[
                              { day: 0, label: '일' },
                              { day: 1, label: '월' },
                              { day: 2, label: '화' },
                              { day: 3, label: '수' },
                              { day: 4, label: '목' },
                              { day: 5, label: '금' },
                              { day: 6, label: '토' },
                            ].map(({ day, label }) => {
                              const isSelected = daysOfWeek.includes(day);
                              return (
                                <button
                                  key={day}
                                  type="button"
                                  onClick={() => {
                                    let nextDays = isSelected
                                      ? (daysOfWeek.length > 1 ? daysOfWeek.filter((d) => d !== day) : daysOfWeek)
                                      : [...daysOfWeek, day].sort((a, b) => a - b);
                                    setDaysOfWeek(nextDays);
                                    saveRecurrence(isRecurring, recurringType, interval, nextDays, hasEndDate, endDate);
                                  }}
                                  className={cn(
                                    "h-7 rounded text-xs font-medium transition-colors border",
                                    isSelected
                                      ? "bg-primary border-primary text-primary-foreground shadow-sm"
                                      : "bg-background border-border text-muted-foreground hover:text-foreground"
                                  )}
                                >
                                  {label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Repeat Until ("until what?") */}
                      <div className="pt-2 border-t border-border/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground">반복 종료 조건</span>
                          <label className="flex items-center gap-1.5 text-[11px] text-foreground cursor-pointer">
                            <input
                              type="checkbox"
                              checked={hasEndDate}
                              onChange={(e) => {
                                const nextHas = e.target.checked;
                                setHasEndDate(nextHas);
                                saveRecurrence(isRecurring, recurringType, interval, daysOfWeek, nextHas, endDate);
                              }}
                              className="rounded border-border text-primary focus:ring-0 w-3.5 h-3.5"
                            />
                            종료 날짜 지정
                          </label>
                        </div>

                        {hasEndDate && (
                          <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => {
                              const nextEnd = e.target.value;
                              setEndDate(nextEnd);
                              saveRecurrence(isRecurring, recurringType, interval, daysOfWeek, hasEndDate, nextEnd);
                            }}
                            className="h-8 text-xs bg-background"
                          />
                        )}
                      </div>

                      {/* Summary Banner */}
                      <div className="text-[11px] text-primary bg-primary/10 px-2.5 py-1.5 rounded border border-primary/20">
                        💡 {formatRecurrenceSummary({
                          type: recurringType,
                          interval,
                          days_of_week: recurringType === 'weekly' ? daysOfWeek : undefined,
                          day_of_month: recurringType === 'monthly'
                            ? (dueDate ? new Date(dueDate).getDate() : new Date().getDate())
                            : undefined,
                          end_date: hasEndDate && endDate ? endDate : undefined,
                        }, 'ko')}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">{t('description')}</label>
                <Textarea
                  value={localDesc}
                  onChange={(e) => setLocalDesc(e.target.value)}
                  onBlur={(e) => handleBlur('description', e.target.value)}
                  placeholder={t('addDescription')}
                  className="resize-none min-h-[100px]"
                />
              </div>
            </div>

            {/* Footer */}
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
