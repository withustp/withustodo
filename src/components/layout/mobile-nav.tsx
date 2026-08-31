'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Timer,
  Settings,
} from 'lucide-react';

const mobileNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
  { href: '/tasks', icon: CheckSquare, labelKey: 'tasks' },
  { href: '/calendar', icon: Calendar, labelKey: 'calendar' },
  { href: '/focus', icon: Timer, labelKey: 'focus' },
  { href: '/settings', icon: Settings, labelKey: 'settings' },
];

/**
 * Mobile bottom navigation component.
 */
export function MobileNav() {
  const pathname = usePathname();
  const t = useTranslations('Navigation');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-border bg-background/80 backdrop-blur-xl pb-safe pt-1 lg:hidden">
      {mobileNavItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center gap-1 px-2 py-1 text-xs transition-colors relative',
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{t(item.labelKey)}</span>
            {isActive && (
              <span className="absolute -top-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
