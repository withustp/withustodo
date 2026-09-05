import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Kakao Send Message API Route
 * Sends a self-memo message via Kakao Talk Open API
 * POST /api/kakao/send-message
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    // Fetch token from profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('kakao_access_token')
      .eq('id', user.id)
      .single();

    const token = profile?.kakao_access_token;

    if (!token) {
      return NextResponse.json({ 
        error: '카카오톡 연동 토큰이 없습니다. 카카오 계정으로 다시 로그인해주세요.' 
      }, { status: 400 });
    }

    const templateObject = {
      object_type: 'text',
      text: '🔔 [WithUs Todo] 카카오톡 연동 테스트 메시지입니다.\n오늘의 마감 일정과 스마트 알림이 정상적으로 연동되었습니다!',
      link: {
        web_url: 'https://withustodo.shop',
        mobile_web_url: 'https://withustodo.shop',
      },
      button_title: 'WithUs Todo 열기'
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

    if (response.ok && data.result_code === 0) {
      return NextResponse.json({ success: true, data });
    } else {
      console.error('Kakao API Error Response:', data);
      return NextResponse.json({ 
        error: data.msg || '카카오 메시지 전송 실패',
        code: data.code,
        details: data
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Kakao Send Error:', error);
    return NextResponse.json({ error: '서버 내부 오류가 발생했습니다.' }, { status: 500 });
  }
}
