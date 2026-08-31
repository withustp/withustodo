import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Kakao Send Message API Route
 * POST /api/kakao/send-message
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Fetch token from profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('kakao_access_token')
    .eq('id', user.id)
    .single();

  const token = profile?.kakao_access_token;

  if (!token) {
    return new NextResponse('Kakao not connected', { status: 400 });
  }

  try {
    const templateObject = {
      object_type: 'text',
      text: 'Test message from WithUs Todo!',
      link: {
        web_url: 'https://withustodo.com',
        mobile_web_url: 'https://withustodo.com',
      },
      button_title: 'Open App'
    };

    const response = await fetch('https://kapi.kakao.com/v2/api/talk/memo/default/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `template_object=${encodeURIComponent(JSON.stringify(templateObject))}`
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({ success: true, data });
    } else {
      console.error('Kakao API Error:', data);
      return new NextResponse('Failed to send Kakao message', { status: response.status });
    }
  } catch (error) {
    console.error('Kakao API Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
