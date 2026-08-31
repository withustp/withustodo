# WithUs Todo — Complete Project Walkthrough

**WithUs Todo** is a human-crafted personal productivity and task management web application with customizable KakaoTalk reminders, Pomodoro focus sessions, multi-view task management, full analytics, and bilingual localization.

---

## What Was Built

### 1. Architecture & Core Infrastructure
- **Framework**: Next.js 14/16 App Router with strict TypeScript and Tailwind CSS (CSS variable-driven design tokens).
- **Backend & Database**: Supabase PostgreSQL with Row Level Security (RLS), triggers for automated profiling, default category seeding, and `pg_cron` recurring reminder triggers.
- **Authentication**: Kakao OAuth and Google OAuth integration via Supabase Auth with route protection middleware.
- **Kakao Integration**: Kakao REST API integration ("나에게 보내기" - Send to Me) allowing hourly/customizable push alerts to your personal KakaoTalk chat.
- **Localization**: Full bilingual support (English & Korean) with `next-intl` throughout UI components and notifications.
- **State Management**: Reactive Zustand stores (`task-store` and `ui-store`) with optimistic local updates and Supabase realtime subscriptions.

---

## Key Pages & Feature Suite

```
withustodo/
├── /dashboard       # Analytics: 7-day completion chart, category distribution, streak counter, productivity score
├── /tasks           # Multi-view tasks (List, Kanban board, Spreadsheet table) + Slide-over detail editor
├── /calendar        # Monthly/weekly calendar views with priority indicators & day inspection
├── /categories      # Custom category manager with color swatches & reordering
├── /focus           # Pomodoro timer (25/5 cycles) linked to tasks, audio cues, and session history
├── /settings        # Profile, dark/light themes, Kakao test message button, quiet hours, data export (CSV/JSON)
├── /trash           # Soft-deleted task recovery bin with 30-day auto-purge policy
└── /login           # High-finish auth portal featuring Kakao (#FEE500) and Google login buttons
```

### 1. Multi-View Task Management (`/tasks`)
- **List View**: Grouped by status, priority, or category with drag-and-drop reordering.
- **Kanban Board**: Three columns (`Todo`, `In Progress`, `Done`) with cross-column drag and drop.
- **Table View**: Spreadsheet-like dense view with inline dropdowns for priority and status changes.
- **Slide-Over Detail Drawer**: Comprehensive task editor with inline editing for:
  - Title & description
  - Priority pills (High 🔴, Medium 🟡, Low 🔵, None ⚪)
  - Customizable reminder intervals (15m, 30m, 1h, 2h, 4h, 8h, daily, weekly)
  - Subtask checklists
  - Label tags & color dots
  - File attachments
  - Estimated vs actual time tracking
- **Bulk Action Bar**: Floating bottom bar when selecting multiple tasks (Complete, Delete, Move Category, Change Priority).

### 2. Pomodoro Focus Engine (`/focus`)
- Circular SVG timer display with smooth animation.
- Phase switching: 25-minute work cycles, 5-minute short breaks, 15-minute long breaks.
- Web Audio API notification chimes on interval completion.
- Time automatically logs to `time_entries` and updates the task's `actual_minutes`.

### 3. Analytics Dashboard (`/dashboard`)
- **Today's Summary**: Real-time counter of pending, completed, and overdue tasks with completion ring.
- **Weekly Completion Chart**: Recharts area graph tracking completion trends over the past 7 days.
- **Category Breakdown**: Recharts donut chart showing workload distribution.
- **Streak Tracker**: Consecutive day counter with visual flame state.
- **Productivity Score**: Weighted score based on completion rates, time tracked, and streak consistency.

### 4. Kakao Messaging & Background Scheduler
- **SQL Migration `001_initial_schema.sql`**: RLS-enforced PostgreSQL tables (`profiles`, `tasks`, `reminders`, `time_entries`, etc.).
- **SQL Migration `003_pg_cron_reminders.sql`**: Automated cron job checking due reminders and quiet hours.
- **Supabase Edge Function `send-kakao-reminder`**: Dispatches notifications directly to KakaoTalk using the user's stored access tokens.

---

## Verification & Validation Results

### 1. TypeScript Static Type Check
```bash
npx tsc --noEmit
# Result: Exit code 0 (0 errors across 76+ source files)
```

### 2. Next.js Production Build
```bash
npm run build
# Result: Compiled successfully, all 15 routes generated and optimized
```

### 3. Production Server Runtime Check
```bash
# Production server launched on port 3000
curl.exe -I http://localhost:3000/login
# HTTP/1.1 200 OK

curl.exe -I http://localhost:3000/
# HTTP/1.1 307 Temporary Redirect -> location: /login
```

---

## How to Test Locally

1. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local` and add your project credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   NEXT_PUBLIC_KAKAO_REST_API_KEY=your-kakao-rest-key
   NEXT_PUBLIC_KAKAO_REDIRECT_URI=http://localhost:3000/api/auth/callback
   KAKAO_ADMIN_KEY=your-kakao-admin-key
   ```

2. **Run Migrations in Supabase**:
   Execute the migration scripts in the Supabase SQL editor:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_seed_defaults.sql`
   - `supabase/migrations/003_pg_cron_reminders.sql`

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Test Key Interactions**:
   - Press **Cmd+K** / **Ctrl+K** anywhere to open the global Command Palette.
   - Click the **Language toggle** in the top navigation to switch between English and Korean.
   - Click the **Theme toggle** to switch between dark and light modes.
   - Switch between **List**, **Kanban**, and **Table** views on the `/tasks` page.
   - Run a 25-minute Pomodoro timer on `/focus` and review session records.
