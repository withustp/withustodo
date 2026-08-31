'use client';

import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Info, Trophy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRef, useEffect } from 'react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const notifications = [
  { id: 1, type: 'reminder', title: 'Task Reminder', message: 'Project proposal due in 2 hours', time: '2m ago', read: false },
  { id: 2, type: 'system', title: 'Update Available', message: 'Version 2.0 is now live!', time: '1h ago', read: true },
  { id: 3, type: 'achievement', title: 'Streak Maintained', message: 'You reached a 7-day streak!', time: '2h ago', read: true },
];

/**
 * Notification Center Dropdown component.
 */
export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const t = useTranslations('Notifications');
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'reminder': return <Bell className="h-4 w-4 text-primary" />;
      case 'system': return <Info className="h-4 w-4 text-blue-500" />;
      case 'achievement': return <Trophy className="h-4 w-4 text-yellow-500" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 top-12 w-80 sm:w-96 rounded-xl border border-border bg-card shadow-lg z-50 overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-border p-4 bg-background/50">
            <h3 className="font-semibold text-foreground">{t('title')}</h3>
            <button className="text-xs flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
              <Check className="h-3 w-3" />
              {t('markAllRead')}
            </button>
          </div>
          <div className="max-h-[400px] overflow-y-auto p-2">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                {t('empty')}
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notif) => (
                  <button
                    key={notif.id}
                    className={cn(
                      "w-full text-left flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors relative",
                      !notif.read && "bg-muted/50"
                    )}
                  >
                    {!notif.read && (
                      <span className="absolute top-4 left-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                    <div className="mt-1 h-8 w-8 rounded-full bg-background flex items-center justify-center shrink-0 border border-border ml-2">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none text-foreground">{notif.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
                      <p className="text-[10px] text-muted-foreground">{notif.time}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
