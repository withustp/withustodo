'use client';

import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface CategoryFormProps {
  onClose: () => void;
  onSubmit: (data: { name: string; color: string }) => Promise<void>;
}

/**
 * Category Form Modal
 * Create or edit a category
 */
export function CategoryForm({ onClose, onSubmit }: CategoryFormProps) {
  const t = useTranslations('Categories.Form');
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({ name, color });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-medium">
              {t('nameLabel')}
            </label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder={t('namePlaceholder')} 
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="color" className="text-sm font-medium">
              {t('colorLabel')}
            </label>
            <div className="flex gap-2">
              <Input 
                id="color" 
                type="color" 
                value={color} 
                onChange={(e) => setColor(e.target.value)} 
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input 
                value={color} 
                onChange={(e) => setColor(e.target.value)} 
                className="flex-1"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>{t('cancel')}</Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || isSubmitting}>
            {isSubmitting ? '저장 중...' : t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
