import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { collectJieQiPoints, formatLocal } from '@/lib/paipan/calendar';
import { YANG_DUN_JU, YIN_DUN_JU } from '@/lib/paipan/qimen/constants';
import { YUE_JIANG_NAME, ZHONGQI_TO_YJ } from '@/lib/paipan/daliuren/constants';
import { createSupabasePublicClient } from '@/lib/supabase/server';
import { articlePath } from '@/lib/blog/locale';
import { absoluteUrl } from '@/lib/i18n/seo';
import { WEBSITE_ID, jsonLd } from '@/lib/site';
import {
  CHANG_SHENG_MEANING,
  DI_ZHI_TERMS,
  JIE_QI_TERMS,
  NAYIN_MEANING,
  SHI_SHEN_TERMS,
  TERM_CATEGORIES,
  TIAN_GAN_TERMS,
  categoryOf,
  isTermCategory,
  jiaZiInfo,
  termPath,
  type TermCategory,
} from '@/lib/glossary';
import TermPageEn, { headlineEn } from '@/components/glossary/TermPageEn';

// Terms are written in Chinese; every other locale redirects to /zh
export const revalidate = 86400;

type Props = { params: Promise<{ locale: string; category: string; name: string }> };

export function generateStaticParams() {
  return (Object.keys(TERM_CATEGORIES) as TermCategory[]).flatMap((category) =>
    TERM_CATEGORIES[category].names.flatMap((name) => [{ locale: 'zh', category, name }, { locale: 'en', category, name }])
  );
}

function decode(v: string): string {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

function headline(category: TermCategory, name: string): { title: string; description: string } | null | undefined {
  switch (category) {
    case 'tiangan': {
      const t = TIAN_GAN_TERMS.find((x) => x.name === name);
      return t && { title: `天干${name}：${t.yinYang}${t.wx}，${t.image}`, description: `天干${name}五行属${t.wx}、为${t.yinYang}干，象征${t.image}。${t.nature.slice(0, 60)}附《滴天髓》原文与白话解释、${name}的合冲、长生与禄位。` };
    }
    case 'dizhi': {
      const t = DI_ZHI_TERMS.find((x) => x.name === name);
      return t && { title: `地支${name}：生肖${t.zodiac}，${t.yinYang}${t.wx}，藏干${t.cangGan.join('')}`, description: `地支${name}属${t.zodiac}，五行${t.wx}，对应${t.month}与${t.hours}。${t.image.slice(0, 40)}附${name}的六合、三合、三会、冲刑害关系。` };
    }
    case 'shishen': {
      const t = SHI_SHEN_TERMS.find((x) => x.name === name);
      return t && { title: `十神${name}是什么意思？性格、六亲与常见组合`, description: `${name}：${t.relation}${t.positive}本文介绍${name}代表的六亲、性格优缺点、适合职业与常见格局组合。` };
    }
    case 'jieqi': {
      const t = JIE_QI_TERMS.find((x) => x.name === name);
      const y = new Date().getFullYear();
      return t && { title: `${name}：${y}年${name}交节时间、三候与命理意义`, description: `${name}是二十四节气中的${t.kind}，太阳黄经${t.longitude}°，约在每年${t.approxDate}。附${y}、${y + 1}年精确交节时刻、三候物候，以及${name}在八字、奇门、六壬中的作用。` };
    }
    case 'jiazi': {
      const j = jiaZiInfo(name);
      return j && { title: `${name}：纳音${j.naYin}，${name}日柱与${name}年详解`, description: `${name}是六十甲子第${j.index + 1}位，纳音${j.naYin}，属${j.xun}旬，空亡${j.kong.join('')}。${j.gan.name}${j.gan.wx}坐${j.zhi.name}${j.zhi.wx}为${j.stage}之地，附藏干十神、天克地冲、天合地合与对应年份。` };
    }
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category, name: raw } = await params;
  if (!isTermCategory(category)) return {};
  const name = decode(raw);
  const lang = locale === 'en' ? 'en' : 'zh';
  const h = lang === 'en' ? headlineEn(category, name) : headline(category, name);
  if (!h) return {};
  const url = absoluteUrl(lang, termPath(category, name));
  return {
    title: h.title,
    description: h.description,
    alternates: {
      canonical: url,
      languages: { 'zh-CN': absoluteUrl('zh', termPath(category, name)), en: absoluteUrl('en', termPath(category, name)), 'x-default': absoluteUrl('en', termPath(category, name)) },
    },
    openGraph: { type: 'article', title: h.title, description: h.description, url },
  };
}

/** Related blog articles whose title contains one of the keywords */
async function relatedArticles(keywords: string[]): Promise<Array<{ id: string; slug: string; title: string }>> {
  if (keywords.length === 0) return [];
  try {
    const supabase = createSupabasePublicClient();
    const { data } = await supabase
      .from('articles')
      .select('id,slug,title')
      .eq('status', 'published')
      .or(keywords.map((k) => `title.ilike.%${k}%`).join(','))
      .order('created_at', { ascending: false })
      .limit(6);
    return data || [];
  } catch {
    return [];
  }
}

function TermLink({ name, className = '' }: { name: string; className?: string }) {
  const cat = categoryOf(name);
  if (!cat) return <span className={className}>{name}</span>;
  return (
    <Link href={`/zh${termPath(cat, name)}`} className={`text-[#c2483c] hover:underline underline-offset-2 ${className}`}>
      {name}
    </Link>
  );
}

function Facts({ rows }: { rows: Array<[string, React.ReactNode]> }) {
  return (
    <dl className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-px overflow-hidden rounded-2xl border border-[#efe8dc] bg-[#efe8dc]">
      {rows.map(([k, v]) => (
        <div key={k} className="bg-white px-4 py-3">
          <dt className="text-xs text-stone-400">{k}</dt>
          <dd className="mt-1 text-[15px] font-medium text-stone-900">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl md:text-2xl font-bold text-stone-900">{title}</h2>
      <div className="mt-3 text-[15px] leading-7 text-stone-600 space-y-3">{children}</div>
    </section>
  );
}

/** Render 干支 strings with each known term linked, e.g. "子丑合土" → 子 丑 linked */
function LinkedText({ text }: { text: string }) {
  return (
    <>
      {Array.from(text).map((ch, i) => (categoryOf(ch) ? <TermLink key={i} name={ch} /> : <span key={i}>{ch}</span>))}
    </>
  );
}

export default async function TermPage({ params }: Props) {
  const { locale, category, name: raw } = await params;
  if (!isTermCategory(category)) notFound();
  const name = decode(raw);
  if (locale === 'en') {
    if (!headlineEn(category, name)) notFound();
    return <TermPageEn category={category} name={name} />;
  }
  if (locale !== 'zh') permanentRedirect(`/zh${termPath(category, name)}`);
  const h = headline(category, name);
  if (!h) notFound();

  const cat = TERM_CATEGORIES[category];
  const url = absoluteUrl('zh', termPath(category, name));
  let body: React.ReactNode = null;
  let keywords: string[] = [];
  let tool: [string, string] = ['/tools/bazi', '用八字排盘查看你的命盘'];

  if (category === 'tiangan') {
    const t = TIAN_GAN_TERMS.find((x) => x.name === name)!;
    keywords = [`${name}木`, `${name}火`, `${name}土`, `${name}金`, `${name}水`].filter((k) => k[1] === t.wx);
    body = (
      <>
        <Facts rows={[['阴阳', t.yinYang], ['五行', t.wx], ['方位', t.direction], ['季节', t.season], ['颜色', t.color], ['人体', t.organ], ['五合', t.he], ['相冲', t.chong ?? '戊己居中，不论冲'], ['长生 / 禄', <><LinkedText key="c" text={`长生在${t.changSheng}，禄在${t.lu}`} /></>]]} />
        <Section title={`${name}${t.wx}的象意与性格`}>
          <p>{name}为{t.yinYang}{t.wx}，取象为{t.image}。{t.nature}</p>
        </Section>
        <Section title="《滴天髓》原文">
          <blockquote className="border-l-2 border-[#FF6F61] pl-4 font-display text-lg text-stone-800 leading-8">{t.ditiansui}</blockquote>
          <p>白话：{t.ditiansuiNote}</p>
        </Section>
        <Section title={`${name}日主的六十甲子日柱`}>
          <p className="flex flex-wrap gap-2">
            {TERM_CATEGORIES.jiazi.names.filter((gz) => gz[0] === name).map((gz) => (
              <Link key={gz} href={`/zh${termPath('jiazi', gz)}`} className="rounded-lg border border-[#efe8dc] bg-white px-3 py-1.5 text-stone-800 hover:border-[#FF6F61]/50 hover:text-[#c2483c]">{gz}</Link>
            ))}
          </p>
        </Section>
      </>
    );
  } else if (category === 'dizhi') {
    const t = DI_ZHI_TERMS.find((x) => x.name === name)!;
    keywords = ['地支'];
    body = (
      <>
        <Facts rows={[['生肖', t.zodiac], ['阴阳五行', `${t.yinYang}${t.wx}`], ['月份', t.month], ['时辰', t.hours], ['方位', t.direction], ['季节', t.season], ['藏干', <LinkedText key="cg" text={t.cangGan.join('、')} />], ['人体', t.organ], ['相冲', <LinkedText key="ch" text={t.chong} />]]} />
        <Section title={`地支${name}的象意`}>
          <p>{t.image}</p>
          <p>{name}中所藏天干依次为 <LinkedText text={t.cangGan.join('、')} />{t.cangGan.length > 1 ? `，其中${t.cangGan[0]}为本气，力量最强` : '，只藏一气，五行最为纯粹'}。看八字时，地支藏干透出天干，相应十神的作用会更加明显。</p>
        </Section>
        <Section title={`${name}的合冲刑害`}>
          <ul className="list-disc pl-5 space-y-1">
            <li>六合：<LinkedText text={t.liuHe} /></li>
            <li>三合：<LinkedText text={t.sanHe} /></li>
            <li>三会：<LinkedText text={t.sanHui} /></li>
            <li>六冲：<LinkedText text={t.chong} /></li>
            <li>相刑：<LinkedText text={t.xing} /></li>
            <li>六害：<LinkedText text={t.hai} /></li>
          </ul>
          <p>合主和谐与牵绊，冲主变动与对立，刑主是非与损伤，害主暗中妨碍。实际吉凶要看所合所冲的五行是否为命局所喜。</p>
        </Section>
      </>
    );
  } else if (category === 'shishen') {
    const t = SHI_SHEN_TERMS.find((x) => x.name === name)!;
    keywords = [name, '十神'];
    body = (
      <>
        <Facts rows={[['简称', t.alias], ['六亲（男命）', t.liuQinMale], ['六亲（女命）', t.liuQinFemale]]} />
        <Section title={`${name}的定义`}><p>{t.relation}</p></Section>
        <Section title="性格特点">
          <p><strong className="text-stone-800">正面：</strong>{t.positive}</p>
          <p><strong className="text-stone-800">负面：</strong>{t.negative}</p>
        </Section>
        <Section title="职业倾向"><p>{t.career}</p></Section>
        <Section title="常见组合">
          <ul className="list-disc pl-5 space-y-1">{t.combos.map((c) => <li key={c}>{c}</li>)}</ul>
        </Section>
        <Section title="其他十神">
          <p className="flex flex-wrap gap-2">
            {SHI_SHEN_TERMS.filter((x) => x.name !== name).map((x) => (
              <Link key={x.name} href={`/zh${termPath('shishen', x.name)}`} className="rounded-lg border border-[#efe8dc] bg-white px-3 py-1.5 text-stone-800 hover:border-[#FF6F61]/50 hover:text-[#c2483c]">{x.name}</Link>
            ))}
          </p>
        </Section>
      </>
    );
  } else if (category === 'jieqi') {
    const t = JIE_QI_TERMS.find((x) => x.name === name)!;
    const y = new Date().getFullYear();
    const times = [y, y + 1].map((yr) => {
      const p = collectJieQiPoints(yr, [name]).find((x) => x.time.getFullYear() === yr);
      return [yr, p ? formatLocal(p.time) : '—'] as const;
    });
    const ju = (t.longitude >= 270 || t.longitude < 90 ? YANG_DUN_JU : YIN_DUN_JU)[name];
    const yj = ZHONGQI_TO_YJ[name];
    keywords = ['节气', '择日'];
    tool = ['/tools/almanac', '查看万年历与老黄历'];
    body = (
      <>
        <Facts rows={[['类型', t.kind === '节' ? '节（月首）' : '中气（月中）'], ['太阳黄经', `${t.longitude}°`], ['大约日期', t.approxDate], ['所在月', <LinkedText key="m" text={`${t.monthZhi}月`} />], [`${times[0][0]}年交节`, times[0][1]], [`${times[1][0]}年交节`, times[1][1]]]} />
        <Section title={`${name}的含义`}><p>{t.meaning}</p></Section>
        <Section title="三候">
          <ol className="list-decimal pl-5 space-y-1">{t.hou.map((h) => <li key={h}>{h}</li>)}</ol>
          <p>古人将每个节气分为三候，每候约五天，以物候变化记录时令。</p>
        </Section>
        <Section title="在命理术数中的作用">
          <ul className="list-disc pl-5 space-y-1">
            <li>八字：{t.kind === '节' ? <>{name}是{t.monthZhi}月的起点，出生在{name}交节时刻之后，月柱地支即为<LinkedText text={t.monthZhi} />{name === '立春' ? '；立春同时也是年柱的分界' : ''}。</> : <>{name}是中气，不换月柱；月令仍为<LinkedText text={t.monthZhi} />月，但月中当令的人元会随时间推移而变化。</>}</li>
            {ju && <li>奇门遁甲（拆补法）：{name}{t.longitude >= 270 || t.longitude < 90 ? '阳遁' : '阴遁'}上元{ju[0]}局、中元{ju[1]}局、下元{ju[2]}局。</li>}
            {yj && <li>大六壬：{name}后月将换为{YUE_JIANG_NAME[yj]}（<LinkedText text={yj} />将）。</li>}
          </ul>
        </Section>
      </>
    );
  } else if (category === 'jiazi') {
    const j = jiaZiInfo(name)!;
    keywords = [name];
    body = (
      <>
        <Facts rows={[['序号', `第 ${j.index + 1} 位`], ['纳音', j.naYin], ['所属旬', <span key="x"><TermLink name={j.xun} />旬</span>], ['空亡', <LinkedText key="k" text={j.kong.join('')} />], ['十二长生', `${j.gan.name}在${j.zhi.name}为${j.stage}`], ['自坐十神', j.zuoShiShen ? <TermLink key="s" name={j.zuoShiShen} /> : '—']]} />
        <Section title={`${name}的构成`}>
          <p>
            天干 <TermLink name={j.gan.name} /> 为{j.gan.yinYang}{j.gan.wx}（{j.gan.image}），地支 <TermLink name={j.zhi.name} /> 为{j.zhi.yinYang}{j.zhi.wx}，生肖属{j.zhi.zodiac}。{j.relation}。
          </p>
          <p>
            {j.zhi.name}中藏干：{j.cangGan.map((c, i) => <span key={c.gan}>{i > 0 && '、'}<TermLink name={c.gan} />（<TermLink name={c.shiShen} />）</span>)}。
            {j.gan.name}在{j.zhi.name}处于十二长生的「{j.stage}」位，{CHANG_SHENG_MEANING[j.stage]}。
          </p>
        </Section>
        <Section title={`纳音：${j.naYin}`}><p>{NAYIN_MEANING[j.naYin]}{name}与同组干支共用此纳音。</p></Section>
        <Section title="相关干支">
          <ul className="list-disc pl-5 space-y-1">
            {j.tianKeDiChong && <li>天克地冲：<TermLink name={j.tianKeDiChong} />（天干相克、地支相冲，变动最大）</li>}
            <li>天合地合：<TermLink name={j.tianHeDiHe} />（天干五合、地支六合）</li>
            <li>前后干支：<TermLink name={j.prev} /> ← {name} → <TermLink name={j.next} /></li>
          </ul>
        </Section>
        <Section title={`${name}年`}>
          <p>1900–2100 年间的{name}年：{j.years.join('、')}。注意八字年柱以立春为界，{name}年立春之前出生的人年柱仍属上一年。</p>
        </Section>
      </>
    );
  }

  const articles = await relatedArticles(keywords);

  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'DefinedTerm',
        '@id': `${url}#term`,
        name,
        description: h.description,
        url,
        inDefinedTermSet: { '@type': 'DefinedTermSet', name: cat.label, url: `${absoluteUrl('zh', '/terms')}#${category}` },
        isPartOf: { '@id': WEBSITE_ID },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '命理术语', item: absoluteUrl('zh', '/terms') },
          { '@type': 'ListItem', position: 2, name: cat.label, item: `${absoluteUrl('zh', '/terms')}#${category}` },
          { '@type': 'ListItem', position: 3, name, item: url },
        ],
      },
    ],
  };

  return (
    <article lang="zh-CN" className="max-w-3xl mx-auto px-5 py-12 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
      <nav aria-label="breadcrumb" className="text-sm text-stone-400">
        <Link href="/zh/terms" className="hover:text-[#c2483c]">命理术语</Link>
        <span className="mx-2">/</span>
        <Link href={`/zh/terms#${category}`} className="hover:text-[#c2483c]">{cat.label}</Link>
      </nav>
      <div className="mt-6 flex items-end gap-5">
        <span className="font-display text-7xl md:text-8xl font-bold leading-none text-stone-900" aria-hidden>{name}</span>
        <span className="pb-2 text-sm text-stone-400">{cat.label}</span>
      </div>
      <h1 className="mt-5 font-display text-2xl md:text-3xl font-bold text-stone-900 tracking-tight text-balance">{h.title}</h1>
      <p className="mt-4 text-[15px] leading-7 text-stone-600">{h.description}</p>
      {body}

      {articles.length > 0 && (
        <Section title="相关文章">
          <ul className="space-y-2">
            {articles.map((a) => (
              <li key={a.id}>
                <Link href={`/zh${articlePath(a)}`} className="text-[#c2483c] hover:underline underline-offset-2">{a.title}</Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <div className="result-hero relative overflow-hidden mt-12 rounded-2xl px-6 py-5 flex flex-wrap items-center justify-between gap-3">
        <span className="text-stone-600 text-sm">免费工具 · 无需注册</span>
        <Link href={`/zh${tool[0]}`} className="rounded-xl bg-[#FF6F61] px-4 py-2 text-sm font-semibold text-white hover:bg-[#f25d4f] transition-colors">
          {tool[1]} →
        </Link>
      </div>
    </article>
  );
}
