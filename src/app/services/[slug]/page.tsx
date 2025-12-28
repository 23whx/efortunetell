import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Script from 'next/script';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getPillarBySlug } from '@/lib/seo/pillars';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pillar = getPillarBySlug(slug);
  if (!pillar) return { title: '专题不存在' };

  const canonical = `https://efortunetell.blog/services/${pillar.slug}`;
  return {
    title: `${pillar.zhTitle} 专题`,
    description: pillar.zhDesc,
    keywords: pillar.keywords,
    alternates: { canonical },
    openGraph: {
      title: `${pillar.zhTitle} | ${pillar.enTitle}`,
      description: pillar.zhDesc,
      url: canonical,
      type: 'website',
      images: [{ url: '/icon.png', width: 512, height: 512, alt: 'Rolley Divination Blog' }],
    },
  };
}

export default async function PillarPage({ params }: Props) {
  const { slug } = await params;
  const pillar = getPillarBySlug(slug);
  if (!pillar) return notFound();

  const supabase = await createSupabaseServerClient();
  const { data: articles } = await supabase
    .from('articles')
    .select('id,title,summary,created_at,tags,cover_image_url')
    .eq('status', 'published')
    .eq('category', pillar.category)
    .order('created_at', { ascending: false })
    .limit(50);

  const canonical = `https://efortunetell.blog/services/${pillar.slug}`;
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${pillar.zhTitle} 专题`,
    description: pillar.zhDesc,
    url: canonical,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Rolley Divination Blog',
      url: 'https://efortunetell.blog',
    },
  };

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <Script id={`pillar-ld-${pillar.slug}`} type="application/ld+json">
        {JSON.stringify(ld)}
      </Script>

      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-28 pb-20">
        <div className="mb-10">
          <div className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
            {pillar.enTitle}
          </div>
          <h1 className="mt-2 text-4xl md:text-6xl font-black text-gray-900 tracking-tight">
            {pillar.zhTitle}
          </h1>
          <p className="mt-4 text-gray-500 font-medium leading-relaxed max-w-3xl">
            {pillar.zhDesc}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {pillar.keywords.map((k) => (
              <span
                key={k}
                className="px-3 py-1.5 rounded-full bg-white text-gray-500 text-[10px] font-black uppercase tracking-widest border border-gray-100"
              >
                {k}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <h2 className="text-xl font-black text-gray-900">最新文章</h2>
          <Link
            href="/blog"
            className="text-sm font-black text-[#FF6F61] hover:text-[#ff8a75] transition-colors"
          >
            查看全部博客 →
          </Link>
        </div>

        {(articles || []).length === 0 ? (
          <div className="bg-white rounded-[32px] border border-dashed border-gray-200 p-10 text-center">
            <p className="text-gray-500 font-bold">这个专题暂时还没有文章。</p>
            <p className="mt-2 text-sm text-gray-400 font-medium">
              你可以先去 <Link href="/blog" className="text-[#FF6F61] font-black">博客</Link> 看其它内容，或在后台发布第一篇。
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(articles || []).map((a) => (
              <Link
                key={a.id}
                href={`/blog/${a.id}`}
                className="group bg-white rounded-[32px] border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-gray-200/40 transition-all duration-500"
              >
                <div className="relative aspect-[16/10] bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.cover_image_url || '/images/default-image.svg'}
                    alt={a.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                <div className="p-6">
                  <div className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
                    {new Date(a.created_at).toLocaleDateString()}
                  </div>
                  <div className="mt-2 text-xl font-black text-gray-900 group-hover:text-[#FF6F61] transition-colors line-clamp-2">
                    {a.title}
                  </div>
                  <p className="mt-3 text-sm text-gray-500 leading-relaxed line-clamp-3">
                    {a.summary || ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


