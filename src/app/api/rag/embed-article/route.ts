/**
 * API: 向量化单篇文章
 * POST /api/rag/embed-article
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
    
    // 获取请求参数
    const { article_id } = await request.json();
    
    if (!article_id) {
      return NextResponse.json(
        { error: 'article_id is required' },
        { status: 400 }
      );
    }
    
    // 获取文章内容
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('id, title, content_html, category, tags')
      .eq('id', article_id)
      .single();
    
    if (articleError || !article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }
    
    // 生成嵌入
    const embeddings = await embedArticle({
      id: article.id,
      title: article.title,
      content: article.content_html,
      category: article.category,
      tags: article.tags || [],
    });
    
    // 先删除该文章的旧嵌入
    await supabase
      .from('article_embeddings')
      .delete()
      .eq('article_id', article_id);
    
    // 插入新嵌入
    const { error: insertError } = await supabase
      .from('article_embeddings')
      .insert(
        embeddings.map(item => ({
          article_id: article_id,
          content: item.content,
          embedding: item.embedding,
          metadata: item.metadata,
        }))
      );
    
    if (insertError) {
      throw insertError;
    }
    
    return NextResponse.json({
      success: true,
      article_id,
      chunks_count: embeddings.length,
      message: `Successfully embedded article "${article.title}" into ${embeddings.length} chunks`,
    });
    
  } catch (error) {
    console.error('Embed article error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to embed article',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

