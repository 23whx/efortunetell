import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLocale, localeHtmlLang, withLocale } from '@/lib/i18n/config';
import { absoluteUrl } from '@/lib/i18n/seo';
import { AUTHOR_ID, CONTACT_EMAIL, SITE_NAME, SITE_NAME_ZH, WEBSITE_ID, jsonLd } from '@/lib/site';

type Section = { h: string; p: string[] };
type About = { title: string; description: string; intro: string; sections: Section[]; tools: string; contact: string };

/** Written in Chinese and English; ja/ko/ar show the English text and canonicalize to /en/about (same as /privacy). */
const ABOUT: Record<'zh' | 'en', About> = {
  zh: {
    title: '关于卧烟居士',
    description: `${SITE_NAME_ZH}由命理研究者卧烟居士创办，专注八字、阴盘奇门遁甲、大六壬与择日起名，提供免费排盘工具和原创命理文章。`,
    intro: `${SITE_NAME_ZH}由卧烟居士创办和撰写。本站专注于中国传统术数中的八字命理、阴盘奇门遁甲、大六壬、择日与起名，所有文章均为原创中文内容，所有排盘工具免费、无需注册。`,
    sections: [
      {
        h: '我们提供什么',
        p: [
          '免费在线工具：八字排盘（四柱、藏干、十神、纳音、空亡、大运）、阴盘奇门排盘、大六壬起课（四位课式）、万年历老黄历（每日宜忌、冲煞、吉时）与八字起名。',
          '原创文章：十神、格局、用神、调候、大运流年等八字理论，以及奇门、六壬的实战解读。',
          '一对一咨询：八字详批、奇门与六壬占断、择日与起名，目前通过邮件预约。',
        ],
      },
      {
        h: '编辑原则',
        p: [
          '文章由作者本人撰写，内容来自作者的学习与实践总结。',
          '排盘工具按节气交接划分月柱、按传统规则排布奇门与六壬，计算全部在浏览器中完成，不会上传您的出生信息。',
          '发现错误欢迎发邮件指正，确认后会更新文章。',
        ],
      },
      {
        h: '免责声明',
        p: ['命理内容与工具结果仅供传统文化研究和娱乐参考，不构成医疗、法律、投资或其他专业建议。'],
      },
    ],
    tools: '免费排盘工具',
    contact: '联系方式',
  },
  en: {
    title: 'About 卧烟居士 (Wo Yan Ju Shi)',
    description: `${SITE_NAME} is run by Chinese metaphysics practitioner 卧烟居士 (Wo Yan Ju Shi), covering BaZi, Yin Pan Qimen Dunjia, Da Liu Ren, date and name selection, with free calculators and original articles.`,
    intro: `${SITE_NAME} is founded and written by 卧烟居士 (Wo Yan Ju Shi). It focuses on traditional Chinese metaphysics — BaZi (Four Pillars of Destiny), Yin Pan Qimen Dunjia, Da Liu Ren, date selection and name selection. Articles are original and written in Chinese; every calculator is free and needs no sign-up.`,
    sections: [
      {
        h: 'What you will find here',
        p: [
          'Free tools: a BaZi chart (four pillars, hidden stems, Ten Gods, Na Yin, void, luck cycles), a Yin Pan Qimen Dunjia chart, a Da Liu Ren four-position chart, a daily Chinese almanac (Tong Shu: auspicious and inauspicious activities, clashes, lucky hours) and BaZi-based name selection.',
          'Original articles on Ten Gods, chart structures, useful gods, climate adjustment and luck cycles, plus practical Qimen and Da Liu Ren readings.',
          'One-to-one consultations: BaZi readings, Qimen and Da Liu Ren divination, date and name selection — currently booked by email.',
        ],
      },
      {
        h: 'Editorial principles',
        p: [
          'Articles are written by the author and draw on the author’s own study and practice.',
          'Calculators split months by solar terms and lay out Qimen and Da Liu Ren by the traditional rules. All computation runs in your browser; your birth data is not uploaded.',
          'Corrections are welcome by email; confirmed errors are fixed in the article.',
        ],
      },
      {
        h: 'Disclaimer',
        p: ['Metaphysics content and tool results are for cultural study and entertainment only and are not medical, legal, investment or other professional advice.'],
      },
    ],
    tools: 'Free calculators',
    contact: 'Contact',
  },
};

const SAME_AS = ['https://x.com/Rollkey4', 'https://www.youtube.com/@Rollkey', 'https://t.me/Rollkey'];

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const lang = locale === 'zh' ? 'zh' : 'en';
  return {
    title: ABOUT[lang].title,
    description: ABOUT[lang].description,
    alternates: {
      canonical: absoluteUrl(lang, '/about'),
      languages: { 'zh-CN': absoluteUrl('zh', '/about'), en: absoluteUrl('en', '/about'), 'x-default': absoluteUrl('en', '/about') },
    },
    openGraph: { type: 'profile', title: ABOUT[lang].title, description: ABOUT[lang].description, url: absoluteUrl(lang, '/about') },
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const lang = locale === 'zh' ? 'zh' : 'en';
  const about = ABOUT[lang];
  const url = absoluteUrl(lang, '/about');

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${url}#page`,
    url,
    name: about.title,
    description: about.description,
    inLanguage: localeHtmlLang[lang],
    isPartOf: { '@id': WEBSITE_ID },
    mainEntity: { '@id': AUTHOR_ID },
  };

  const tools = [
    ['/tools/bazi', lang === 'zh' ? '八字排盘' : 'BaZi chart'],
    ['/tools/qimen', lang === 'zh' ? '阴盘奇门排盘' : 'Qimen Dunjia chart'],
    ['/tools/daliuren', lang === 'zh' ? '大六壬起课' : 'Da Liu Ren'],
    ['/tools/almanac', lang === 'zh' ? '老黄历' : 'Chinese almanac'],
    ['/tools/naming', lang === 'zh' ? '八字起名' : 'Name selection'],
  ];

  return (
    <article lang={localeHtmlLang[lang]} className="max-w-3xl mx-auto px-6 py-12 md:py-20 text-gray-700">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{about.title}</h1>
      <p className="mb-8 leading-relaxed">{about.intro}</p>
      {about.sections.map((s) => (
        <section key={s.h} className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">{s.h}</h2>
          <ul className="list-disc pl-5 space-y-2 leading-relaxed">
            {s.p.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      ))}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">{about.tools}</h2>
        <ul className="flex flex-wrap gap-3">
          {tools.map(([path, label]) => (
            <li key={path}>
              <Link href={withLocale(locale, path)} className="inline-block rounded-full border border-[#f0ece3] px-4 py-2 hover:border-[#FF6F61] hover:text-[#FF6F61]">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">{about.contact}</h2>
        <ul className="space-y-1">
          <li>
            Email: <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#FF6F61] hover:underline">{CONTACT_EMAIL}</a>
          </li>
          {SAME_AS.map((href) => (
            <li key={href}>
              <a href={href} target="_blank" rel="noopener noreferrer me" className="text-[#FF6F61] hover:underline">{href.replace('https://', '')}</a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
