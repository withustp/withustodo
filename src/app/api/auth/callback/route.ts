import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Supabase OAuth Callback Handler
 * Exchanges code for session and persists OAuth provider token (Kakao access token)
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.session) {
      // If signed in with Kakao, store provider token
      if (data.session.provider_token) {
        await supabase
          .from('profiles')
          .update({
            kakao_access_token: data.session.provider_token,
            kakao_refresh_token: data.session.provider_refresh_token || null,
          })
          .eq('id', data.session.user.id);
      }
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL('/login?error=true', requestUrl.origin));
}
