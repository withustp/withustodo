'use client';

import { useUIStore } from '@/stores/ui-store';
import { useTaskStore } from '@/stores/task-store';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { Header } from '@/components/layout/header';
import { CommandPalette } from '@/components/layout/command-palette';
import { AICopilot } from '@/components/chat/ai-copilot';
import { TaskDetailPanel } from '@/components/tasks/task-detail-panel';
import { TaskCreateModal } from '@/components/tasks/task-create-modal';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { cn } from '@/lib/utils';
import { useEffect, useState, useMemo } from 'react';

/**
 * App Layout containing the sidebar, header, main content area, modals, and AI Copilot.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isSidebarCollapsed = useUIStore((state) => state.isSidebarCollapsed);
  const toggleCommandPalette = useUIStore((state) => state.toggleCommandPalette);
  const openCreateModal = useTaskStore((state) => state.openCreateModal);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const shortcuts = useMemo(() => ({
    commandPalette: toggleCommandPalette,
    newTask: openCreateModal,
  }), [toggleCommandPalette, openCreateModal]);

  useKeyboardShortcuts(shortcuts);

  if (!mounted) {
    return null; // Avoid hydration mismatch on initial render
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div
        className={cn(
          'flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out',
          isSidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[260px]'
        )}
      >
        <Header />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 pb-20 lg:pb-8">
          {children}
        </main>
      </div>
      <MobileNav />
      <CommandPalette />
      <AICopilot />
      <TaskDetailPanel />
      <TaskCreateModal />
    </div>
  );
}
