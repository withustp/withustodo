/**
 * Shared types for the WithUs Todo application.
 * @module types
 */

// User & Auth
export type User = { id: string; email: string; display_name: string; avatar_url: string | null; created_at: string; }

// Category
export type Category = { id: string; user_id: string; name: string; color: string; icon: string | null; sort_order: number; task_count?: number; created_at: string; updated_at: string; }

// Priority
export type Priority = 'high' | 'medium' | 'low' | 'none';

// Task Status
export type TaskStatus = 'todo' | 'in_progress' | 'done';

// Task
export type Task = {
  id: string; user_id: string; title: string; description: string | null;
  status: TaskStatus; priority: Priority;
  category_id: string | null; category?: Category;
  due_date: string | null; 
  reminder_interval: ReminderInterval | null;
  is_recurring: boolean; recurring_pattern: RecurringPattern | null;
  estimated_minutes: number | null; actual_minutes: number | null;
  sort_order: number;
  is_deleted: boolean; deleted_at: string | null;
  completed_at: string | null;
  created_at: string; updated_at: string;
  subtasks?: Subtask[]; labels?: Label[]; attachments?: Attachment[];
}

// Subtask
export type Subtask = { id: string; task_id: string; title: string; is_completed: boolean; sort_order: number; created_at: string; }

// Label
export type Label = { id: string; user_id: string; name: string; color: string; created_at: string; }

// Attachment
export type Attachment = { id: string; task_id: string; file_name: string; file_url: string; file_size: number; file_type: string; created_at: string; }

// Reminder
export type ReminderInterval = '15min' | '30min' | '1hr' | '2hr' | '4hr' | '8hr' | 'daily' | 'weekly';

// Recurring
export type RecurringType = 'daily' | 'weekly' | 'monthly';
export type RecurringPattern = { type: RecurringType; interval: number; days_of_week?: number[]; day_of_month?: number; end_date?: string; }

// Time Entry (Pomodoro)
export type TimeEntry = { id: string; task_id: string | null; user_id: string; duration_seconds: number; type: 'work' | 'break'; started_at: string; ended_at: string; }

// Activity Log
export type ActivityAction = 'created' | 'updated' | 'completed' | 'uncompleted' | 'deleted' | 'restored' | 'moved';
export type ActivityLog = { id: string; user_id: string; task_id: string | null; action: ActivityAction; details: Record<string, unknown> | null; created_at: string; }

// Notification
export type AppNotification = { id: string; user_id: string; title: string; message: string; type: 'reminder' | 'system' | 'achievement'; is_read: boolean; task_id: string | null; created_at: string; }

// User Settings
export type UserSettings = { id: string; user_id: string; theme: 'dark' | 'light' | 'system'; language: 'en' | 'ko'; quiet_hours_start: string | null; quiet_hours_end: string | null; default_reminder_interval: ReminderInterval | null; pomodoro_work_minutes: number; pomodoro_break_minutes: number; pomodoro_long_break_minutes: number; pomodoro_sessions_before_long_break: number; }

// View types
export type TaskViewMode = 'list' | 'kanban' | 'table';
export type CalendarViewMode = 'month' | 'week';

// Filter
export type TaskFilter = { status?: TaskStatus[]; priority?: Priority[]; category_id?: string; label_ids?: string[]; search?: string; date_from?: string; date_to?: string; is_deleted?: boolean; }
