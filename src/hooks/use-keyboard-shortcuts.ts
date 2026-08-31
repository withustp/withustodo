'use client';

import { useEffect } from 'react';

type ShortcutAction = () => void;

interface ShortcutMap {
  [key: string]: ShortcutAction;
}

/**
 * useKeyboardShortcuts Hook
 * Global keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && e.key === 'k') {
        if (shortcuts.commandPalette) {
          e.preventDefault();
          shortcuts.commandPalette();
        }
      }
      
      if (cmdOrCtrl && e.key === 'n') {
        if (shortcuts.newTask) {
          e.preventDefault();
          shortcuts.newTask();
        }
      }

      if (e.key === 'Escape') {
        if (shortcuts.escape) {
          e.preventDefault();
          shortcuts.escape();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
