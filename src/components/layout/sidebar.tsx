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
  Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
  { href: '/tasks', icon: CheckSquare, labelKey: 'tasks' },
  { href: '/calendar', icon: Calendar, labelKey: 'calendar' },
  { href: '/categories', icon: Tag, labelKey: 'categories' },
  { href: '/focus', icon: Timer, labelKey: 'focus' },
  { href: '/settings', icon: Settings, labelKey: 'settings' },
];

/**
 * Desktop sidebar component with live authenticated user profile.
 */
export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations('Navigation');
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();
  const [userName, setUserName] = useState('User');
  const [userEmail, setUserEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const supabase = createClient();

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || '');

        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('id', user.id)
          .single();

        const effectiveName = profile?.display_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User';
        const effectiveAvatar = profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || '';

        setUserName(effectiveName);
        setAvatarUrl(effectiveAvatar);
      }
    };
    loadUser();
  }, [supabase]);

  const initials = userName ? userName.slice(0, 2).toUpperCase() : 'WU';

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 lg:flex',
        isSidebarCollapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      <div className="flex h-14 items-center px-4 py-4">
        <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl overflow-hidden shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="WithUs Todo" className="h-full w-full object-cover" />
          </div>
          <span
            className={cn(
              'font-bold text-lg tracking-tight whitespace-nowrap transition-opacity duration-300 bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent',
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

        {/* Live User Profile Footer */}
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-2.5 py-2 rounded-xl border border-sidebar-border bg-sidebar-accent/30 hover:bg-sidebar-accent transition-all group pt-2.5 pb-2.5',
            pathname.startsWith('/settings') && 'ring-1 ring-primary/40 bg-sidebar-accent'
          )}
          title={isSidebarCollapsed ? `${userName} (${userEmail})` : undefined}
        >
          <div className="relative shrink-0">
            <Avatar className="h-8 w-8 border border-border shadow-sm">
              <AvatarImage src={avatarUrl} alt={userName} className="object-cover" />
              <AvatarFallback className="text-xs font-bold bg-primary/20 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-sidebar" />
          </div>

          <div
            className={cn(
              'flex flex-col min-w-0 transition-opacity duration-300',
              isSidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'
            )}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold truncate text-foreground group-hover:text-primary transition-colors">
                {userName}
              </span>
              <Sparkles className="w-2.5 h-2.5 text-primary shrink-0" />
            </div>
            <span className="text-[10px] text-muted-foreground truncate max-w-[130px]">
              {userEmail || 'WithUs Pro'}
            </span>
          </div>
        </Link>

        <button
          onClick={toggleSidebar}
          className="mt-3 flex w-full items-center justify-center rounded-lg border border-sidebar-border bg-background/50 p-2 text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
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
