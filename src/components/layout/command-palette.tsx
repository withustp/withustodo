'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useUIStore } from '@/stores/ui-store';
import { useTaskStore } from '@/stores/task-store';
import {
  Search,
  Plus,
  Sun,
  Moon,
  Globe,
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Tag,
  Timer,
  Settings,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Global Command Palette component powered by cmdk.
 */
export function CommandPalette() {
  const { isCommandPaletteOpen, closeCommandPalette } = useUIStore();
  const { openCreateModal } = useTaskStore();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const t = useTranslations('CommandPalette');
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        useUIStore.getState().toggleCommandPalette();
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!mounted) return null;

  const runCommand = (command: () => void) => {
    closeCommandPalette();
    command();
  };

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[20vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={closeCommandPalette}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative w-full max-w-xl overflow-hidden rounded-xl border border-border bg-card shadow-2xl z-50 mx-4"
          >
            <Command
              className="flex h-full w-full flex-col bg-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Escape') closeCommandPalette();
              }}
            >
              <div className="flex items-center border-b border-border px-3" cmdk-input-wrapper="">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <Command.Input
                  autoFocus
                  placeholder={t('placeholder')}
                  className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
                <Command.Empty className="py-6 text-center text-sm">{t('noResults')}</Command.Empty>
                
                <Command.Group heading={t('actions')} className="text-xs font-medium text-muted-foreground px-2 py-1.5 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
                  <Command.Item
                    onSelect={() => runCommand(() => openCreateModal())}
                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none aria-selected:bg-muted aria-selected:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-muted"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    <span>{t('newTask')}</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => setTheme(theme === 'dark' ? 'light' : 'dark'))}
                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none aria-selected:bg-muted aria-selected:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-muted"
                  >
                    {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                    <span>{t('toggleTheme')}</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => {
                      const currentLocale = document.cookie.includes('NEXT_LOCALE=ko') ? 'ko' : 'en';
                      document.cookie = `NEXT_LOCALE=${currentLocale === 'en' ? 'ko' : 'en'}; path=/; max-age=31536000`;
                      router.refresh();
                    })}
                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none aria-selected:bg-muted aria-selected:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-muted"
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    <span>{t('toggleLanguage')}</span>
                  </Command.Item>
                </Command.Group>

                <Command.Separator className="-mx-2 h-px bg-border" />

                <Command.Group heading={t('navigation')} className="text-xs font-medium text-muted-foreground px-2 py-1.5 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
                  {[
                    { icon: LayoutDashboard, labelKey: 'dashboard', href: '/dashboard' },
                    { icon: CheckSquare, labelKey: 'tasks', href: '/tasks' },
                    { icon: Calendar, labelKey: 'calendar', href: '/calendar' },
                    { icon: Tag, labelKey: 'categories', href: '/categories' },
                    { icon: Timer, labelKey: 'focus', href: '/focus' },
                    { icon: Settings, labelKey: 'settings', href: '/settings' },
                  ].map((item) => (
                    <Command.Item
                      key={item.href}
                      onSelect={() => runCommand(() => router.push(item.href))}
                      className="relative flex cursor-default select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none aria-selected:bg-muted aria-selected:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-muted"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{t(item.labelKey)}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
