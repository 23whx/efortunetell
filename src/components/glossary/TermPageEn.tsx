import Link from 'next/link';
import { DI_ZHI_TERMS, JIE_QI_TERMS, SHI_SHEN_TERMS, TERM_CATEGORIES, TIAN_GAN_TERMS, categoryOf, jiaZiInfo, termPath, type TermCategory } from '@/lib/glossary';
import { DIRECTION_EN, SEASON_EN, SHISHEN_EN, STEM_EN, WX_EN, YY_EN } from '@/lib/glossary/en';
import { ANIMALS, NAYIN_EN, STEMS } from '@/lib/zodiac/data';
import { SOLAR_TERM_EN } from '@/lib/paipan/almanac/en';
import { collectJieQiPoints, formatLocal } from '@/lib/paipan/calendar';
import { absoluteUrl } from '@/lib/i18n/seo';
import { WEBSITE_ID, jsonLd } from '@/lib/site';

export const CATEGORY_EN: Record<TermCategory, { label: string; intro: string }> = {
  tiangan: { label: 'Heavenly Stems', intro: 'The ten heavenly stems (Jia to Gui) pair the five elements with yin and yang. They are the top character of every BaZi pillar.' },
  dizhi: { label: 'Earthly Branches', intro: 'The twelve earthly branches (Zi to Hai) match the 12 zodiac animals, months and two-hour periods, and each hides one to three stems.' },
  shishen: { label: 'Ten Gods', intro: 'The Ten Gods describe how each element in a chart relates to the Day Master: support, output, wealth, power or resource.' },
  jieqi: { label: '24 Solar Terms', intro: 'The solar terms divide the sun’s path into 15° steps. BaZi changes month at each "jie" term and year at Li Chun.' },
  jiazi: { label: 'Sexagenary Cycle (60 Jia Zi)', intro: 'Ten stems and twelve branches combine into 60 pairs that count years, months, days and hours, each with a Na Yin element.' },
};

const BRANCH_ANIMAL = Object.fromEntries(ANIMALS.map((a) => [a.branch, a]));
const BRANCH_MONTH = ['11th', '12th', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];

function pinyinOf(name: string): string {
  if (STEMS[name]) return STEMS[name].pinyin;
  if (BRANCH_ANIMAL[name]) return BRANCH_ANIMAL[name].branchPinyin;
  return '';
}

export function headlineEn(category: TermCategory, name: string): { title: string; description: string } | null {
  switch (category) {
    case 'tiangan': {
      const t = TIAN_GAN_TERMS.find((x) => x.name === name);
      if (!t) return null;
      return { title: `${name} (${pinyinOf(name)}): ${YY_EN[t.yinYang]} ${WX_EN[t.wx]} Heavenly Stem`, description: `${name} ${pinyinOf(name)} is the ${YY_EN[t.yinYang].toLowerCase()} ${WX_EN[t.wx].toLowerCase()} heavenly stem, pictured as ${STEM_EN[name].image}. Meaning in BaZi, personality as a Day Master, combinations and clashes.` };
    }
    case 'dizhi': {
      const t = DI_ZHI_TERMS.find((x) => x.name === name);
      if (!t) return null;
      const a = BRANCH_ANIMAL[name];
      return { title: `${name} (${a.branchPinyin}): the ${a.name} Earthly Branch, ${YY_EN[t.yinYang]} ${WX_EN[t.wx]}`, description: `${name} ${a.branchPinyin} is the earthly branch of the ${a.name}: ${YY_EN[t.yinYang].toLowerCase()} ${WX_EN[t.wx].toLowerCase()}, hours ${a.hours}, hidden stems ${t.cangGan.join(' ')}. Combinations, clashes, punishments and harms.` };
    }
    case 'shishen': {
      const e = SHISHEN_EN[name];
      if (!e) return null;
      return { title: `${e.en} (${name}) in BaZi: Meaning and Personality`, description: `${e.en} (${name}) is one of the Ten Gods in BaZi. ${e.relation} Traits, career tendencies and how it combines with other gods.` };
    }
    case 'jieqi': {
      const t = JIE_QI_TERMS.find((x) => x.name === name);
      if (!t) return null;
      const y = new Date().getFullYear();
      return { title: `${SOLAR_TERM_EN[name]} (${name}) ${y}: Date, Time and Meaning`, description: `${SOLAR_TERM_EN[name]} (${name}, ${t.pinyin}) is the solar term at ${t.longitude}° of the sun, around ${t.approxDate.replace('月', '/').replace('日', '')}. Exact ${y} and ${y + 1} times and its role in BaZi, Qi Men Dun Jia and Da Liu Ren.` };
    }
    case 'jiazi': {
      const j = jiaZiInfo(name);
      if (!j) return null;
      const a = BRANCH_ANIMAL[j.zhi.name];
      return { title: `${name} (${STEMS[j.gan.name].pinyin} ${a.branchPinyin}): ${YY_EN[j.gan.yinYang]} ${WX_EN[j.gan.wx]} ${a.name}, Na Yin ${NAYIN_EN[j.naYin]?.name}`, description: `${name} is number ${j.index + 1} of the 60 Jia Zi: ${WX_EN[j.gan.wx]} ${a.name}, Na Yin ${NAYIN_EN[j.naYin]?.name}. Hidden stems, Ten Gods, void branches and the years it falls on.` };
    }
  }
}

function L({ name }: { name: string }) {
  const c = categoryOf(name);
  if (!c) return <>{name}</>;
  return <Link href={`/en${termPath(c, name)}`} className="text-[#c2483c] hover:underline underline-offset-2">{name}</Link>;
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

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-[15px] leading-7 text-stone-600">{children}</p>;
}
function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-10 font-display text-2xl font-bold text-stone-900">{children}</h2>;
}

export default function TermPageEn({ category, name }: { category: TermCategory; name: string }) {
  const h = headlineEn(category, name)!;
  const url = absoluteUrl('en', termPath(category, name));
  let body: React.ReactNode = null;

  if (category === 'tiangan') {
    const t = TIAN_GAN_TERMS.find((x) => x.name === name)!;
    const s = STEM_EN[name];
    body = (
      <>
        <Facts rows={[['Polarity', YY_EN[t.yinYang]], ['Element', WX_EN[t.wx]], ['Direction', DIRECTION_EN[t.direction] ?? t.direction], ['Season', SEASON_EN[t.season] ?? t.season], ['Combines with', <L key="h" name={t.he[t.he[0] === name ? 1 : 0]} />], ['Clashes with', t.chong ? <L key="c" name={t.chong.replace(name, '')[0]} /> : 'None (centre)']]} />
        <H>As a Day Master</H>
        <P>{name} is {YY_EN[t.yinYang].toLowerCase()} {WX_EN[t.wx].toLowerCase()}, traditionally pictured as {s.image}. {s.nature}</P>
        <H>Classical verse (Di Tian Sui)</H>
        <blockquote lang="zh-CN" className="mt-3 border-l-2 border-[#FF6F61] pl-4 font-display text-lg text-stone-800 leading-8">{t.ditiansui}</blockquote>
        <P>The Di Tian Sui, a classic of BaZi, describes each stem in one verse. A Chinese commentary is on the <Link href={`/zh${termPath('tiangan', name)}`} className="text-[#c2483c] hover:underline underline-offset-2">Chinese page</Link>.</P>
        <H>The six {name} day pillars</H>
        <p className="mt-3 flex flex-wrap gap-2">{TERM_CATEGORIES.jiazi.names.filter((gz) => gz[0] === name).map((gz) => <Link key={gz} href={`/en${termPath('jiazi', gz)}`} className="rounded-lg border border-[#efe8dc] bg-white px-3 py-1.5 text-stone-800 hover:border-[#FF6F61]/50">{gz}</Link>)}</p>
      </>
    );
  } else if (category === 'dizhi') {
    const t = DI_ZHI_TERMS.find((x) => x.name === name)!;
    const a = BRANCH_ANIMAL[name];
    const i = '子丑寅卯辰巳午未申酉戌亥'.indexOf(name);
    body = (
      <>
        <Facts rows={[['Animal', a.name], ['Element', `${YY_EN[t.yinYang]} ${WX_EN[t.wx]}`], ['Hours', a.hours], ['Lunar month', BRANCH_MONTH[i]], ['Direction', DIRECTION_EN[t.direction] ?? t.direction], ['Hidden stems', <span key="cg">{t.cangGan.map((g, k) => <span key={g}>{k > 0 && ' '}<L name={g} /></span>)}</span>]]} />
        <H>Character</H>
        <P>{a.strengths}</P>
        <H>Relations</H>
        <ul className="mt-3 list-disc pl-5 space-y-1 text-[15px] leading-7 text-stone-600">
          <li>Six harmony (Liu He): {t.liuHe.replace(/[合土火金水木]+$/, '')}</li>
          <li>Three harmony (San He): {t.sanHe.slice(0, 3)}</li>
          <li>Seasonal combination (San Hui): {t.sanHui.slice(0, 3)}</li>
          <li>Clash (Chong): {t.chong.slice(0, 2)}</li>
          <li>Punishment (Xing): {t.xing.replace(/（.*）/, '').replace('相刑', '').replace('三刑', '').replace('自刑', ' (self-punishment)')}</li>
          <li>Harm (Hai): {t.hai.slice(0, 2)}</li>
        </ul>
        <P>See the <Link href={`/en/chinese-zodiac/compatibility`} className="text-[#c2483c] hover:underline underline-offset-2">zodiac compatibility chart</Link> for what these relations mean between birth signs.</P>
      </>
    );
  } else if (category === 'shishen') {
    const e = SHISHEN_EN[name];
    const zh = SHI_SHEN_TERMS.find((x) => x.name === name)!;
    body = (
      <>
        <Facts rows={[['Chinese', name], ['Short form', zh.alias], ['Relation', e.relation]]} />
        <H>Personality</H>
        <P>{e.traits}</P>
        <H>Career</H>
        <P>{e.career}</P>
        <H>Other Ten Gods</H>
        <p className="mt-3 flex flex-wrap gap-2">{SHI_SHEN_TERMS.filter((x) => x.name !== name).map((x) => <Link key={x.name} href={`/en${termPath('shishen', x.name)}`} className="rounded-lg border border-[#efe8dc] bg-white px-3 py-1.5 text-sm text-stone-800 hover:border-[#FF6F61]/50">{SHISHEN_EN[x.name].en}</Link>)}</p>
      </>
    );
  } else if (category === 'jieqi') {
    const t = JIE_QI_TERMS.find((x) => x.name === name)!;
    const y = new Date().getFullYear();
    const times = [y, y + 1].map((yr) => [yr, (() => { const p = collectJieQiPoints(yr, [name]).find((x) => x.time.getFullYear() === yr); return p ? formatLocal(p.time) : '-'; })()] as const);
    body = (
      <>
        <Facts rows={[['Chinese', `${name} (${t.pinyin})`], ['Sun longitude', `${t.longitude}°`], ['Type', t.kind === '节' ? 'Jie (starts a month)' : 'Zhong Qi (mid-month)'], [`${times[0][0]}`, `${times[0][1]} China time`], [`${times[1][0]}`, `${times[1][1]} China time`], ['Month branch', <L key="m" name={t.monthZhi} />]]} />
        <H>In BaZi and divination</H>
        <P>
          {t.kind === '节'
            ? `${SOLAR_TERM_EN[name]} starts the ${BRANCH_ANIMAL[t.monthZhi].name} month (${t.monthZhi}) in BaZi: anyone born after this moment has ${t.monthZhi} as the month branch.${name === '立春' ? ' It is also when the BaZi year changes.' : ''}`
            : `${SOLAR_TERM_EN[name]} is a mid-month term: the month pillar does not change, but Da Liu Ren changes its moon general here, and Qi Men Dun Jia uses it to set the chart number.`}
        </P>
        <P>
          <Link href="/en/tools/almanac" className="text-[#c2483c] hover:underline underline-offset-2">Open the Chinese calendar</Link> to see the solar terms around any date.
        </P>
      </>
    );
  } else {
    const j = jiaZiInfo(name)!;
    const a = BRANCH_ANIMAL[j.zhi.name];
    body = (
      <>
        <Facts rows={[['Number', `${j.index + 1} of 60`], ['Stem', <L key="g" name={j.gan.name} />], ['Branch', <L key="z" name={j.zhi.name} />], ['Na Yin', `${NAYIN_EN[j.naYin]?.name} (${j.naYin})`], ['Void branches', <span key="k">{j.kong.map((x) => <L key={x} name={x} />)}</span>], ['Sitting Ten God', j.zuoShiShen ? SHISHEN_EN[j.zuoShiShen].en : '-']]} />
        <H>Meaning</H>
        <P>
          {name} combines {YY_EN[j.gan.yinYang].toLowerCase()} {WX_EN[j.gan.wx].toLowerCase()} ({STEM_EN[j.gan.name].image}) with the {a.name} branch ({WX_EN[j.zhi.wx].toLowerCase()}). Its Na Yin, {NAYIN_EN[j.naYin]?.name}: {NAYIN_EN[j.naYin]?.meaning}
        </P>
        <P>Hidden stems in {j.zhi.name}: {j.cangGan.map((c, i) => <span key={c.gan}>{i > 0 && ', '}<L name={c.gan} /> ({SHISHEN_EN[c.shiShen]?.en ?? c.shiShen})</span>)}.</P>
        <H>Years</H>
        <P>
          {j.years.map((y, i) => <span key={y}>{i > 0 && ', '}{y >= 1924 && y <= 2043 ? <Link href={`/en/chinese-zodiac/${y}`} className="text-[#c2483c] hover:underline underline-offset-2">{y}</Link> : y}</span>)}
          {' '}(the year starts at the Lunar New Year, or at Li Chun in BaZi).
        </P>
        <P>Next in the cycle: <L name={j.next} />. Previous: <L name={j.prev} />.</P>
      </>
    );
  }

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: `${name} ${pinyinOf(name) || ''}`.trim(),
    description: h.description,
    url,
    inDefinedTermSet: { '@type': 'DefinedTermSet', name: CATEGORY_EN[category].label, url: `${absoluteUrl('en', '/terms')}#${category}` },
    isPartOf: { '@id': WEBSITE_ID },
  };

  return (
    <article lang="en" className="max-w-3xl mx-auto px-5 py-12 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
      <nav aria-label="breadcrumb" className="text-sm text-stone-400">
        <Link href="/en/terms" className="hover:text-[#c2483c]">Glossary</Link>
        <span className="mx-2">/</span>
        <Link href={`/en/terms#${category}`} className="hover:text-[#c2483c]">{CATEGORY_EN[category].label}</Link>
      </nav>
      <div className="mt-6 font-display text-7xl md:text-8xl font-bold leading-none text-stone-900" lang="zh-CN" aria-hidden>{name}</div>
      <h1 className="mt-5 font-display text-2xl md:text-3xl font-bold tracking-tight text-stone-900 text-balance">{h.title}</h1>
      <p className="mt-4 text-[15px] leading-7 text-stone-600">{h.description}</p>
      {body}
      <div className="result-hero relative overflow-hidden mt-12 rounded-2xl px-6 py-5 flex flex-wrap items-center justify-between gap-3">
        <span className="text-stone-600 text-sm">See these terms in your own chart.</span>
        <Link href="/en/tools/bazi" className="rounded-xl bg-[#FF6F61] px-4 py-2 text-sm font-semibold text-white hover:bg-[#f25d4f] transition-colors">Free BaZi calculator</Link>
      </div>
    </article>
  );
}
