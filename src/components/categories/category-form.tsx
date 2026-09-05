'use client';

import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Briefcase, User, BookOpen, Tag, GraduationCap, Laptop, Sparkles, Heart, Star, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Category } from '@/types';

interface CategoryFormProps {
  initialData?: Category | null;
  onClose: () => void;
  onSubmit: (data: { name: string; color: string; icon?: string }) => Promise<void>;
}

const PRESET_COLORS = [
  '#6366f1', // Indigo
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#64748b', // Slate
];

const ICONS = [
  { id: 'Tag', icon: Tag, label: '기본 태그' },
  { id: 'BookOpen', icon: BookOpen, label: '책 / 숙제' },
  { id: 'GraduationCap', icon: GraduationCap, label: '학습 / 시험' },
  { id: 'Briefcase', icon: Briefcase, label: '업무 / 발표' },
  { id: 'Laptop', icon: Laptop, label: '개발 / IT' },
  { id: 'User', icon: User, label: '개인' },
  { id: 'Sparkles', icon: Sparkles, label: '아이디어' },
  { id: 'Heart', icon: Heart, label: '건강 / 루틴' },
  { id: 'Star', icon: Star, label: '중요' },
];

/**
 * Category Form Modal
 * Create or edit category with live color presets and icon selector.
 */
export function CategoryForm({ initialData, onClose, onSubmit }: CategoryFormProps) {
  const t = useTranslations('Categories.Form');
  const [name, setName] = useState(initialData?.name || '');
  const [color, setColor] = useState(initialData?.color || '#6366f1');
  const [icon, setIcon] = useState(initialData?.icon || 'Tag');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setColor(initialData.color);
      setIcon(initialData.icon || 'Tag');
    }
  }, [initialData]);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({ name, color, icon });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px] bg-card/95 backdrop-blur-2xl border-border/80 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Palette size={18} className="text-primary" />
            {initialData ? '카테고리 수정' : t('title')}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          {/* Name Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-xs font-semibold text-foreground">
              {t('nameLabel')}
            </label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder={t('namePlaceholder')} 
              className="bg-background/60 h-10"
              autoFocus
            />
          </div>

          {/* Color Presets & Picker */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-foreground">
              {t('colorLabel')}
            </label>
            <div className="flex flex-wrap gap-2 items-center">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-7 h-7 rounded-full transition-transform cursor-pointer relative",
                    color.toLowerCase() === c.toLowerCase() && "scale-125 ring-2 ring-foreground ring-offset-2 ring-offset-background"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
              <div className="flex items-center ml-auto">
                <input 
                  type="color" 
                  value={color} 
                  onChange={(e) => setColor(e.target.value)} 
                  className="w-8 h-8 rounded-lg p-0.5 border border-border cursor-pointer bg-transparent"
                  title="직접 색상 선택"
                />
              </div>
            </div>
          </div>

          {/* Icon Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-foreground">
              아이콘 선택
            </label>
            <div className="grid grid-cols-5 gap-2">
              {ICONS.map((item) => {
                const IconComponent = item.icon;
                const isSelected = icon === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIcon(item.id)}
                    className={cn(
                      "flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-xs gap-1",
                      isSelected 
                        ? "border-primary bg-primary/15 text-primary shadow-sm ring-1 ring-primary/40" 
                        : "border-border/60 bg-background/40 hover:bg-muted text-muted-foreground"
                    )}
                    title={item.label}
                  >
                    <IconComponent size={18} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            {t('cancel')}
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!name.trim() || isSubmitting}>
            {isSubmitting ? '저장 중...' : initialData ? '변경사항 저장' : t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
