/**
 * 自动向量化工具
 * 当文章发布或更新时，自动更新向量库
 */

import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

/**
 * 触发文章向量化
 * @param articleId 文章ID
 * @returns 是否成功
 */
export async function triggerArticleEmbedding(articleId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/rag/embed-article', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ articleId }),
    });
    
    if (!response.ok) {
      console.error('Failed to embed article:', await response.text());
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error triggering article embedding:', error);
    return false;
  }
}

/**
 * 批量向量化所有文章（管理员使用）
 * @returns 成功向量化的文章数量
 */
export async function embedAllArticles(): Promise<number> {
  try {
    const supabase = createSupabaseBrowserClient();
    
    // 获取所有已发布的文章
    const { data: articles, error } = await supabase
      .from('articles')
      .select('id')
      .eq('status', 'published');
    
    if (error || !articles) {
      console.error('Failed to fetch articles:', error);
      return 0;
    }
    
    let successCount = 0;
    
    // 逐个向量化
    for (const article of articles) {
      const success = await triggerArticleEmbedding(article.id);
      if (success) {
        successCount++;
      }
      
      // 避免请求过快，等待一下
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return successCount;
  } catch (error) {
    console.error('Error embedding all articles:', error);
    return 0;
  }
}

/**
 * 检查文章是否需要重新向量化
 * @param articleId 文章ID
 * @returns 是否需要重新向量化
 */
export async function needsReEmbedding(articleId: string): Promise<boolean> {
  try {
    const supabase = createSupabaseBrowserClient();
    
    // 获取文章最后更新时间
    const { data: article } = await supabase
      .from('articles')
      .select('updated_at')
      .eq('id', articleId)
      .single();
    
    if (!article) return true;
    
    // 获取向量最后更新时间
    const { data: embedding } = await supabase
      .from('article_embeddings')
      .select('created_at')
      .eq('article_id', articleId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (!embedding) return true;
    
    // 如果文章更新时间晚于向量更新时间，需要重新向量化
    return new Date(article.updated_at) > new Date(embedding.created_at);
  } catch (error) {
    console.error('Error checking re-embedding need:', error);
    return true; // 出错时默认需要重新向量化
  }
}

/**
 * 清除文章的旧向量数据
 * @param articleId 文章ID
 * @returns 是否成功
 */
export async function clearArticleEmbeddings(articleId: string): Promise<boolean> {
  try {
    const supabase = createSupabaseBrowserClient();
    
    const { error } = await supabase
      .from('article_embeddings')
      .delete()
      .eq('article_id', articleId);
    
    if (error) {
      console.error('Failed to clear embeddings:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error clearing article embeddings:', error);
    return false;
  }
}

