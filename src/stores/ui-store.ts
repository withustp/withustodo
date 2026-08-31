'use client';

import { create } from 'zustand';

/**
 * State and actions for the UI store.
 */
interface UIState {
  isSidebarCollapsed: boolean;
  isMobileNavVisible: boolean;
  isCommandPaletteOpen: boolean;
  isNotificationCenterOpen: boolean;
  activeModal: string | null;

  toggleSidebar: () => void;
  collapseSidebar: () => void;
  expandSidebar: () => void;
  toggleMobileNav: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;
  toggleNotificationCenter: () => void;
  setActiveModal: (modalId: string) => void;
  clearModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarCollapsed: false,
  isMobileNavVisible: false,
  isCommandPaletteOpen: false,
  isNotificationCenterOpen: false,
  activeModal: null,

  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  collapseSidebar: () => set({ isSidebarCollapsed: true }),
  expandSidebar: () => set({ isSidebarCollapsed: false }),
  toggleMobileNav: () => set((state) => ({ isMobileNavVisible: !state.isMobileNavVisible })),
  openCommandPalette: () => set({ isCommandPaletteOpen: true }),
  closeCommandPalette: () => set({ isCommandPaletteOpen: false }),
  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
  toggleNotificationCenter: () => set((state) => ({ isNotificationCenterOpen: !state.isNotificationCenterOpen })),
  setActiveModal: (modalId) => set({ activeModal: modalId }),
  clearModal: () => set({ activeModal: null }),
}));
