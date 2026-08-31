'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { CategoryCard } from '@/components/categories/category-card';
import { CategoryForm } from '@/components/categories/category-form';

const mockCategories = [
  { id: '1', name: 'Work', color: '#3b82f6', icon: 'Briefcase', taskCount: 12 },
  { id: '2', name: 'Personal', color: '#10b981', icon: 'User', taskCount: 8 },
  { id: '3', name: 'Study', color: '#f59e0b', icon: 'BookOpen', taskCount: 5 },
];

/**
 * Categories Page
 * Manage task categories
 */
export default function CategoriesPage() {
  const t = useTranslations('Categories');
  const [isFormOpen, setIsFormOpen] = useState(false);

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

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {mockCategories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </motion.div>

      {isFormOpen && (
        <CategoryForm onClose={() => setIsFormOpen(false)} />
      )}
    </div>
  );
}
