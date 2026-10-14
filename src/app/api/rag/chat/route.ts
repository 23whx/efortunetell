/**
 * API: RAG 智能问答
 * POST /api/rag/chat
 * 仅登录用户可用，受每日 AI 调用限额约束
 */

import { NextRequest, NextResponse } from 'next/server';
import { ragQueryAnswer } from '@/lib/rag/search';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { consumeAiQuota, quotaExceededResponse } from '@/lib/ai/quota';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { question, language = 'zh', stream: useStream = false } = await request.json();
    
    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required and must be a string' },
        { status: 400 }
      );
    }
    
    if (question.length > 500) {
      return NextResponse.json(
        { error: 'Question is too long (max 500 characters)' },
        { status: 400 }
      );
    }
    
    if (!(await consumeAiQuota(supabase))) {
      return quotaExceededResponse();
    }

    // 非流式响应
    if (!useStream) {
      const result = await ragQueryAnswer(question, {
        language,
        matchThreshold: 0.7,
        matchCount: 5,
        temperature: 0.7,
      });
      
      return NextResponse.json({
        success: true,
        answer: result.answer,
        sources: result.sources.map(source => ({
          title: source.metadata.title,
          content: source.content,
          category: source.metadata.category,
          similarity: source.similarity,
        })),
        usage: result.usage,
      });
    }
    
    // 流式响应
    const { ragQueryAnswerStream } = await import('@/lib/rag/search');
    const encoder = new TextEncoder();
    
    const responseStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of ragQueryAnswerStream(question, {
            language,
            matchThreshold: 0.7,
            matchCount: 5,
            temperature: 0.7,
          })) {
            const data = `data: ${JSON.stringify(chunk)}\n\n`;
            controller.enqueue(encoder.encode(data));
          }
          
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });
    
    return new NextResponse(responseStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
  } catch (error) {
    console.error('RAG chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process question' },
      { status: 500 }
    );
  }
}

