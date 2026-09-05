'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Pencil, Briefcase, User, BookOpen, Tag, GraduationCap, Laptop, Sparkles, Heart, Star, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Category } from '@/types';
import { useRouter } from 'next/navigation';
import { useTaskStore } from '@/stores/task-store';

const iconMap: Record<string, any> = {
  Briefcase,
  User,
  BookOpen,
  Tag,
  GraduationCap,
  Laptop,
  Sparkles,
  Heart,
  Star,
};

interface CategoryCardProps {
  category: Category;
  onEdit?: (category: Category) => void;
  onDelete?: (id: string) => void;
}

/**
 * Category Card with edit & delete controls and 1-click filter link to /tasks
 */
export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const t = useTranslations('Categories.Card');
  const router = useRouter();
  const { setFilters } = useTaskStore();
  const Icon = (category.icon && iconMap[category.icon]) ? iconMap[category.icon] : Tag;

  const handleGoToTasks = () => {
    setFilters({ category_id: category.id });
    router.push('/tasks');
  };

  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.15 }}>
      <Card className="relative overflow-hidden p-5 bg-card/60 backdrop-blur-xl border border-border/80 flex flex-col justify-between h-36 group shadow-md hover:border-primary/40 transition-all cursor-pointer">
        {/* Left Color Indicator Bar */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-1.5"
          style={{ backgroundColor: category.color }}
        />

        <div className="flex justify-between items-start pl-2">
          <div className="flex items-center gap-3">
            <div 
              className="p-2.5 rounded-xl border transition-colors shadow-inner"
              style={{ 
                backgroundColor: `${category.color}15`, 
                borderColor: `${category.color}30`,
                color: category.color 
              }}
            >
              <Icon size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                {category.task_count || 0} {t('tasks')}
              </p>
            </div>
          </div>

          {/* Action Buttons (Edit / Delete) */}
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(category);
                }}
                title="카테고리 수정"
              >
                <Pencil size={14} />
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(category.id);
                }}
                title="카테고리 삭제"
              >
                <Trash2 size={14} />
              </Button>
            )}
          </div>
        </div>

        {/* Footer Quick Link to Tasks Page */}
        <div 
          onClick={handleGoToTasks}
          className="pl-2 flex items-center justify-between text-xs text-muted-foreground hover:text-primary transition-colors pt-2 border-t border-border/40"
        >
          <span>할 일 목록에서 보기</span>
          <ArrowRight size={13} />
        </div>
      </Card>
    </motion.div>
  );
}
