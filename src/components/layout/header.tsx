'use client';

import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useUIStore } from '@/stores/ui-store';
import { useTaskStore } from '@/stores/task-store';
import { NotificationCenter } from '@/components/layout/notification-center';
import { Menu, Search, Plus, Sun, Moon, Globe, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

/**
 * Top header component.
 */
export function Header() {
  const t = useTranslations('Header');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  const { openCommandPalette, isNotificationCenterOpen, toggleNotificationCenter } = useUIStore();
  const { openCreateModal } = useTaskStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLanguage = () => {
    // Basic language toggle implementation - depends on i18n setup
    // e.g. using next-intl middleware behavior
    const currentLocale = document.cookie.includes('NEXT_LOCALE=ko') ? 'ko' : 'en';
    const nextLocale = currentLocale === 'en' ? 'ko' : 'en';
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000`;
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:px-8">
      <div className="flex items-center gap-4">
        <button className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background hover:bg-muted lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </button>
        <div className="hidden lg:flex lg:items-center lg:gap-2">
          {/* Page title placeholder, could be dynamic */}
          <h1 className="text-lg font-semibold">{t('welcome')}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={openCommandPalette}
          className="group hidden md:flex items-center gap-2 rounded-md border border-border bg-background/50 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title={t('search')}
        >
          <Search className="h-4 w-4" />
          <span>{t('search')}</span>
          <kbd className="hidden ml-2 rounded border border-border bg-muted px-1.5 font-mono text-[10px] sm:inline-block">
            ⌘K
          </kbd>
        </button>

        <button
          onClick={() => openCommandPalette()}
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title={t('search')}
        >
          <Search className="h-4 w-4" />
        </button>

        <button
          onClick={openCreateModal}
          className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          title={t('quickAdd')}
        >
          <Plus className="h-5 w-5" />
        </button>

        <div className="relative">
          <button
            onClick={toggleNotificationCenter}
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors relative"
            title={t('notifications')}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
          </button>
          <NotificationCenter isOpen={isNotificationCenterOpen} onClose={toggleNotificationCenter} />
        </div>

        <button
          onClick={toggleLanguage}
          className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title={t('toggleLanguage')}
        >
          <Globe className="h-5 w-5" />
        </button>

        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title={t('toggleTheme')}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        )}
      </div>
    </header>
  );
}
