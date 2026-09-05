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
import { Category } from '@/types';

/**
 * Categories Page
 * Manage task categories with real-time Supabase connection & live editing
 */
export default function CategoriesPage() {
  const t = useTranslations('Categories');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { categories, isLoading, createCategory, updateCategory, deleteCategory } = useCategories();

  const handleCreateOrUpdate = async (data: { name: string; color: string; icon?: string }) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, data);
        toast.success('카테고리가 성공적으로 수정되었습니다.');
        setEditingCategory(null);
      } else {
        await createCategory({ ...data, sort_order: categories.length });
        toast.success('카테고리가 생성되었습니다.');
      }
    } catch {
      toast.error(editingCategory ? '카테고리 수정에 실패했습니다.' : '카테고리 생성에 실패했습니다.');
    }
  };

  const handleStartEdit = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('이 카테고리를 삭제하시겠습니까? 연결된 할 일은 미분류로 유지됩니다.')) {
      return;
    }
    try {
      await deleteCategory(id);
      toast.success('카테고리가 삭제되었습니다.');
    } catch {
      toast.error('카테고리 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('title')}</h1>
          <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
        </div>
        <Button 
          onClick={() => {
            setEditingCategory(null);
            setIsFormOpen(true);
          }} 
          className="gap-2 shadow-md"
        >
          <Plus size={16} />
          {t('addCategory')}
        </Button>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground py-16 text-center text-sm">카테고리를 불러오는 중...</div>
      ) : categories.length === 0 ? (
        <div className="text-muted-foreground py-16 text-center bg-card/30 rounded-2xl border border-border/80">
          등록된 카테고리가 없습니다. 새 카테고리를 만들어 보세요!
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {categories.map((category) => (
            <CategoryCard 
              key={category.id} 
              category={category} 
              onEdit={handleStartEdit}
              onDelete={handleDelete} 
            />
          ))}
        </motion.div>
      )}

      {isFormOpen && (
        <CategoryForm 
          initialData={editingCategory}
          onClose={() => {
            setIsFormOpen(false);
            setEditingCategory(null);
          }} 
          onSubmit={handleCreateOrUpdate}
        />
      )}
    </div>
  );
}
