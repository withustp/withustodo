'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function AppearanceSection() {
  const t = useTranslations('Settings.Appearance');
  const { theme, setTheme } = useTheme();

  return (
    <Card className="p-6 bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10">
      <h2 className="text-xl font-semibold mb-6">{t('title')}</h2>
      
      <div className="flex flex-col gap-8">
        <div className="grid gap-4">
          <label className="text-sm font-medium">{t('theme')}</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button 
              onClick={() => setTheme('light')}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
            >
              <Sun className="mb-2" />
              <span className="text-sm font-medium">{t('themes.light')}</span>
            </button>
            <button 
              onClick={() => setTheme('dark')}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
            >
              <Moon className="mb-2" />
              <span className="text-sm font-medium">{t('themes.dark')}</span>
            </button>
            <button 
              onClick={() => setTheme('system')}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors ${theme === 'system' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
            >
              <Monitor className="mb-2" />
              <span className="text-sm font-medium">{t('themes.system')}</span>
            </button>
          </div>
        </div>

        <div className="grid gap-4 max-w-xs">
          <label className="text-sm font-medium">{t('language')}</label>
          <Select defaultValue="en">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ko">한국어</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}
