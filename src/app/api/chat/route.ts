import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';

export interface ChatAction {
  type: 'created' | 'updated' | 'deleted';
  task?: any;
  taskId?: string;
  summary: string;
}

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'create_task',
      description: '사용자의 요청에 따라 새로운 할 일/과제/일정을 데이터베이스에 직접 생성합니다.',
      parameters: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: '할 일 제목 (예: "수학 수행평가 보고서 작성", "영어 단어 50개 암기")',
          },
          due_date: {
            type: 'string',
            description: '마감일 (YYYY-MM-DD 또는 ISO 형식. 예: "2026-09-06", "2026-09-07T15:00:00")',
          },
          priority: {
            type: 'string',
            enum: ['high', 'medium', 'low', 'none'],
            description: '우선순위 (high: 높음/긴급, medium: 보통, low: 낮음)',
          },
          category_name: {
            type: 'string',
            description: '매칭할 카테고리 이름 (예: 공부, 과제, 시험, 업무, 개인 등)',
          },
          description: {
            type: 'string',
            description: '상세 설명, 세부 목표 또는 실천 메모',
          },
        },
        required: ['title'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_task_status',
      description: '기존 할 일의 진행 상태나 완료 여부를 데이터베이스에서 업데이트합니다.',
      parameters: {
        type: 'object',
        properties: {
          task_id: {
            type: 'string',
            description: '수정할 대상 할 일의 ID (DB 목록의 id)',
          },
          status: {
            type: 'string',
            enum: ['todo', 'in_progress', 'done'],
            description: '변경할 목표 상태 (done: 완료, in_progress: 진행 중, todo: 할 일)',
          },
        },
        required: ['task_id', 'status'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_task',
      description: '기존 할 일을 데이터베이스에서 삭제(휴지통 이동) 처리합니다.',
      parameters: {
        type: 'object',
        properties: {
          task_id: {
            type: 'string',
            description: '삭제할 대상 할 일의 ID',
          },
        },
        required: ['task_id'],
      },
    },
  },
];

/**
 * Enterprise AI Todo Copilot Chat API with Function Calling
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
        actions: [],
      });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    // 1. Fetch live database tasks & categories
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, title, status, priority, due_date, description, category:categories(id, name, color)')
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .order('due_date', { ascending: true, nullsFirst: false });

    const { data: categories } = await supabase
      .from('categories')
      .select('id, name, color')
      .eq('user_id', user.id);

    const nowStr = format(new Date(), 'yyyy년 MM월 dd일 (EEEE) HH:mm');

    const tasksSummary = (tasks || []).map((t, idx) => {
      const due = t.due_date ? format(new Date(t.due_date), 'yyyy-MM-dd HH:mm') : '마감일 없음';
      return `${idx + 1}. [ID: ${t.id}] 제목: "${t.title}" | 상태: ${t.status} | 우선순위: ${t.priority} | 마감일: ${due} | 카테고리: ${(t.category as any)?.name || '미분류'}${t.description ? ` | 메모: ${t.description}` : ''}`;
    }).join('\n');

    const categoriesSummary = (categories || []).map(c => `"${c.name}"(ID: ${c.id})`).join(', ');

    const systemPrompt = `당신은 WithUs Todo의 최고 수준 생산성 AI 코파일럿(Copilot) 비서입니다. 🤖✨
사용자의 실시간 할 일, 마감일, 공부 일정, 시험/과제 계획을 완벽하게 파악하고 직접 관리할 수 있는 강력한 액션 도구(Function Calling)를 갖추고 있습니다.

[현재 기준 시간]
${nowStr}

[사용자의 실제 등록된 실시간 DB 할 일 목록]
${tasksSummary || '현재 등록된 할 일이 없습니다.'}

[사용자의 카테고리 목록]
${categoriesSummary || '기본 카테고리'}

[행동 지침]
1. **할 일 추가 요청 (예: "~ 추가해줘", "~ 숙제 등록해줘", "~ 계획 세워줘")**:
   - 직접 \`create_task\` 도구를 호출하여 DB에 생성하세요.
   - 마감일 언급이 있으면 기준 시간을 바탕으로 정확한 YYYY-MM-DD(또는 ISO) 날짜를 계산해 전달하세요 (예: "내일" -> 1일 뒤, "이번 주 금요일" -> 해당 금요일).
   - 적절한 카테고리(공부, 시험, 업무, 일상 등)와 우선순위를 지정하세요.
2. **할 일 완료 및 상태 변경 요청 (예: "~ 다 했어", "~ 완료 처리해줘")**:
   - DB 목록에서 해당 제목과 가장 일치하는 Task ID를 찾아 \`update_task_status\` 도구를 호출하세요.
3. **할 일 삭제 요청 (예: "~ 지워줘", "~ 삭제해줘")**:
   - 해당 Task ID를 찾아 \`delete_task\` 도구를 호출하세요.
4. **일정 브리핑 및 추천 (예: "나 오늘 뭐부터 해?", "일정 브리핑해줘")**:
   - 마감일이 임박하고 우선순위가 높은 과제를 1순위로 선별하여 2~3단계의 실천 팁과 뽀모도로(25분 집중법) 조언을 함께 제공하세요.
5. 친절하고 동기부여가 되는 말투로 깔끔한 마크다운(글머리 기호, 굵은 글씨, 이모지)으로 답변하세요.`;

    const requestMessages: any[] = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    // 2. First call to OpenAI with Tool Calling
    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: requestMessages,
        tools: TOOLS,
        tool_choice: 'auto',
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    const responseData = await openAiResponse.json();

    if (!openAiResponse.ok) {
      console.error('OpenAI Error:', responseData);
      return NextResponse.json({
        role: 'assistant',
        content: `⚠️ AI 응답 생성 중 오류가 발생했습니다: ${responseData.error?.message || 'OpenAI 호출 실패'}`,
        actions: [],
      });
    }

    const choice = responseData.choices?.[0];
    const message = choice?.message;
    const actions: ChatAction[] = [];

    // 3. Handle Tool Calls if triggered
    if (message?.tool_calls && message.tool_calls.length > 0) {
      const toolMessages: any[] = [message];

      for (const toolCall of message.tool_calls) {
        const fnName = toolCall.function.name;
        let args: any = {};
        try {
          args = JSON.parse(toolCall.function.arguments);
        } catch (e) {
          args = {};
        }

        if (fnName === 'create_task') {
          // Find matching category ID
          let categoryId: string | null = null;
          if (args.category_name && categories) {
            const matched = categories.find(c =>
              c.name.toLowerCase().includes(args.category_name.toLowerCase()) ||
              args.category_name.toLowerCase().includes(c.name.toLowerCase())
            );
            if (matched) categoryId = matched.id;
          }

          const { data: newTask, error } = await supabase
            .from('tasks')
            .insert([{
              user_id: user.id,
              title: args.title,
              due_date: args.due_date || null,
              priority: args.priority || 'medium',
              category_id: categoryId,
              description: args.description || null,
              status: 'todo',
              is_deleted: false,
            }])
            .select('*, category:categories(*)')
            .single();

          if (!error && newTask) {
            actions.push({
              type: 'created',
              task: newTask,
              summary: `"${args.title}" 할 일이 생성되었습니다.`,
            });
            toolMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify({ success: true, task: newTask }),
            });
          } else {
            toolMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify({ success: false, error: error?.message }),
            });
          }
        } else if (fnName === 'update_task_status') {
          const { data: updatedTask, error } = await supabase
            .from('tasks')
            .update({
              status: args.status,
              completed_at: args.status === 'done' ? new Date().toISOString() : null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', args.task_id)
            .eq('user_id', user.id)
            .select('*, category:categories(*)')
            .single();

          if (!error && updatedTask) {
            actions.push({
              type: 'updated',
              task: updatedTask,
              taskId: args.task_id,
              summary: `"${updatedTask.title}" 상태가 변경되었습니다.`,
            });
            toolMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify({ success: true, task: updatedTask }),
            });
          } else {
            toolMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify({ success: false, error: error?.message }),
            });
          }
        } else if (fnName === 'delete_task') {
          const { error } = await supabase
            .from('tasks')
            .update({
              is_deleted: true,
              deleted_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', args.task_id)
            .eq('user_id', user.id);

          if (!error) {
            actions.push({
              type: 'deleted',
              taskId: args.task_id,
              summary: '할 일이 삭제되었습니다.',
            });
            toolMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify({ success: true }),
            });
          } else {
            toolMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify({ success: false, error: error?.message }),
            });
          }
        }
      }

      // 4. Second call to OpenAI with tool execution results for concluding response
      const secondResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [...requestMessages, ...toolMessages],
          temperature: 0.7,
          max_tokens: 800,
        }),
      });

      const secondData = await secondResponse.json();
      const finalReply = secondData.choices?.[0]?.message?.content || '작업이 완료되었습니다.';

      return NextResponse.json({
        role: 'assistant',
        content: finalReply,
        actions,
      });
    }

    // Direct text response
    const reply = message?.content || '답변을 생성하지 못했습니다.';
    return NextResponse.json({
      role: 'assistant',
      content: reply,
      actions: [],
    });

  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json({
      role: 'assistant',
      content: '⚠️ 서버 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      actions: [],
    }, { status: 500 });
  }
}

