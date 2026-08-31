'use client';

import { useTaskStore } from '@/stores/task-store';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

/**
 * Task filters component
 */
export function TaskFilters() {
  const { filters, setFilters, clearFilters } = useTaskStore();
  const t = useTranslations('tasks');

  const hasFilters = Object.keys(filters).length > 0;

  return (
    <div className="px-4 py-3 border-b border-border bg-card flex items-center space-x-4">
      <div className="relative w-64">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input 
          className="pl-9 h-9" 
          placeholder={t('searchTasks')} 
          value={filters.search || ''}
          onChange={(e) => setFilters({ search: e.target.value })}
        />
      </div>
      
      {/* Additional filter dropdowns would go here */}

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground h-9">
          {t('clearFilters')} <X className="w-3 h-3 ml-2" />
        </Button>
      )}
    </div>
  );
}
