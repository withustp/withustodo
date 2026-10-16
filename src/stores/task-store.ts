'use client';

import { create } from 'zustand';
import { Task, TaskViewMode, TaskFilter } from '@/types';

/**
 * State and actions for the task store.
 */
interface TaskState {
  tasks: Task[];
  selectedTaskIds: string[];
  viewMode: TaskViewMode;
  filters: TaskFilter;
  isCreateModalOpen: boolean;
  detailPanelTaskId: string | null;
  detailPanelTargetDate: string | null;

  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskSelection: (id: string) => void;
  selectAllTasks: () => void;
  clearSelection: () => void;
  setViewMode: (mode: TaskViewMode) => void;
  setFilters: (filters: Partial<TaskFilter>) => void;
  clearFilters: () => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openDetailPanel: (taskId: string, targetDate?: string | Date | null) => void;
  closeDetailPanel: () => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  selectedTaskIds: [],
  viewMode: 'list',
  filters: {},
  isCreateModalOpen: false,
  detailPanelTaskId: null,
  detailPanelTargetDate: null,

  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...updates } : task))
  })),
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter((task) => task.id !== id)
  })),
  toggleTaskSelection: (id) => set((state) => ({
    selectedTaskIds: state.selectedTaskIds.includes(id)
      ? state.selectedTaskIds.filter((taskId) => taskId !== id)
      : [...state.selectedTaskIds, id]
  })),
  selectAllTasks: () => set((state) => ({
    selectedTaskIds: state.tasks.map((task) => task.id)
  })),
  clearSelection: () => set({ selectedTaskIds: [] }),
  setViewMode: (viewMode) => set({ viewMode }),
  setFilters: (newFilters) => set((state) => {
    const updated = { ...state.filters, ...newFilters };
    Object.keys(newFilters).forEach((key) => {
      const val = (newFilters as any)[key];
      if (val === undefined || val === null || val === '') {
        delete (updated as any)[key];
      }
    });
    return { filters: updated };
  }),
  clearFilters: () => set({ filters: {} }),
  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),
  openDetailPanel: (taskId, targetDate) => {
    let dateStr: string | null = null;
    if (targetDate) {
      if (typeof targetDate === 'string') {
        dateStr = targetDate.includes('T') ? targetDate.split('T')[0] : targetDate;
      } else if (targetDate instanceof Date) {
        const y = targetDate.getFullYear();
        const m = String(targetDate.getMonth() + 1).padStart(2, '0');
        const d = String(targetDate.getDate()).padStart(2, '0');
        dateStr = `${y}-${m}-${d}`;
      }
    }
    set({ detailPanelTaskId: taskId, detailPanelTargetDate: dateStr });
  },
  closeDetailPanel: () => set({ detailPanelTaskId: null, detailPanelTargetDate: null }),
}));
