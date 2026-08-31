-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ============================================
-- PROFILES TABLE
-- Extends Supabase auth.users
-- ============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  kakao_access_token TEXT,  -- Encrypted token for 나에게 보내기
  kakao_refresh_token TEXT,
  kakao_token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- USER SETTINGS TABLE
-- ============================================
CREATE TABLE public.user_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'ko')),
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  default_reminder_interval TEXT CHECK (default_reminder_interval IN ('15min', '30min', '1hr', '2hr', '4hr', '8hr', 'daily', 'weekly')),
  pomodoro_work_minutes INT DEFAULT 25,
  pomodoro_break_minutes INT DEFAULT 5,
  pomodoro_long_break_minutes INT DEFAULT 15,
  pomodoro_sessions_before_long_break INT DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  icon TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- LABELS TABLE
-- ============================================
CREATE TABLE public.labels (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#8b5cf6',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- TASKS TABLE
-- Core todo items
-- ============================================
CREATE TABLE public.tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')) NOT NULL,
  priority TEXT DEFAULT 'none' CHECK (priority IN ('high', 'medium', 'low', 'none')) NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  reminder_interval TEXT CHECK (reminder_interval IN ('15min', '30min', '1hr', '2hr', '4hr', '8hr', 'daily', 'weekly')),
  last_reminded_at TIMESTAMPTZ,
  is_recurring BOOLEAN DEFAULT FALSE,
  estimated_minutes INT,
  actual_minutes INT DEFAULT 0,
  sort_order INT DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- SUBTASKS TABLE
-- ============================================
CREATE TABLE public.subtasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- TASK_LABELS (Junction table)
-- ============================================
CREATE TABLE public.task_labels (
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  label_id UUID REFERENCES public.labels(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (task_id, label_id)
);

-- ============================================
-- RECURRING PATTERNS TABLE
-- ============================================
CREATE TABLE public.recurring_patterns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly')),
  interval_value INT DEFAULT 1 NOT NULL,
  days_of_week INT[],  -- 0=Sun, 1=Mon, ..., 6=Sat
  day_of_month INT CHECK (day_of_month >= 1 AND day_of_month <= 31),
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- ATTACHMENTS TABLE
-- ============================================
CREATE TABLE public.attachments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- TIME ENTRIES TABLE (Pomodoro sessions)
-- ============================================
CREATE TABLE public.time_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  duration_seconds INT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('work', 'break')),
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ NOT NULL
);

-- ============================================
-- ACTIVITY LOG TABLE
-- ============================================
CREATE TABLE public.activity_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'completed', 'uncompleted', 'deleted', 'restored', 'moved')),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('reminder', 'system', 'achievement')),
  is_read BOOLEAN DEFAULT FALSE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- REMINDER LOGS TABLE
-- Track sent reminders for auditing
-- ============================================
CREATE TABLE public.reminder_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  channel TEXT NOT NULL CHECK (channel IN ('kakao', 'in_app')),
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'skipped')),
  error_message TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_status ON public.tasks(user_id, status) WHERE is_deleted = FALSE;
CREATE INDEX idx_tasks_category ON public.tasks(category_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date) WHERE is_deleted = FALSE AND status != 'done';
CREATE INDEX idx_tasks_priority ON public.tasks(user_id, priority) WHERE is_deleted = FALSE;
CREATE INDEX idx_tasks_deleted ON public.tasks(user_id) WHERE is_deleted = TRUE;
CREATE INDEX idx_tasks_reminder ON public.tasks(reminder_interval, last_reminded_at) WHERE reminder_interval IS NOT NULL AND is_deleted = FALSE AND status != 'done';
CREATE INDEX idx_subtasks_task_id ON public.subtasks(task_id);
CREATE INDEX idx_categories_user_id ON public.categories(user_id);
CREATE INDEX idx_labels_user_id ON public.labels(user_id);
CREATE INDEX idx_time_entries_user_id ON public.time_entries(user_id);
CREATE INDEX idx_time_entries_task_id ON public.time_entries(task_id);
CREATE INDEX idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id, is_read);
CREATE INDEX idx_reminder_logs_task ON public.reminder_logs(task_id);

-- ============================================
-- ROW LEVEL SECURITY
-- Every user can only access their own data
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- For each table with user_id, create SELECT/INSERT/UPDATE/DELETE policies
-- Use a consistent pattern: auth.uid() = user_id

-- Helper: create standard CRUD policies for user-owned tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'user_settings', 'categories', 'labels', 'tasks',
    'attachments', 'time_entries', 'activity_log',
    'notifications', 'reminder_logs'
  ])
  LOOP
    EXECUTE format('CREATE POLICY "Users can view own %1$s" ON public.%1$s FOR SELECT USING (auth.uid() = user_id)', tbl);
    EXECUTE format('CREATE POLICY "Users can insert own %1$s" ON public.%1$s FOR INSERT WITH CHECK (auth.uid() = user_id)', tbl);
    EXECUTE format('CREATE POLICY "Users can update own %1$s" ON public.%1$s FOR UPDATE USING (auth.uid() = user_id)', tbl);
    EXECUTE format('CREATE POLICY "Users can delete own %1$s" ON public.%1$s FOR DELETE USING (auth.uid() = user_id)', tbl);
  END LOOP;
END $$;

-- Subtasks: access through task ownership
CREATE POLICY "Users can view own subtasks" ON public.subtasks FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = subtasks.task_id AND tasks.user_id = auth.uid())
);
CREATE POLICY "Users can insert own subtasks" ON public.subtasks FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = subtasks.task_id AND tasks.user_id = auth.uid())
);
CREATE POLICY "Users can update own subtasks" ON public.subtasks FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = subtasks.task_id AND tasks.user_id = auth.uid())
);
CREATE POLICY "Users can delete own subtasks" ON public.subtasks FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = subtasks.task_id AND tasks.user_id = auth.uid())
);

-- Task labels: access through task ownership
CREATE POLICY "Users can view own task_labels" ON public.task_labels FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_labels.task_id AND tasks.user_id = auth.uid())
);
CREATE POLICY "Users can insert own task_labels" ON public.task_labels FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_labels.task_id AND tasks.user_id = auth.uid())
);
CREATE POLICY "Users can delete own task_labels" ON public.task_labels FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_labels.task_id AND tasks.user_id = auth.uid())
);

-- Recurring patterns: access through task ownership
CREATE POLICY "Users can view own recurring_patterns" ON public.recurring_patterns FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = recurring_patterns.task_id AND tasks.user_id = auth.uid())
);
CREATE POLICY "Users can insert own recurring_patterns" ON public.recurring_patterns FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = recurring_patterns.task_id AND tasks.user_id = auth.uid())
);
CREATE POLICY "Users can update own recurring_patterns" ON public.recurring_patterns FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = recurring_patterns.task_id AND tasks.user_id = auth.uid())
);
CREATE POLICY "Users can delete own recurring_patterns" ON public.recurring_patterns FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = recurring_patterns.task_id AND tasks.user_id = auth.uid())
);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-create profile and settings when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );
  
  INSERT INTO public.user_settings (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-set completed_at when task status changes to 'done'
CREATE OR REPLACE FUNCTION public.handle_task_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'done' AND (OLD.status IS NULL OR OLD.status != 'done') THEN
    NEW.completed_at = NOW();
  ELSIF NEW.status != 'done' AND OLD.status = 'done' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_task_status_change
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_task_completion();
