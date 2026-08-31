import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const kakaoRestApiKey = Deno.env.get("KAKAO_REST_API_KEY")!;

interface WebhookPayload {
  type: 'INSERT';
  table: string;
  record: {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: string;
    task_id: string;
    created_at: string;
  };
  schema: 'public';
}

serve(async (req) => {
  try {
    const payload: WebhookPayload = await req.json();
    
    // Only process reminders
    if (payload.record.type !== 'reminder') {
      return new Response(JSON.stringify({ message: "Not a reminder, skipping." }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch user's kakao tokens
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('kakao_access_token, kakao_refresh_token, kakao_token_expires_at')
      .eq('id', payload.record.user_id)
      .single();

    if (profileError || !profile || !profile.kakao_access_token) {
      console.error("Missing Kakao tokens for user:", payload.record.user_id);
      await logReminder(supabase, payload.record.user_id, payload.record.task_id, 'failed', 'Missing Kakao tokens');
      return new Response(JSON.stringify({ error: "Missing Kakao tokens" }), { status: 400 });
    }

    let accessToken = profile.kakao_access_token;
    
    // Check if token is expired (giving a 5-minute buffer)
    const expiresAt = new Date(profile.kakao_token_expires_at);
    if (expiresAt.getTime() - 5 * 60 * 1000 < Date.now()) {
      // Refresh token
      const tokenUrl = "https://kauth.kakao.com/oauth/token";
      const params = new URLSearchParams();
      params.append('grant_type', 'refresh_token');
      params.append('client_id', kakaoRestApiKey);
      params.append('refresh_token', profile.kakao_refresh_token);

      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      });

      if (!tokenResponse.ok) {
        await logReminder(supabase, payload.record.user_id, payload.record.task_id, 'failed', 'Failed to refresh Kakao token');
        return new Response(JSON.stringify({ error: "Failed to refresh Kakao token" }), { status: 500 });
      }

      const tokenData = await tokenResponse.json();
      accessToken = tokenData.access_token;
      
      const newExpiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();
      const newRefreshToken = tokenData.refresh_token || profile.kakao_refresh_token;

      // Update tokens in DB
      await supabase
        .from('profiles')
        .update({
          kakao_access_token: accessToken,
          kakao_refresh_token: newRefreshToken,
          kakao_token_expires_at: newExpiresAt
        })
        .eq('id', payload.record.user_id);
    }

    // Send Kakao Message
    const kakaoUrl = "https://kapi.kakao.com/v2/api/talk/memo/default/send";
    const templateObject = {
      object_type: "text",
      text: `${payload.record.title}\n${payload.record.message}`,
      link: {
        web_url: "https://withus-todo.vercel.app",
        mobile_web_url: "https://withus-todo.vercel.app"
      },
      button_title: "View Task"
    };

    const kakaoParams = new URLSearchParams();
    kakaoParams.append('template_object', JSON.stringify(templateObject));

    const kakaoResponse = await fetch(kakaoUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: kakaoParams
    });

    if (!kakaoResponse.ok) {
      const errorData = await kakaoResponse.text();
      console.error("Kakao API Error:", errorData);
      await logReminder(supabase, payload.record.user_id, payload.record.task_id, 'failed', `Kakao API Error: ${errorData}`);
      return new Response(JSON.stringify({ error: "Failed to send message" }), { status: 500 });
    }

    await logReminder(supabase, payload.record.user_id, payload.record.task_id, 'sent', null);
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("Internal Error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
});

async function logReminder(supabase: any, userId: string, taskId: string, status: string, errorMessage: string | null) {
  await supabase.from('reminder_logs').insert({
    user_id: userId,
    task_id: taskId,
    channel: 'kakao',
    status: status,
    error_message: errorMessage
  });
}
