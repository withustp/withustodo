import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface WebhookPayload {
  type: 'UPDATE';
  table: string;
  record: {
    id: string;
    user_id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    category_id: string;
    due_date: string | null;
    is_recurring: boolean;
    estimated_minutes: number;
    sort_order: number;
    completed_at: string | null;
  };
  old_record: {
    status: string;
  };
  schema: 'public';
}

serve(async (req) => {
  try {
    const payload: WebhookPayload = await req.json();

    // Only process if status changed to 'done' and task is recurring
    if (
      payload.record.status !== 'done' || 
      payload.old_record.status === 'done' || 
      !payload.record.is_recurring
    ) {
      return new Response(JSON.stringify({ message: "No action required." }), { status: 200 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch recurring pattern
    const { data: pattern, error: patternError } = await supabase
      .from('recurring_patterns')
      .select('*')
      .eq('task_id', payload.record.id)
      .single();

    if (patternError || !pattern) {
      console.error("Failed to fetch pattern:", patternError);
      return new Response(JSON.stringify({ error: "Pattern not found" }), { status: 404 });
    }

    // Calculate next due date
    let nextDueDate: Date | null = null;
    const baseDate = payload.record.due_date ? new Date(payload.record.due_date) : new Date();

    if (pattern.type === 'daily') {
      baseDate.setDate(baseDate.getDate() + pattern.interval_value);
      nextDueDate = baseDate;
    } else if (pattern.type === 'weekly') {
      baseDate.setDate(baseDate.getDate() + (pattern.interval_value * 7));
      nextDueDate = baseDate;
    } else if (pattern.type === 'monthly') {
      baseDate.setMonth(baseDate.getMonth() + pattern.interval_value);
      nextDueDate = baseDate;
    }

    // Check end date
    if (pattern.end_date && nextDueDate && nextDueDate > new Date(pattern.end_date)) {
      return new Response(JSON.stringify({ message: "Recurring series ended." }), { status: 200 });
    }

    // Create the next task
    const { data: newTask, error: createError } = await supabase
      .from('tasks')
      .insert({
        user_id: payload.record.user_id,
        title: payload.record.title,
        description: payload.record.description,
        status: 'todo',
        priority: payload.record.priority,
        category_id: payload.record.category_id,
        due_date: nextDueDate ? nextDueDate.toISOString() : null,
        is_recurring: true,
        estimated_minutes: payload.record.estimated_minutes,
        sort_order: payload.record.sort_order,
      })
      .select()
      .single();

    if (createError || !newTask) {
      console.error("Failed to create next task:", createError);
      return new Response(JSON.stringify({ error: "Failed to create task" }), { status: 500 });
    }

    // Update the recurring pattern to point to the new task
    // It's a 1-to-1 relationship, so we reassign the task_id
    const { error: updatePatternError } = await supabase
      .from('recurring_patterns')
      .update({ task_id: newTask.id })
      .eq('id', pattern.id);

    if (updatePatternError) {
      console.error("Failed to update pattern:", updatePatternError);
    }

    // Reset is_recurring for the completed task as it's no longer the active recurring one
    await supabase
      .from('tasks')
      .update({ is_recurring: false })
      .eq('id', payload.record.id);

    return new Response(JSON.stringify({ success: true, nextTaskId: newTask.id }), { status: 200 });
    
  } catch (err) {
    console.error("Internal Error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
});
