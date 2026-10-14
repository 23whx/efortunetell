/**
 * Articles are written in one language but served under every UI locale.
 * The canonical URL uses the content language: Chinese if the title has CJK characters, else English.
 */
export function articleContentLocale(title: string | null | undefined): 'zh' | 'en' {
  return /[\u4e00-\u9fff]/.test(title || '') ? 'zh' : 'en';
}

/** Article URL path (without locale): the human-readable slug, falling back to the id. */
export function articlePath(article: { slug?: string | null; id: string }): string {
  return `/blog/${encodeURIComponent(article.slug || article.id)}`;
}
