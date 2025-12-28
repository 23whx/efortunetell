import Link from 'next/link';
import { Metadata } from 'next';
import { PILLARS } from '@/lib/seo/pillars';

export const metadata: Metadata = {
  title: '专题',
  description: '八字 / 阴盘奇门 / 大六壬 / 风水 / 起名 专题文章与学习路线。',
  alternates: { canonical: 'https://efortunetell.blog/services' },
  openGraph: {
    title: '专题 | Rolley Divination Blog',
    description: '八字 / 阴盘奇门 / 大六壬 / 风水 / 起名 专题文章与学习路线。',
    url: 'https://efortunetell.blog/services',
    type: 'website',
    images: [{ url: '/icon.png', width: 512, height: 512, alt: 'Rolley Divination Blog' }],
  },
};

export default function ServicesIndexPage() {
  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-28 pb-20">
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight">
            专题 <span className="text-[#FF6F61]">Pillar Pages</span>
          </h1>
          <p className="mt-4 text-gray-500 font-medium leading-relaxed">
            按主题聚合：每个专题页汇总相关文章、核心概念与学习路线（对搜索引擎也更友好）。
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PILLARS.map((p) => (
            <Link
              key={p.key}
              href={`/services/${p.slug}`}
              className="group bg-white rounded-[32px] border border-gray-100 p-8 hover:shadow-2xl hover:shadow-gray-200/40 transition-all duration-500 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
                    {p.enTitle}
                  </div>
                  <div className="mt-2 text-3xl font-black text-gray-900 group-hover:text-[#FF6F61] transition-colors">
                    {p.zhTitle}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#FF6F61]/10 flex items-center justify-center text-[#FF6F61] font-black">
                  →
                </div>
              </div>

              <p className="mt-6 text-sm text-gray-500 leading-relaxed font-medium">
                {p.zhDesc}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {p.keywords.slice(0, 4).map((k) => (
                  <span
                    key={k}
                    className="px-3 py-1.5 rounded-full bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest border border-gray-100"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}


