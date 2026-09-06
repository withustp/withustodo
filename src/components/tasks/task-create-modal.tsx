'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskStore } from '@/stores/task-store';
import { useTasks } from '@/hooks/use-tasks';
import { useCategories } from '@/hooks/use-categories';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Flag, Calendar as CalendarIcon, Tag, Repeat } from 'lucide-react';
import { toast } from 'sonner';
import { Priority, Status, RecurringType } from '@/types';
import { cn } from '@/lib/utils';
import { formatRecurrenceSummary } from '@/lib/recurrence';

/**
 * Enhanced Task creation modal using standardized Dialog with category, priority,
 * due date, and customizable recurring schedule (daily, weekly, monthly, until date).
 */
export function TaskCreateModal() {
  const { isCreateModalOpen, closeCreateModal } = useTaskStore();
  const { createTask } = useTasks();
  const { categories } = useCategories();
  const tTasks = useTranslations('tasks');
  const tCommon = useTranslations('common');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('none');
  const [categoryId, setCategoryId] = useState<string>('none');
  const [dueDate, setDueDate] = useState('');
  
  // Recurrence state
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState<RecurringType>('weekly');
  const [interval, setInterval] = useState(1);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1]); // default to Monday
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDate, setEndDate] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDueDateChange = (val: string) => {
    setDueDate(val);
    if (val) {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        const day = d.getDay();
        if (daysOfWeek.length <= 1) {
          setDaysOfWeek([day]);
        }
      }
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('none');
    setCategoryId('none');
    setDueDate('');
    setIsRecurring(false);
    setRecurringType('weekly');
    setInterval(1);
    setDaysOfWeek([1]);
    setHasEndDate(false);
    setEndDate('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const recurrencePattern = isRecurring
        ? {
            type: recurringType,
            interval: Math.max(1, interval),
            days_of_week: recurringType === 'weekly' ? (daysOfWeek.length > 0 ? daysOfWeek : [1]) : undefined,
            day_of_month: recurringType === 'monthly'
              ? (dueDate ? new Date(dueDate).getDate() : new Date().getDate())
              : undefined,
            end_date: hasEndDate && endDate ? new Date(endDate).toISOString() : undefined,
          }
        : undefined;

      await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        status: 'todo' as Status,
        priority,
        category_id: categoryId === 'none' ? undefined : categoryId,
        due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
        is_recurring: isRecurring,
        recurring_pattern: recurrencePattern,
      });

      resetForm();
      closeCreateModal();
      toast.success(
        isRecurring
          ? '반복 할 일이 등록되었습니다. 완료 시 다음 일정이 자동 생성됩니다.'
          : '새 할 일이 등록되었습니다.'
      );
    } catch {
      toast.error('할 일 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isCreateModalOpen} onOpenChange={(open) => !open && closeCreateModal()}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto bg-[#0E1017]/95 border-white/10 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            {tTasks('createTask')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Input
              autoFocus
              placeholder="무엇을 해야 하나요?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              className="text-base font-medium bg-white/[0.04] border-white/10 text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="space-y-1.5">
            <Textarea
              placeholder="상세 설명이나 메모를 남겨보세요 (선택 사항)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              className="resize-none min-h-[70px] bg-white/[0.03] border-white/10 text-sm text-zinc-300 placeholder:text-zinc-500"
            />
          </div>

          {/* Task Metadata Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Priority */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                <Flag size={12} className="text-zinc-500" />
                {tTasks('priority')}
              </label>
              <Select value={priority} onValueChange={(val: string) => setPriority(val as Priority)}>
                <SelectTrigger className="w-full h-9 bg-white/[0.03] border-white/10 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#12141C] border-white/10">
                  <SelectItem value="none">{tTasks('none')}</SelectItem>
                  <SelectItem value="low" className="text-blue-400">{tTasks('low')}</SelectItem>
                  <SelectItem value="medium" className="text-amber-400">{tTasks('medium')}</SelectItem>
                  <SelectItem value="high" className="text-rose-400 font-semibold">{tTasks('high')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                <Tag size={12} className="text-zinc-500" />
                {tTasks('category')}
              </label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full h-9 bg-white/[0.03] border-white/10 text-xs">
                  <SelectValue placeholder="선택 안 함" />
                </SelectTrigger>
                <SelectContent className="bg-[#12141C] border-white/10">
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
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                <CalendarIcon size={12} className="text-zinc-500" />
                {tTasks('dueDate')}
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => handleDueDateChange(e.target.value)}
                disabled={isSubmitting}
                className="h-9 bg-white/[0.03] border-white/10 text-xs text-zinc-300"
              />
            </div>
          </div>

          {/* Recurrence Configuration Section */}
          <div className="pt-2 border-t border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <label 
                className="text-xs font-medium text-zinc-300 flex items-center gap-1.5 cursor-pointer"
                onClick={() => setIsRecurring(!isRecurring)}
              >
                <Repeat size={13} className={isRecurring ? "text-indigo-400" : "text-zinc-500"} />
                반복 일정 설정 (주간, 월간, 마감기한)
              </label>
              <button
                type="button"
                onClick={() => setIsRecurring(!isRecurring)}
                className={cn(
                  "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none",
                  isRecurring ? "bg-indigo-600" : "bg-white/10"
                )}
                aria-label="반복 일정 활성화"
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
                  className="space-y-3 bg-white/[0.02] border border-white/5 rounded-lg p-3 overflow-hidden"
                >
                  {/* Frequency & Step Interval */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[11px] text-zinc-400">반복 유형</span>
                      <Select
                        value={recurringType}
                        onValueChange={(val) => setRecurringType(val as RecurringType)}
                      >
                        <SelectTrigger className="w-full h-8 bg-white/[0.04] border-white/10 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#12141C] border-white/10">
                          <SelectItem value="daily">매일 (Daily)</SelectItem>
                          <SelectItem value="weekly">매주 (Weekly)</SelectItem>
                          <SelectItem value="monthly">매월 (Monthly)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] text-zinc-400">반복 간격</span>
                      <Select
                        value={String(interval)}
                        onValueChange={(val: string) => setInterval(parseInt(val) || 1)}
                      >
                        <SelectTrigger className="w-full h-8 bg-white/[0.04] border-white/10 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#12141C] border-white/10">
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

                  {/* Weekly Weekday Selector */}
                  {recurringType === 'weekly' && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] text-zinc-400">반복할 요일</span>
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
                                if (isSelected) {
                                  if (daysOfWeek.length > 1) {
                                    setDaysOfWeek(daysOfWeek.filter((d) => d !== day));
                                  }
                                } else {
                                  setDaysOfWeek([...daysOfWeek, day].sort((a, b) => a - b));
                                }
                              }}
                              className={cn(
                                "h-7 rounded text-xs font-medium transition-colors border",
                                isSelected
                                  ? "bg-indigo-600 border-indigo-500 text-white shadow-sm"
                                  : "bg-white/[0.03] border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]"
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
                  <div className="pt-2 border-t border-white/[0.04] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-zinc-400">반복 종료일 (언제까지?)</span>
                      <label className="flex items-center gap-1.5 text-[11px] text-zinc-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasEndDate}
                          onChange={(e) => setHasEndDate(e.target.checked)}
                          className="rounded border-white/20 bg-white/5 text-indigo-600 focus:ring-0 w-3.5 h-3.5"
                        />
                        종료 날짜 지정
                      </label>
                    </div>

                    {hasEndDate ? (
                      <Input
                        type="date"
                        value={endDate}
                        min={dueDate || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="h-8 bg-white/[0.04] border-white/10 text-xs text-zinc-300"
                      />
                    ) : (
                      <div className="text-[11px] text-zinc-500 italic">
                        종료일 없이 완료할 때마다 계속 다음 일정이 생성됩니다.
                      </div>
                    )}
                  </div>

                  {/* Recurrence Summary Preview */}
                  <div className="text-[11px] text-indigo-300 bg-indigo-500/10 px-2.5 py-1.5 rounded border border-indigo-500/20">
                    💡 설정 요약:{' '}
                    {formatRecurrenceSummary({
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

          <DialogFooter className="pt-4 border-t border-white/[0.06]">
            <Button
              type="button"
              variant="ghost"
              onClick={closeCreateModal}
              disabled={isSubmitting}
              className="text-zinc-400 hover:text-white"
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
            >
              {isSubmitting ? '저장 중...' : tCommon('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
