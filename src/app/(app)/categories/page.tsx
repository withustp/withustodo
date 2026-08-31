'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { CategoryCard } from '@/components/categories/category-card';
import { CategoryForm } from '@/components/categories/category-form';
import { useCategories } from '@/hooks/use-categories';
import { toast } from 'sonner';

/**
 * Categories Page
 * Manage task categories with real-time Supabase connection
 */
export default function CategoriesPage() {
  const t = useTranslations('Categories');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { categories, isLoading, createCategory, deleteCategory } = useCategories();

  const handleCreate = async ({ name, color }: { name: string; color: string }) => {
    try {
      await createCategory({ name, color, sort_order: categories.length });
      toast.success('카테고리가 생성되었습니다.');
    } catch {
      toast.error('카테고리 생성에 실패했습니다.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      toast.success('카테고리가 삭제되었습니다.');
    } catch {
      toast.error('카테고리 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="gap-2">
          <Plus size={16} />
          {t('addCategory')}
        </Button>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground py-10 text-center">로딩 중...</div>
      ) : categories.length === 0 ? (
        <div className="text-muted-foreground py-12 text-center bg-card/30 rounded-xl border border-border">
          등록된 카테고리가 없습니다. 새 카테고리를 만들어 보세요!
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} onDelete={handleDelete} />
          ))}
        </motion.div>
      )}

      {isFormOpen && (
        <CategoryForm 
          onClose={() => setIsFormOpen(false)} 
          onSubmit={handleCreate}
        />
      )}
    </div>
  );
}
