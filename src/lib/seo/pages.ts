import type { Metadata } from 'next';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { buildPageMetadata } from '@/lib/i18n/seo';
import { SITE_NAME, SITE_NAME_ZH } from '@/lib/site';

type Copy = { title: string; description: string };

/** Metadata for routes whose page.tsx is a client component (metadata lives in a sibling layout.tsx). */
const PAGES: Record<'services' | 'contact' | 'donation' | 'ai-chat' | 'fortune', Record<Locale, Copy>> = {
  services: {
    en: { title: 'Topics: BaZi, Qimen Dunjia, Da Liu Ren, Feng Shui & Naming', description: 'Curated topic hubs for BaZi (Four Pillars), Yin Pan Qimen Dunjia, Da Liu Ren, Feng Shui and Chinese name selection — core concepts, learning paths and related articles.' },
    zh: { title: '命理专题：八字、奇门遁甲、大六壬、风水、起名', description: '按主题整理的命理专题：八字十神格局、阴盘奇门、大六壬、风水布局与八字起名，含核心概念、学习路径与相关文章。' },
    ja: { title: 'テーマ別：四柱推命・奇門遁甲・大六壬・風水・命名', description: '四柱推命、陰盤奇門遁甲、大六壬、風水、命名のテーマ別ガイドと関連記事。' },
    ko: { title: '주제별: 사주팔자·기문둔갑·대육임·풍수·작명', description: '사주팔자, 음반 기문둔갑, 대육임, 풍수, 작명의 주제별 가이드와 관련 칼럼.' },
    ar: { title: 'موضوعات: بازي، تشي من دون جيا، دا ليو رن، فنغ شوي', description: 'مراكز موضوعية لبازي وتشي من دون جيا ودا ليو رن وفنغ شوي واختيار الأسماء الصينية.' },
  },
  contact: {
    en: { title: 'Contact Rollkey — BaZi & Qimen Consultations', description: 'Get in touch with Rollkey for BaZi (Four Pillars) readings, Qimen Dunjia and Da Liu Ren consultations, date selection and name selection.' },
    zh: { title: '联系滚键Rollkey：八字、奇门、六壬咨询', description: '联系滚键Rollkey预约八字命理分析、奇门遁甲与大六壬占断、择日与起名咨询。' },
    ja: { title: 'お問い合わせ — 四柱推命・奇門遁甲の鑑定', description: '四柱推命、奇門遁甲、大六壬の鑑定、択日・命名のご相談はこちら。' },
    ko: { title: '문의하기 — 사주·기문둔갑 상담', description: '사주팔자, 기문둔갑, 대육임 상담 및 택일·작명 문의.' },
    ar: { title: 'تواصل مع Rollkey — استشارات بازي وتشي من', description: 'تواصل لقراءات بازي واستشارات تشي من دون جيا ودا ليو رن واختيار التواريخ والأسماء.' },
  },
  donation: {
    en: { title: 'Support Rollkey Divination Blog', description: 'Support the free BaZi, Qimen and almanac tools and the articles on Rollkey Divination Blog.' },
    zh: { title: '支持滚键Rollkey命理博客', description: '赞助支持本站免费的八字排盘、奇门排盘、万年历工具与原创命理文章。' },
    ja: { title: 'Rollkey を支援する', description: '無料の四柱推命・奇門遁甲ツールと記事の運営を支援してください。' },
    ko: { title: 'Rollkey 후원하기', description: '무료 사주·기문둔갑 도구와 칼럼 운영을 후원해 주세요.' },
    ar: { title: 'ادعم مدونة Rollkey', description: 'ادعم أدوات بازي وتشي من المجانية والمقالات.' },
  },
  'ai-chat': {
    en: { title: 'AI BaZi Consultant — Ask About Your Four Pillars', description: 'Ask an AI consultant grounded in Rollkey’s Chinese metaphysics articles about BaZi, Ten Gods, luck cycles, Qimen Dunjia and more.' },
    zh: { title: 'AI 八字命理问答', description: '基于本站原创命理文章的 AI 问答：八字十神、格局用神、大运流年、奇门遁甲等问题即时解答。' },
    ja: { title: 'AI 四柱推命相談', description: '当サイトの命理記事に基づく AI が、四柱推命や奇門遁甲の質問に答えます。' },
    ko: { title: 'AI 사주 상담', description: '본 사이트의 명리 칼럼을 바탕으로 AI가 사주·기문둔갑 질문에 답합니다.' },
    ar: { title: 'مستشار بازي بالذكاء الاصطناعي', description: 'اسأل مستشارًا بالذكاء الاصطناعي عن بازي والأعمدة الأربعة وتشي من دون جيا.' },
  },
  fortune: {
    en: { title: 'BaZi, Qimen & Da Liu Ren Readings', description: 'Personal Chinese metaphysics readings by Rollkey: BaZi (Four Pillars) life analysis, Qimen Dunjia and Da Liu Ren divination for specific questions.' },
    zh: { title: '八字算命、奇门、六壬预测服务', description: '滚键Rollkey一对一命理服务：八字详批、奇门遁甲与大六壬事项占断。' },
    ja: { title: '四柱推命・奇門遁甲・大六壬の鑑定', description: 'Rollkey による四柱推命の命式鑑定、奇門遁甲・大六壬による個別占断。' },
    ko: { title: '사주·기문둔갑·대육임 상담', description: 'Rollkey의 사주팔자 분석, 기문둔갑·대육임 점단 서비스.' },
    ar: { title: 'قراءات بازي وتشي من ودا ليو رن', description: 'قراءات شخصية في الميتافيزيقا الصينية: تحليل بازي وتنبؤات تشي من ودا ليو رن.' },
  },
};

export function pageMetadata(page: keyof typeof PAGES) {
  return async ({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> => {
    const { locale } = await params;
    if (!isLocale(locale)) return {};
    const meta = buildPageMetadata({ locale, path: `/${page}`, ...PAGES[page][locale] });
    // These live in layout.tsx: the root template already suffixes `default`; re-declare the template so
    // nested pages (e.g. /services/[slug]) keep the site suffix too
    return { ...meta, title: { default: PAGES[page][locale].title, template: `%s | ${locale === 'zh' ? SITE_NAME_ZH : SITE_NAME}` } };
  };
}

/** For account, payment and search pages: keep out of the index but let crawlers follow links. */
export const noindexMetadata: Metadata = { robots: { index: false, follow: true } };
