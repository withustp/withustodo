-- Function to check and process due reminders
-- This checks tasks that have a reminder_interval set and
-- calculates if enough time has passed since last_reminded_at
CREATE OR REPLACE FUNCTION public.process_due_reminders()
RETURNS void AS $$
DECLARE
  r RECORD;
  interval_duration INTERVAL;
BEGIN
  FOR r IN
    SELECT t.id AS task_id, t.title, t.priority, t.due_date, t.reminder_interval,
           t.user_id, p.kakao_access_token, p.kakao_refresh_token, p.kakao_token_expires_at,
           us.quiet_hours_start, us.quiet_hours_end
    FROM public.tasks t
    JOIN public.profiles p ON p.id = t.user_id
    LEFT JOIN public.user_settings us ON us.user_id = t.user_id
    WHERE t.reminder_interval IS NOT NULL
      AND t.is_deleted = FALSE
      AND t.status != 'done'
      AND (
        t.last_reminded_at IS NULL
        OR (
          CASE t.reminder_interval
            WHEN '15min' THEN t.last_reminded_at + INTERVAL '15 minutes'
            WHEN '30min' THEN t.last_reminded_at + INTERVAL '30 minutes'
            WHEN '1hr' THEN t.last_reminded_at + INTERVAL '1 hour'
            WHEN '2hr' THEN t.last_reminded_at + INTERVAL '2 hours'
            WHEN '4hr' THEN t.last_reminded_at + INTERVAL '4 hours'
            WHEN '8hr' THEN t.last_reminded_at + INTERVAL '8 hours'
            WHEN 'daily' THEN t.last_reminded_at + INTERVAL '1 day'
            WHEN 'weekly' THEN t.last_reminded_at + INTERVAL '1 week'
          END
        ) <= NOW()
      )
  LOOP
    -- Check quiet hours
    IF r.quiet_hours_start IS NOT NULL AND r.quiet_hours_end IS NOT NULL THEN
      IF LOCALTIME BETWEEN r.quiet_hours_start AND r.quiet_hours_end THEN
        -- Skip this reminder during quiet hours
        INSERT INTO public.reminder_logs (user_id, task_id, channel, status, error_message)
        VALUES (r.user_id, r.task_id, 'kakao', 'skipped', 'Quiet hours');
        CONTINUE;
      END IF;
    END IF;

    -- Create in-app notification
    INSERT INTO public.notifications (user_id, title, message, type, task_id)
    VALUES (
      r.user_id,
      '📌 Reminder: ' || r.title,
      CASE r.priority
        WHEN 'high' THEN '🔴 High priority task needs your attention!'
        WHEN 'medium' THEN '🟡 Don''t forget about this task.'
        ELSE '📥 Time to check on this task.'
      END,
      'reminder',
      r.task_id
    );

    -- Update last_reminded_at
    UPDATE public.tasks SET last_reminded_at = NOW() WHERE id = r.task_id;

    -- Note: Kakao message sending is handled by the Edge Function
    -- which is invoked via Supabase webhook on notification insert
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule the reminder check every minute via pg_cron
-- Note: pg_cron must be enabled in Supabase dashboard first
-- SELECT cron.schedule('process-reminders', '* * * * *', 'SELECT public.process_due_reminders()');
-- ^ Uncomment this after enabling pg_cron in Supabase settings
