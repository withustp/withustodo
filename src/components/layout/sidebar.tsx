'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useUIStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Tag,
  Timer,
  Settings,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
  { href: '/tasks', icon: CheckSquare, labelKey: 'tasks' },
  { href: '/calendar', icon: Calendar, labelKey: 'calendar' },
  { href: '/categories', icon: Tag, labelKey: 'categories' },
  { href: '/focus', icon: Timer, labelKey: 'focus' },
  { href: '/settings', icon: Settings, labelKey: 'settings' },
];

/**
 * Desktop sidebar component.
 */
export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations('Navigation');
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 lg:flex',
        isSidebarCollapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      <div className="flex h-14 items-center px-4 py-4">
        <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CheckCircle className="h-5 w-5" />
          </div>
          <span
            className={cn(
              'font-semibold text-lg whitespace-nowrap transition-opacity duration-300',
              isSidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'
            )}
          >
            WithUs
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors relative',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-foreground'
                  : 'text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
              title={isSidebarCollapsed ? t(item.labelKey) : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span
                className={cn(
                  'whitespace-nowrap transition-opacity duration-300',
                  isSidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'
                )}
              >
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 mt-auto">
        <Link
          href="/trash"
          className={cn(
            'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground mb-4',
            pathname.startsWith('/trash') && 'bg-sidebar-accent text-sidebar-foreground'
          )}
          title={isSidebarCollapsed ? t('trash') : undefined}
        >
          <Trash2 className="h-5 w-5 shrink-0" />
          <span
            className={cn(
              'whitespace-nowrap transition-opacity duration-300',
              isSidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'
            )}
          >
            {t('trash')}
          </span>
        </Link>

        <div className="flex items-center gap-3 px-3 py-2 border-t border-sidebar-border pt-4">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
            <span className="text-xs font-medium">US</span>
          </div>
          <span
            className={cn(
              'text-sm font-medium truncate transition-opacity duration-300',
              isSidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'
            )}
          >
            User
          </span>
        </div>

        <button
          onClick={toggleSidebar}
          className="mt-4 flex w-full items-center justify-center rounded-lg border border-sidebar-border bg-background/50 p-2 text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
          aria-label="Toggle Sidebar"
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
