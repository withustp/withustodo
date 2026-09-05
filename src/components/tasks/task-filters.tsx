'use client';

import { useTaskStore } from '@/stores/task-store';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Tag } from 'lucide-react';
import { useCategories } from '@/hooks/use-categories';
import { cn } from '@/lib/utils';

/**
 * Task Filters Component with quick Category Selector Pills and Search
 */
export function TaskFilters() {
  const { filters, setFilters, clearFilters } = useTaskStore();
  const { categories } = useCategories();
  const t = useTranslations('tasks');

  const selectedCategoryId = filters.category_id;
  const hasFilters = Object.keys(filters).length > 0;

  return (
    <div className="px-4 py-3 border-b border-border bg-card/60 backdrop-blur-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* Left: Search Input */}
      <div className="relative w-full sm:w-64">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input 
          className="pl-9 h-9 bg-background/60 text-xs" 
          placeholder={t('searchTasks')} 
          value={filters.search || ''}
          onChange={(e) => setFilters({ search: e.target.value })}
        />
      </div>
      
      {/* Right: Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-1 sm:justify-end">
        <button
          onClick={() => setFilters({ category_id: undefined })}
          className={cn(
            "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border",
            !selectedCategoryId
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "border-border/60 bg-background/40 text-muted-foreground hover:text-foreground"
          )}
        >
          전체 보기
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setFilters({ category_id: isSelected ? undefined : cat.id })}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border",
                isSelected
                  ? "border-primary bg-primary/15 text-primary shadow-sm ring-1 ring-primary/40"
                  : "border-border/60 bg-background/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              <div 
                className="w-2 h-2 rounded-full shrink-0" 
                style={{ backgroundColor: cat.color }} 
              />
              <span>{cat.name}</span>
              {cat.task_count !== undefined && (
                <span className="text-[10px] opacity-70 font-mono">({cat.task_count})</span>
              )}
            </button>
          );
        })}

        {hasFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters} 
            className="text-xs text-muted-foreground hover:text-foreground h-7 px-2 shrink-0 ml-1"
          >
            {t('clearFilters')} <X className="w-3 h-3 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
