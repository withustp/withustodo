import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';

/**
 * AI Todo Assistant Chat API powered by gpt-4o-mini
 * POST /api/chat
 */
export async function POST(request: Request) {
  try {
    const { messages } = await request.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        role: 'assistant',
        content: '⚠️ **OpenAI API Key가 설정되지 않았습니다.**\n\nNetlify 환경변수 또는 `.env.local`에 `OPENAI_API_KEY`를 추가해주시면 즉시 스마트 AI 챗봇이 활성화됩니다!\n\n궁금한 작업이 있다면 언제든 물어보세요!',
      });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    // 1. Fetch user's live database tasks
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, title, status, priority, due_date, description, category:categories(name, color)')
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .order('due_date', { ascending: true, nullsFirst: false });

    // 2. Fetch categories
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name, color')
      .eq('user_id', user.id);

    const nowStr = format(new Date(), 'yyyy년 MM월 dd일 (EEEE) HH:mm');

    const tasksSummary = (tasks || []).map((t, idx) => {
      const due = t.due_date ? format(new Date(t.due_date), 'yyyy-MM-dd') : '마감일 없음';
      return `${idx + 1}. [${t.title}] | 상태: ${t.status} | 우선순위: ${t.priority} | 마감일: ${due} | 카테고리: ${t.category?.name || '미분류'}${t.description ? ` | 메모: ${t.description}` : ''}`;
    }).join('\n');

    const categoriesSummary = (categories || []).map(c => c.name).join(', ');

    const systemPrompt = `당신은 WithUs Todo의 스마트 AI 생산성 코파일럿(Copilot) 비서입니다.
사용자의 실시간 할 일, 마감일, 공부 일정, 시험/발표 일정을 완벽히 파악하여 친절하고 명쾌하며 실행 가능한 조언을 제공합니다.

[현재 기준 시간]
${nowStr}

[사용자의 실제 등록된 할 일 목록 (DB 실시간)]
${tasksSummary || '현재 등록된 할 일이 없습니다.'}

[사용자의 카테고리 목록]
${categoriesSummary || '기본 카테고리'}

[답변 원칙]
1. 사용자가 "나 뭐해야 해?", "오늘 뭐부터 할까?", "일정 브리핑해줘" 등을 물어보면:
   - 마감일이 가장 임박한 작업과 우선순위(high > medium > low)를 분석하여 **1순위로 지금 당장 시작해야 할 작업**을 명확히 짚어주세요.
   - 친절하고 동기부여가 되는 말투로 2~3단계 실행 가이드나 뽀모도로(25분 집중) 팁을 제안하세요.
2. 사용자가 새로운 할 일 추가를 요청하면(예: "내일 모레까지 과학 숙제 등록해줘"):
   - 등록할 작업 제목, 추천 마감일, 추천 우선순위를 마크다운 카드 형식으로 예쁘게 정리해서 안내하세요.
3. 한국어로 자연스럽고 깔끔한 마크다운(글머리 기호, 굵은 글씨, 이모지)으로 가독성 높게 답변하세요.
4. 답변은 간결하고 핵심 위주로, 사용자가 바로 실천할 수 있도록 구성하세요.`;

    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    const data = await openAiResponse.json();

    if (!openAiResponse.ok) {
      console.error('OpenAI Error:', data);
      return NextResponse.json({
        role: 'assistant',
        content: `⚠️ AI 응답 생성 중 오류가 발생했습니다: ${data.error?.message || 'OpenAI 호출 실패'}`,
      });
    }

    const reply = data.choices?.[0]?.message?.content || '답변을 생성하지 못했습니다.';
    return NextResponse.json({ role: 'assistant', content: reply });

  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json({
      role: 'assistant',
      content: '⚠️ 서버 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    }, { status: 500 });
  }
}
