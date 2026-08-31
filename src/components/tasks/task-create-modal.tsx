'use client';

import { useState } from 'react';
import { useTaskStore } from '@/stores/task-store';
import { useTasks } from '@/hooks/use-tasks';
import { useCategories } from '@/hooks/use-categories';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Flag, Calendar as CalendarIcon, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { Priority, Status } from '@/types';

/**
 * Enhanced Task creation modal using standardized Dialog with category, priority, and date selection.
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        status: 'todo' as Status,
        priority,
        category_id: categoryId === 'none' ? undefined : categoryId,
        due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
      });
      setTitle('');
      setDescription('');
      setPriority('none');
      setCategoryId('none');
      setDueDate('');
      closeCreateModal();
      toast.success('새 할 일이 등록되었습니다.');
    } catch {
      toast.error('할 일 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isCreateModalOpen} onOpenChange={(open) => !open && closeCreateModal()}>
      <DialogContent className="sm:max-w-[520px] bg-[#0E1017]/95 border-white/10 backdrop-blur-2xl">
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
              className="resize-none min-h-[80px] bg-white/[0.03] border-white/10 text-sm text-zinc-300 placeholder:text-zinc-500"
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
              <Select value={priority} onValueChange={(val: Priority) => setPriority(val)}>
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
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isSubmitting}
                className="h-9 bg-white/[0.03] border-white/10 text-xs text-zinc-300"
              />
            </div>
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
