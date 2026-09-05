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
  CornerDownLeft,
  ArrowUpDown,
  X,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * World-class Command Palette inspired by Raycast & Linear.
 * Features glassmorphic backdrop, glowing icon tiles, keyboard shortcut badges, and clean footer navigation hints.
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

  const navItems = [
    { icon: LayoutDashboard, labelKey: 'dashboard', href: '/dashboard', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', shortcut: '1' },
    { icon: CheckSquare, labelKey: 'tasks', href: '/tasks', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20', shortcut: '2' },
    { icon: Calendar, labelKey: 'calendar', href: '/calendar', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', shortcut: '3' },
    { icon: Tag, labelKey: 'categories', href: '/categories', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', shortcut: '4' },
    { icon: Timer, labelKey: 'focus', href: '/focus', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20', shortcut: '5' },
    { icon: Settings, labelKey: 'settings', href: '/settings', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20', shortcut: '6' },
  ];

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] sm:pt-[16vh] p-4">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            onClick={closeCommandPalette}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 dark:border-white/10 bg-card/95 backdrop-blur-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] z-50"
          >
            <Command
              className="flex h-full w-full flex-col bg-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Escape') closeCommandPalette();
              }}
            >
              {/* Search Bar Header */}
              <div className="flex items-center border-b border-border/60 px-4 py-3.5 gap-3 bg-background/40">
                <Search className="h-5 w-5 shrink-0 text-primary opacity-80" />
                <Command.Input
                  autoFocus
                  placeholder={t('placeholder')}
                  className="flex h-7 w-full bg-transparent text-sm font-medium text-foreground outline-none border-none ring-0 focus:ring-0 focus:outline-none placeholder:text-muted-foreground/70"
                />
                <button 
                  onClick={closeCommandPalette}
                  className="px-1.5 py-0.5 rounded text-[11px] font-mono text-muted-foreground bg-muted/60 hover:bg-muted border border-border/50 transition-colors"
                >
                  ESC
                </button>
              </div>

              {/* Items List */}
              <Command.List className="max-h-[340px] overflow-y-auto overflow-x-hidden p-2.5 space-y-1.5 scrollbar-thin">
                <Command.Empty className="py-10 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                  <Sparkles className="w-5 h-5 text-muted-foreground/40" />
                  <span>{t('noResults')}</span>
                </Command.Empty>
                
                {/* Actions Group */}
                <Command.Group 
                  heading={t('actions')} 
                  className="text-[11px] font-semibold tracking-wider text-muted-foreground/80 px-2 py-1.5 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
                >
                  {/* Create Task */}
                  <Command.Item
                    onSelect={() => runCommand(() => openCreateModal())}
                    className="group relative flex cursor-pointer select-none items-center justify-between rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-150 aria-selected:bg-primary/15 aria-selected:text-foreground aria-selected:ring-1 aria-selected:ring-primary/40 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary group-aria-selected:bg-primary group-aria-selected:text-primary-foreground transition-colors">
                        <Plus className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-foreground">{t('newTask')}</span>
                    </div>
                    <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded bg-muted/70 px-2 py-0.5 text-[10px] font-mono text-muted-foreground border border-border/60">
                      <span>⌘</span>N
                    </kbd>
                  </Command.Item>

                  {/* Toggle Theme */}
                  <Command.Item
                    onSelect={() => runCommand(() => setTheme(theme === 'dark' ? 'light' : 'dark'))}
                    className="group relative flex cursor-pointer select-none items-center justify-between rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-150 aria-selected:bg-primary/15 aria-selected:text-foreground aria-selected:ring-1 aria-selected:ring-primary/40 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 group-aria-selected:bg-amber-500 group-aria-selected:text-white transition-colors">
                        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                      </div>
                      <span className="font-medium text-foreground">{t('toggleTheme')}</span>
                    </div>
                    <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded bg-muted/70 px-2 py-0.5 text-[10px] font-mono text-muted-foreground border border-border/60">
                      <span>⌘</span>T
                    </kbd>
                  </Command.Item>

                  {/* Toggle Language */}
                  <Command.Item
                    onSelect={() => runCommand(() => {
                      const currentLocale = document.cookie.includes('NEXT_LOCALE=ko') ? 'ko' : 'en';
                      document.cookie = `NEXT_LOCALE=${currentLocale === 'en' ? 'ko' : 'en'}; path=/; max-age=31536000`;
                      router.refresh();
                    })}
                    className="group relative flex cursor-pointer select-none items-center justify-between rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-150 aria-selected:bg-primary/15 aria-selected:text-foreground aria-selected:ring-1 aria-selected:ring-primary/40 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 group-aria-selected:bg-emerald-500 group-aria-selected:text-white transition-colors">
                        <Globe className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-foreground">{t('toggleLanguage')}</span>
                    </div>
                    <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded bg-muted/70 px-2 py-0.5 text-[10px] font-mono text-muted-foreground border border-border/60">
                      <span>⌘</span>L
                    </kbd>
                  </Command.Item>
                </Command.Group>

                <Command.Separator className="my-1.5 h-px bg-border/50" />

                {/* Navigation Group */}
                <Command.Group 
                  heading={t('navigation')} 
                  className="text-[11px] font-semibold tracking-wider text-muted-foreground/80 px-2 py-1.5 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
                >
                  {navItems.map((item) => (
                    <Command.Item
                      key={item.href}
                      onSelect={() => runCommand(() => router.push(item.href))}
                      className="group relative flex cursor-pointer select-none items-center justify-between rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-150 aria-selected:bg-primary/15 aria-selected:text-foreground aria-selected:ring-1 aria-selected:ring-primary/40 hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg border ${item.color} transition-colors`}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-foreground">{t(item.labelKey)}</span>
                      </div>
                      <kbd className="hidden sm:inline-flex items-center rounded bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground border border-border/40">
                        {item.shortcut}
                      </kbd>
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>

              {/* Bottom Footer Navigation Bar */}
              <div className="flex items-center justify-between border-t border-border/60 px-4 py-2.5 bg-background/50 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] border border-border/50">↑↓</kbd>
                    <span>탐색</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] border border-border/50">↵</kbd>
                    <span>선택</span>
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span>WithUs Todo Command</span>
                </div>
              </div>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
