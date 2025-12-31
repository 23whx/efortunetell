/**
 * API: RAG 智能问答
 * POST /api/rag/chat
 * 所有用户可用
 */

import { NextRequest, NextResponse } from 'next/server';
import { ragQueryAnswer } from '@/lib/rag/search';

export async function POST(request: NextRequest) {
  try {
    const { question, language = 'zh', stream = false } = await request.json();
    
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
    
    // 非流式响应
    if (!stream) {
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
    
    const stream = new ReadableStream({
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
    
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
  } catch (error) {
    console.error('RAG chat error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process question',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

