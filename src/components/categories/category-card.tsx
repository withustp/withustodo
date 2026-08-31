'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Briefcase, User, BookOpen, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { Category } from '@/types';

const iconMap: Record<string, any> = {
  Briefcase,
  User,
  BookOpen
};

interface CategoryCardProps {
  category: Category;
  onDelete?: (id: string) => void;
}

/**
 * Category Card
 * Displays a single category with edit/delete actions
 */
export function CategoryCard({ category, onDelete }: CategoryCardProps) {
  const t = useTranslations('Categories.Card');
  const Icon = (category.icon && iconMap[category.icon]) ? iconMap[category.icon] : Tag;

  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
      <Card className="relative overflow-hidden p-6 bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col justify-between h-32 group">
        <div 
          className="absolute left-0 top-0 bottom-0 w-1.5"
          style={{ backgroundColor: category.color }}
        />
        <div className="flex justify-between items-start pl-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-background/50 text-foreground" style={{ color: category.color }}>
              <Icon size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{category.name}</h3>
              <p className="text-sm text-muted-foreground">{category.task_count || 0} {t('tasks')}</p>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onDelete && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onDelete(category.id)}
              >
                <Trash2 size={14} />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
