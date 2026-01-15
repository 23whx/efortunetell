/**
 * API: 向量化所有已发布文章
 * POST /api/rag/embed-all
 * 仅管理员可用
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { embedArticle } from '@/lib/rag/embeddings';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // 验证用户身份
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // 验证管理员权限
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin only' },
        { status: 403 }
      );
    }
    
    // 获取所有已发布文章，排除"杂谈"类型
    const { data: articles, error: fetchError } = await supabase
      .from('articles')
      .select('id, title, content_html, category, tags')
      .eq('status', 'published')
      .neq('category', '杂谈');
    
    if (fetchError) {
      throw fetchError;
    }
    
    if (!articles || articles.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No published articles to embed (excluding "杂谈" category)',
        embedded_count: 0,
      });
    }
    
    // 先清空所有旧嵌入
    await supabase.from('article_embeddings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    let successCount = 0;
    let totalChunks = 0;
    const errors: Array<{ article_id: string; error: string }> = [];
    
    // 逐个向量化文章
    for (const article of articles) {
      try {
        const embeddings = await embedArticle({
          id: article.id,
          title: article.title,
          content: article.content_html,
          category: article.category,
          tags: article.tags || [],
        });
        
        const { error: insertError } = await supabase
          .from('article_embeddings')
          .insert(
            embeddings.map(item => ({
              article_id: article.id,
              content: item.content,
              embedding: item.embedding,
              metadata: item.metadata,
            }))
          );
        
        if (insertError) {
          throw insertError;
        }
        
        successCount++;
        totalChunks += embeddings.length;
        
        // 添加延迟避免 API 限流
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`Failed to embed article ${article.id}:`, error);
        errors.push({
          article_id: article.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      total_articles: articles.length,
      embedded_count: successCount,
      total_chunks: totalChunks,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully embedded ${successCount}/${articles.length} articles into ${totalChunks} chunks (excluding "杂谈" category)`,
    });
    
  } catch (error) {
    console.error('Embed all articles error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to embed articles',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

