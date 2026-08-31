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
  openDetailPanel: (taskId: string) => void;
  closeDetailPanel: () => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  selectedTaskIds: [],
  viewMode: 'list',
  filters: {},
  isCreateModalOpen: false,
  detailPanelTaskId: null,

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
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  clearFilters: () => set({ filters: {} }),
  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),
  openDetailPanel: (taskId) => set({ detailPanelTaskId: taskId }),
  closeDetailPanel: () => set({ detailPanelTaskId: null }),
}));
