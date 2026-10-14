import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, localeHtmlLang } from '@/lib/i18n/config';
import { absoluteUrl } from '@/lib/i18n/seo';
import { CONTACT_EMAIL, SITE_NAME, SITE_NAME_ZH, SITE_URL } from '@/lib/site';

const UPDATED = '2026-10-14';

type Section = { h: string; p: string[] };
type Policy = { title: string; description: string; updated: string; intro: string; sections: Section[] };

/** Written in Chinese and English; ja/ko/ar show the English text and point their canonical at /en/privacy. */
const POLICY: Record<'zh' | 'en', Policy> = {
  zh: {
    title: '隐私政策',
    description: `${SITE_NAME_ZH}的隐私政策：我们收集哪些信息、Cookie 与 Google AdSense 广告、第三方服务、数据保存与您的权利。`,
    updated: '最后更新',
    intro: `本隐私政策说明 ${SITE_NAME_ZH}（${SITE_URL}，以下简称"本站"）如何收集、使用和保护您的信息。使用本站即表示您同意本政策。`,
    sections: [
      {
        h: '我们收集的信息',
        p: [
          '账户信息：注册或登录时，我们通过 Supabase 保存您的邮箱、昵称和头像（如有）。',
          '您主动提供的内容：评论、点赞收藏、保存的命盘，以及在 AI 咨询中填写的出生日期、时间、性别和提问内容。',
          '排盘工具（八字、奇门、六壬、黄历、起名）在您的浏览器中计算，不登录使用时不会上传您输入的出生信息。',
          '技术信息：服务器和托管服务商（Vercel）会自动记录 IP 地址、浏览器类型、访问时间等日志，用于安全和故障排查。',
        ],
      },
      {
        h: '信息的用途',
        p: [
          '提供和维护账户、评论、命盘保存与 AI 咨询功能；限制每位用户每日的 AI 调用次数以防止滥用。',
          '回复您通过邮件发来的咨询。',
          '统计和改进网站内容，以及展示广告（见下文）。',
          '我们不会出售您的个人信息。',
        ],
      },
      {
        h: 'Cookie 与 Google AdSense 广告',
        p: [
          '本站使用 Cookie 保持登录状态和记住语言偏好。',
          '本站通过 Google AdSense 展示广告。Google 等第三方供应商会使用 Cookie，根据您过去访问本站或其他网站的情况向您展示广告。',
          'Google 使用广告 Cookie，使其及其合作伙伴能够根据您对本站和/或互联网上其他网站的访问情况投放广告。',
          '您可以访问 Google 广告设置（https://adssettings.google.com）停用个性化广告，或访问 https://www.aboutads.info 停用第三方供应商对个性化广告 Cookie 的使用。',
          '了解 Google 如何使用数据：https://policies.google.com/technologies/partner-sites',
          '对于欧洲经济区、英国和瑞士的访客，我们会通过 Google 认证的同意管理平台征求您对个性化广告的同意。',
        ],
      },
      {
        h: '第三方服务',
        p: [
          'Supabase（数据库与用户认证）、Vercel（网站托管）、Google AdSense（广告）、DeepSeek 等 AI 模型服务（处理 AI 咨询中的提问和出生信息以生成回复）。这些服务按各自的隐私政策处理数据。',
        ],
      },
      {
        h: '数据保存与安全',
        p: [
          '账户与咨询记录在您删除账户前保存。我们使用 HTTPS 加密传输，并通过数据库行级安全策略限制每位用户只能访问自己的数据。',
        ],
      },
      {
        h: '您的权利',
        p: [
          `您可以随时查看、更正或删除您的个人信息，或要求注销账户。请发邮件至 ${CONTACT_EMAIL}，我们会在 30 天内处理。`,
        ],
      },
      {
        h: '儿童隐私',
        p: ['本站不面向 13 岁以下儿童，也不会有意收集其个人信息。'],
      },
      {
        h: '内容说明',
        p: ['本站的命理内容和工具结果仅供文化研究与娱乐参考，不构成医疗、法律、财务或其他专业建议。'],
      },
      {
        h: '政策变更与联系方式',
        p: [`本政策更新时会修改上方的"最后更新"日期。如有任何疑问，请联系 ${CONTACT_EMAIL}。`],
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    description: `Privacy policy of ${SITE_NAME}: what we collect, cookies and Google AdSense advertising, third-party services, data retention and your rights.`,
    updated: 'Last updated',
    intro: `This privacy policy explains how ${SITE_NAME} (${SITE_URL}, "the site") collects, uses and protects your information. By using the site you agree to this policy.`,
    sections: [
      {
        h: 'Information we collect',
        p: [
          'Account information: when you sign up or log in we store your email, display name and avatar (if any) with Supabase.',
          'Content you provide: comments, likes and bookmarks, saved charts, and the birth date, time, gender and questions you enter in the AI consultation.',
          'The charting tools (BaZi, Qimen, Da Liu Ren, almanac, naming) run in your browser; birth data you enter is not uploaded unless you sign in and save it.',
          'Technical information: our server and hosting provider (Vercel) automatically log IP address, browser type and access time for security and troubleshooting.',
        ],
      },
      {
        h: 'How we use it',
        p: [
          'To provide accounts, comments, saved charts and the AI consultation, and to cap AI requests per user per day to prevent abuse.',
          'To reply to consultation requests you send by email.',
          'To measure and improve the site, and to show advertising (see below).',
          'We do not sell your personal information.',
        ],
      },
      {
        h: 'Cookies and Google AdSense',
        p: [
          'We use cookies to keep you signed in and remember your language.',
          'The site shows ads through Google AdSense. Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website or other websites.',
          "Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to this site and/or other sites on the Internet.",
          'You may opt out of personalized advertising in Google Ads Settings (https://adssettings.google.com), or opt out of third-party vendors’ use of cookies for personalized advertising at https://www.aboutads.info.',
          'How Google uses data: https://policies.google.com/technologies/partner-sites',
          'Visitors in the EEA, the UK and Switzerland are asked for consent to personalized ads through a Google-certified consent management platform.',
        ],
      },
      {
        h: 'Third-party services',
        p: [
          'Supabase (database and authentication), Vercel (hosting), Google AdSense (advertising) and AI model providers such as DeepSeek (which process the questions and birth details in AI consultations to generate replies). Each handles data under its own privacy policy.',
        ],
      },
      {
        h: 'Retention and security',
        p: [
          'Account and consultation records are kept until you delete your account. Traffic is encrypted with HTTPS, and database row-level security limits each user to their own data.',
        ],
      },
      {
        h: 'Your rights',
        p: [
          `You can access, correct or delete your personal data, or close your account, at any time by emailing ${CONTACT_EMAIL}. We respond within 30 days.`,
        ],
      },
      {
        h: "Children's privacy",
        p: ['The site is not directed at children under 13 and we do not knowingly collect their personal data.'],
      },
      {
        h: 'Disclaimer',
        p: ['Metaphysics content and tool results are for cultural study and entertainment only and are not medical, legal, financial or other professional advice.'],
      },
      {
        h: 'Changes and contact',
        p: [`When this policy changes we update the "Last updated" date above. Questions: ${CONTACT_EMAIL}.`],
      },
    ],
  },
};

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const lang = locale === 'zh' ? 'zh' : 'en';
  const policy = POLICY[lang];
  return {
    title: policy.title,
    description: policy.description,
    alternates: {
      canonical: absoluteUrl(lang, '/privacy'),
      languages: { 'zh-CN': absoluteUrl('zh', '/privacy'), en: absoluteUrl('en', '/privacy'), 'x-default': absoluteUrl('en', '/privacy') },
    },
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const lang = locale === 'zh' ? 'zh' : 'en';
  const policy = POLICY[lang];

  return (
    <article lang={localeHtmlLang[lang]} className="max-w-3xl mx-auto px-6 py-12 md:py-20 text-gray-700">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{policy.title}</h1>
      <p className="text-sm text-gray-500 mb-8">
        {policy.updated}: <time dateTime={UPDATED}>{UPDATED}</time>
      </p>
      <p className="mb-8 leading-relaxed">{policy.intro}</p>
      {policy.sections.map((s) => (
        <section key={s.h} className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">{s.h}</h2>
          <ul className="list-disc pl-5 space-y-2 leading-relaxed">
            {s.p.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      ))}
    </article>
  );
}
