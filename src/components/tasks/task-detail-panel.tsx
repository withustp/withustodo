'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskStore } from '@/stores/task-store';
import { useTasks } from '@/hooks/use-tasks';
import { useCategories } from '@/hooks/use-categories';
import { useTranslations } from 'next-intl';
import { X, Trash2, Calendar as CalendarIcon, Flag, Tag, Repeat, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Priority, RecurringType, RecurringPattern } from '@/types';
import { cn } from '@/lib/utils';
import { formatRecurrenceSummary } from '@/lib/recurrence';
import { getDueDateStatus } from '@/lib/date-utils';
import { toast } from 'sonner';

/**
 * Task detail drawer panel component allowing staged editing of
 * title, description, priority, category, due date, and recurring schedule rules.
 * Supports scoped editing and deletion ("이 일정만" vs "모든 반복 일정") when opened for a calendar date.
 */
export function TaskDetailPanel() {
  const { detailPanelTaskId, detailPanelTargetDate, closeDetailPanel } = useTaskStore();
  const { tasks, updateTask, deleteTask, createTask } = useTasks();
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

  // UI state for saving & scope dialogs
  const [isSaving, setIsSaving] = useState(false);
  const [showEditScopeDialog, setShowEditScopeDialog] = useState(false);
  const [showDeleteScopeDialog, setShowDeleteScopeDialog] = useState(false);

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

      setShowEditScopeDialog(false);
      setShowDeleteScopeDialog(false);
    }
  }, [task]);

  if (!task) return null;

  const buildCurrentRecurrencePattern = (): RecurringPattern | null => {
    if (!isRecurring) return null;
    return {
      type: recurringType,
      interval: Math.max(1, interval),
      days_of_week: recurringType === 'weekly' ? daysOfWeek : undefined,
      day_of_month: recurringType === 'monthly'
        ? (dueDate ? new Date(dueDate).getDate() : new Date().getDate())
        : undefined,
      end_date: hasEndDate && endDate ? new Date(endDate).toISOString() : undefined,
      excluded_dates: task?.recurring_pattern?.excluded_dates || [],
    };
  };

  const handleSaveClick = () => {
    if (!localTitle.trim()) {
      toast.error('할 일 제목을 입력해주세요.');
      return;
    }

    // If opened from a specific calendar date on a recurring task, prompt scope choice
    if (task.is_recurring && task.recurring_pattern && detailPanelTargetDate) {
      setShowEditScopeDialog(true);
    } else {
      handleSaveAllInstances();
    }
  };

  const handleSaveAllInstances = async () => {
    if (!task) return;
    setIsSaving(true);
    try {
      const pattern = buildCurrentRecurrencePattern();
      const isoDate = dueDate ? new Date(dueDate).toISOString() : null;

      await updateTask(task.id, {
        title: localTitle.trim() || task.title,
        description: localDesc.trim() || null,
        priority,
        category_id: categoryId === 'none' ? null : categoryId,
        due_date: isoDate,
        is_recurring: isRecurring,
        recurring_pattern: pattern,
      });

      toast.success(
        isRecurring
          ? '모든 반복 일정이 수정되었습니다.'
          : '할 일이 저장되었습니다.'
      );
      setShowEditScopeDialog(false);
      closeDetailPanel();
    } catch {
      toast.error('할 일 수정에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveThisInstanceOnly = async () => {
    if (!task || !detailPanelTargetDate) return;
    setIsSaving(true);
    try {
      // 1. Create a decoupled standalone task on targetDate
      const targetIso = new Date(`${detailPanelTargetDate}T12:00:00`).toISOString();
      await createTask({
        title: localTitle.trim() || task.title,
        description: localDesc.trim() || undefined,
        priority,
        category_id: categoryId === 'none' ? undefined : categoryId,
        status: task.status,
        due_date: targetIso,
        is_recurring: false,
      });

      // 2. Add targetDate to master task's excluded_dates
      const currentExcluded = task.recurring_pattern?.excluded_dates || [];
      const nextExcluded = Array.from(new Set([...currentExcluded, detailPanelTargetDate]));
      await updateTask(task.id, {
        recurring_pattern: {
          ...task.recurring_pattern!,
          excluded_dates: nextExcluded,
        },
      });

      toast.success(`${detailPanelTargetDate} 날짜의 일정이 개별 할 일로 수정되었습니다.`);
      setShowEditScopeDialog(false);
      closeDetailPanel();
    } catch {
      toast.error('개별 일정 수정에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = () => {
    if (task.is_recurring && task.recurring_pattern && detailPanelTargetDate) {
      setShowDeleteScopeDialog(true);
    } else {
      handleDeleteAllInstances();
    }
  };

  const handleDeleteAllInstances = async () => {
    if (!task) return;
    setIsSaving(true);
    try {
      await deleteTask(task.id);
      toast.success('반복 할 일이 삭제되었습니다.');
      setShowDeleteScopeDialog(false);
      closeDetailPanel();
    } catch {
      toast.error('할 일 삭제에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteThisInstanceOnly = async () => {
    if (!task || !detailPanelTargetDate) return;
    setIsSaving(true);
    try {
      const currentExcluded = task.recurring_pattern?.excluded_dates || [];
      const nextExcluded = Array.from(new Set([...currentExcluded, detailPanelTargetDate]));
      await updateTask(task.id, {
        recurring_pattern: {
          ...task.recurring_pattern!,
          excluded_dates: nextExcluded,
        },
      });

      toast.success(`${detailPanelTargetDate} 일정이 삭제되었습니다.`);
      setShowDeleteScopeDialog(false);
      closeDetailPanel();
    } catch {
      toast.error('일정 삭제에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const status = getDueDateStatus(dueDate);

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
            className="fixed inset-y-0 right-0 w-full md:w-[460px] bg-card border-l border-border shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2 min-w-0">
                <h2 className="font-semibold text-foreground truncate">{t('detailTitle')}</h2>
                {detailPanelTargetDate && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary shrink-0">
                    📅 {detailPanelTargetDate}
                  </span>
                )}
              </div>
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
                  <Select value={priority} onValueChange={(val: string) => setPriority(val as Priority)}>
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
                  <Select value={categoryId} onValueChange={setCategoryId}>
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
                <div className="col-span-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                      <CalendarIcon size={11} />
                      {t('dueDate')}
                    </label>
                    {status && status.remainingText && (
                      <span className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                        status.isOverdue
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : status.isToday
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : status.isTomorrow || status.isSoon
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : "bg-muted text-muted-foreground border-border"
                      )}>
                        {status.remainingText}
                      </span>
                    )}
                  </div>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="h-8 text-xs bg-background"
                  />
                </div>
              </div>

              {/* Recurrence Settings Section */}
              <div className="p-3 bg-muted/20 border border-border/60 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Repeat size={13} className="text-primary" />
                    반복 일정 설정 (주간/월간/기한)
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsRecurring(!isRecurring)}
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
                            onValueChange={(val: string) => setRecurringType(val as RecurringType)}
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
                            onValueChange={(val: string) => setInterval(parseInt(val) || 1)}
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
                                    const nextDays = isSelected
                                      ? (daysOfWeek.length > 1 ? daysOfWeek.filter((d) => d !== day) : daysOfWeek)
                                      : [...daysOfWeek, day].sort((a, b) => a - b);
                                    setDaysOfWeek(nextDays);
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

                      {/* Repeat Until */}
                      <div className="pt-2 border-t border-border/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground">반복 종료 조건</span>
                          <label className="flex items-center gap-1.5 text-[11px] text-foreground cursor-pointer">
                            <input
                              type="checkbox"
                              checked={hasEndDate}
                              onChange={(e) => setHasEndDate(e.target.checked)}
                              className="rounded border-border text-primary focus:ring-0 w-3.5 h-3.5"
                            />
                            종료 날짜 지정
                          </label>
                        </div>

                        {hasEndDate && (
                          <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
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
                  placeholder={t('addDescription')}
                  className="resize-none min-h-[100px]"
                />
              </div>
            </div>

            {/* Footer with Save, Cancel, and Delete */}
            <div className="p-4 border-t border-border flex items-center justify-between gap-2 bg-card/60 backdrop-blur-md">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDeleteClick}
                disabled={isSaving}
                className="flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                {t('delete')}
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={closeDetailPanel}
                  disabled={isSaving}
                >
                  취소
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveClick}
                  disabled={isSaving || !localTitle.trim()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 shadow-md shadow-primary/20 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {isSaving ? '저장 중...' : '저장'}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Recurring Edit Scope Dialog */}
          {showEditScopeDialog && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <div
                className="fixed inset-0 bg-background/80 backdrop-blur-sm"
                onClick={() => !isSaving && setShowEditScopeDialog(false)}
              />
              <div className="relative w-full max-w-md bg-card border border-border shadow-2xl rounded-2xl p-6 z-10 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
                    <Repeat className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground text-base">반복 할 일 수정</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">{detailPanelTargetDate}</span> 일정을 어떻게 수정할까요?
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleSaveThisInstanceOnly}
                    disabled={isSaving}
                    className="w-full text-left p-3.5 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 transition-all flex flex-col gap-1 group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-primary">이 일정만 수정</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">추천</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {detailPanelTargetDate} 날짜의 일정만 개별 할 일로 분리하여 수정하고, 다른 반복 일정은 변경하지 않습니다.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveAllInstances}
                    disabled={isSaving}
                    className="w-full text-left p-3.5 rounded-xl border border-border bg-background/50 hover:bg-muted transition-all flex flex-col gap-1 group cursor-pointer"
                  >
                    <span className="text-sm font-semibold text-foreground">모든 반복 일정 수정</span>
                    <p className="text-xs text-muted-foreground">
                      과거 및 향후 모든 반복 일정에 수정 사항을 일괄 적용합니다.
                    </p>
                  </button>
                </div>

                <div className="flex justify-end pt-2 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEditScopeDialog(false)}
                    disabled={isSaving}
                  >
                    취소
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Recurring Delete Scope Dialog */}
          {showDeleteScopeDialog && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <div
                className="fixed inset-0 bg-background/80 backdrop-blur-sm"
                onClick={() => !isSaving && setShowDeleteScopeDialog(false)}
              />
              <div className="relative w-full max-w-md bg-card border border-border shadow-2xl rounded-2xl p-6 z-10 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground text-base">반복 할 일 삭제</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">{detailPanelTargetDate}</span> 일정을 어떻게 삭제할까요?
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleDeleteThisInstanceOnly}
                    disabled={isSaving}
                    className="w-full text-left p-3.5 rounded-xl border border-destructive/30 bg-destructive/10 hover:bg-destructive/20 transition-all flex flex-col gap-1 group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-destructive">이 일정만 삭제</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/20 text-destructive font-medium">추천</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {detailPanelTargetDate} 날짜의 일정만 삭제하고, 다른 날짜의 반복 일정은 유지합니다.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteAllInstances}
                    disabled={isSaving}
                    className="w-full text-left p-3.5 rounded-xl border border-border bg-background/50 hover:bg-muted transition-all flex flex-col gap-1 group cursor-pointer"
                  >
                    <span className="text-sm font-semibold text-foreground">모든 반복 일정 삭제</span>
                    <p className="text-xs text-muted-foreground">
                      이 반복 할 일 시리즈 전체를 영구 삭제합니다.
                    </p>
                  </button>
                </div>

                <div className="flex justify-end pt-2 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteScopeDialog(false)}
                    disabled={isSaving}
                  >
                    취소
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
