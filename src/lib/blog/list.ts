import { createSupabasePublicClient } from '@/lib/supabase/server';

export interface ArticleListItem {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content_html: string;
  category: string | null;
  tags: string[];
  cover_image_url: string | null;
  cover_image_pos: { x: number; y: number; zoom: number } | null;
  created_at: string;
  author_display_name: string | null;
  author_avatar_url: string | null;
}

/**
 * Server-side fetch of the homepage article list (same filter as the client query in BlogList),
 * so the list is present in the HTML for search engines and AI crawlers.
 * content_html is reduced to a plain-text excerpt to keep the page payload small.
 */
export async function getPublishedArticles(): Promise<ArticleListItem[]> {
  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from('articles')
      .select('id,title,slug,summary,content_html,category,tags,cover_image_url,cover_image_pos,created_at,author_id')
      .eq('status', 'published')
      .not('tags', 'cs', '{"八字理论"}')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error || !data) {
      if (error) console.error('[blog] Failed to fetch articles:', error);
      return [];
    }

    const authorIds = Array.from(new Set(data.map((a) => a.author_id).filter(Boolean)));
    const authorMap = new Map<string, { display_name: string; avatar_url: string | null }>();
    if (authorIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id,display_name,avatar_url')
        .in('id', authorIds);
      (profiles || []).forEach((p) => {
        authorMap.set(p.id, { display_name: p.display_name || '', avatar_url: p.avatar_url || null });
      });
    }

    return data.map((a) => {
      const author = authorMap.get(a.author_id);
      return {
        id: a.id,
        title: a.title,
        slug: a.slug,
        summary: a.summary,
        content_html: (a.content_html || '').replace(/<[^>]*>/g, '').slice(0, 160),
        category: a.category,
        tags: a.tags || [],
        cover_image_url: a.cover_image_url,
        cover_image_pos: a.cover_image_pos ?? null,
        created_at: a.created_at,
        author_display_name: author?.display_name || null,
        author_avatar_url: author?.avatar_url || null,
      };
    });
  } catch (err) {
    console.error('[blog] Exception while fetching articles:', err);
    return [];
  }
}
