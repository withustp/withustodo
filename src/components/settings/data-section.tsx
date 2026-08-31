'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Trash2, AlertTriangle } from 'lucide-react';

export function DataSection() {
  const t = useTranslations('Settings.Data');

  return (
    <Card className="p-6 bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 border-destructive/20">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-destructive">
        <AlertTriangle size={20} />
        {t('title')}
      </h2>
      
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-border">
          <div>
            <h3 className="font-medium">{t('exportData')}</h3>
            <p className="text-sm text-muted-foreground">{t('exportDesc')}</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none gap-2" asChild>
              <a href="/api/export?format=csv"><Download size={16}/> CSV</a>
            </Button>
            <Button variant="outline" className="flex-1 sm:flex-none gap-2" asChild>
              <a href="/api/export?format=json"><Download size={16}/> JSON</a>
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-border">
          <div>
            <h3 className="font-medium">{t('clearCompleted')}</h3>
            <p className="text-sm text-muted-foreground">{t('clearCompletedDesc')}</p>
          </div>
          <Button variant="secondary" className="w-full sm:w-auto text-destructive hover:bg-destructive/10">
            {t('clearCompletedBtn')}
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-medium text-destructive">{t('deleteAccount')}</h3>
            <p className="text-sm text-muted-foreground">{t('deleteAccountDesc')}</p>
          </div>
          <Button variant="destructive" className="w-full sm:w-auto gap-2">
            <Trash2 size={16} />
            {t('deleteAccountBtn')}
          </Button>
        </div>
      </div>
    </Card>
  );
}
