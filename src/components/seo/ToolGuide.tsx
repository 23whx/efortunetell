import Link from 'next/link';
import { localeHtmlLang, withLocale, type Locale } from '@/lib/i18n/config';

export type ToolKey = 'bazi' | 'qimen' | 'daliuren' | 'almanac' | 'naming';

type Section = { h: string; p: string[] };
type Guide = { title: string; sections: Section[]; related: Array<[string, string]> };

/**
 * Server-rendered explainer under each tool: what it is, how to use it, how to read the result.
 * Gives search engines / AI assistants real text on otherwise interactive-only pages.
 * Written in zh + en; ja/ko/ar show the English text.
 */
const GUIDES: Record<ToolKey, Record<'zh' | 'en', Guide>> = {
  bazi: {
    zh: {
      title: '关于八字排盘',
      sections: [
        {
          h: '八字是什么',
          p: [
            '八字又称四柱，是把出生的年、月、日、时各用一组天干地支表示，共八个字。以日柱天干为"日主"代表命主本人，其余七字按五行生克与日主的关系定出十神（比劫、食伤、财、官杀、印），是子平命理分析性格、六亲与运势的基础。',
          ],
        },
        {
          h: '本工具如何排盘',
          p: [
            '年柱以立春为界，月柱以"节"（立春、惊蛰、清明……）为界，而不是以农历初一换月；节气时刻取自寿星天文历，精确到分钟。',
            '子时有两种换日方式：选"23点换日"时 23:00 起即算次日；选"0点换日"时 23:00–24:00 为夜子时，日柱仍为当天、时柱用次日子时。两派都有人用，请按你学习的体系选择。',
            '勾选"真太阳时"并填写出生地经度后，会按经度差和均时差修正出生时间，出生地离东经 120° 越远影响越大。',
            '大运按阳男阴女顺排、阴男阳女逆排，起运岁数默认"三天折一年"，也可改用比例法。',
          ],
        },
        {
          h: '怎么看结果',
          p: [
            '每柱下方依次列出藏干及其十神、纳音；"司令"表示出生时月令中当值的人元。大运表给出每步运的干支、十神与交运日期。',
            '排盘只是第一步，判断旺衰、格局与用神需要综合月令、透干与组合，可参考本站的八字专题文章。',
          ],
        },
      ],
      related: [['/terms', '命理术语库'], ['/services/bazi', '八字专题文章'], ['/tools/almanac', '万年历·老黄历'], ['/tools/naming', '八字起名']],
    },
    en: {
      title: 'About the BaZi chart',
      sections: [
        {
          h: 'What BaZi is',
          p: [
            'BaZi ("eight characters"), or the Four Pillars of Destiny, writes the year, month, day and hour of birth as four stem-branch pairs. The day stem is the Day Master; the other characters become Ten Gods by their five-element relation to it. This is the basis of Zi Ping astrology.',
          ],
        },
        {
          h: 'How this calculator works',
          p: [
            'The year changes at Li Chun (Start of Spring) and each month at a solar term, not at the lunar new moon. Solar-term times come from an astronomical calendar and are accurate to the minute.',
            '"Day starts 23:00" treats 23:00 onwards as the next day. "Day starts 00:00" keeps the day pillar on the same date for 23:00–24:00 (late Zi hour) and uses the next day\'s Zi hour stem.',
            'With true solar time and your birthplace longitude, the birth time is corrected for longitude and the equation of time.',
            'Luck cycles run forward for yang-year males and yin-year females and backward otherwise; the starting age uses "three days = one year" by default.',
          ],
        },
        {
          h: 'Reading the result',
          p: [
            'Each pillar lists its hidden stems with their Ten Gods and its Na Yin. "Si Ling" is the stem in command of the birth month. The luck-cycle table shows each decade\'s pillar, Ten God and start date.',
          ],
        },
      ],
      related: [['/services/bazi', 'BaZi articles'], ['/tools/almanac', 'Chinese almanac'], ['/tools/naming', 'Name selection']],
    },
  },
  qimen: {
    zh: {
      title: '关于阴盘奇门',
      sections: [
        {
          h: '阴盘奇门是什么',
          p: [
            '奇门遁甲以九宫为盘，把三奇六仪、九星、八门、八神排入九宫，按起局时刻判断事情的时机与方位。阴盘奇门是近代流行的一派，以起局时的年月日时数定局，排法简明，常用于具体事项的占断。',
          ],
        },
        {
          h: '本工具如何起局',
          p: [
            '阴盘定局：农历年支序数 + 农历月 + 农历日 + 时支序数，除以 9 取余数，余 0 为 9 局。冬至后至夏至前为阳遁，夏至后至冬至前为阴遁。也可切换为拆补法：按所在节气定局，以日柱符头定上中下元。',
            '地盘：戊落局数宫，按戊己庚辛壬癸丁丙乙的顺序沿洛书数序排布，阳遁顺排、阴遁逆排，中五宫寄坤二宫。',
            '值符随时干：旬首所在宫的星为值符，移到时干所在宫，其余八星随之转动。值使随时支：从旬首宫起按时辰数沿九宫数序走到值使门落宫，其余七门依次顺排。八神从时干宫起，阳遁顺时针、阴遁逆时针。',
          ],
        },
        {
          h: '怎么看盘',
          p: [
            '九宫按上南下北排列。每宫自上而下为八神、九星、八门，右下角是天盘干与地盘干。开、休、生为吉门（绿色），死、惊、伤为凶门（红色），杜、景为中平。标"符"的是值符宫，标"使"的是值使门所在宫；刑、墓、迫、空、马分别为六仪击刑、入墓、门迫、空亡与驿马。',
          ],
        },
      ],
      related: [['/services/qimen-yinpan', '阴盘奇门专题'], ['/tools/daliuren', '大六壬起课'], ['/tools/bazi', '八字排盘']],
    },
    en: {
      title: 'About Yin Pan Qimen Dunjia',
      sections: [
        {
          h: 'What it is',
          p: [
            'Qimen Dunjia lays out the Three Wonders and Six Instruments, nine stars, eight doors and eight deities on the nine palaces for a given hour, to judge timing and direction. Yin Pan is a modern school that sets the chart number from the lunar year, month, day and hour.',
          ],
        },
        {
          h: 'How the chart is cast',
          p: [
            'Yin Pan ju = (lunar year branch number + lunar month + lunar day + hour branch number) mod 9, with 0 as 9. Yang Dun runs from the winter solstice to the summer solstice, Yin Dun the other half. Chaibu is also available: the solar term sets the ju and the day pillar\'s Fu Tou sets the yuan.',
            'The earth plate starts Wu in the ju palace and follows the Lo Shu order (forward in Yang Dun, backward in Yin Dun); the centre palace lodges in Kun 2.',
            'The value star moves to the palace of the hour stem; the value door moves by the hour count from the xun head. The eight deities start at the hour-stem palace, clockwise in Yang Dun and counter-clockwise in Yin Dun.',
          ],
        },
        {
          h: 'Reading the board',
          p: [
            'South is at the top. Each palace shows deity, star and door, with heaven and earth stems at the bottom right. Open, Rest and Life are auspicious doors (green); Death, Fear and Harm are inauspicious (red).',
          ],
        },
      ],
      related: [['/services/qimen-yinpan', 'Qimen articles'], ['/tools/daliuren', 'Da Liu Ren'], ['/tools/bazi', 'BaZi chart']],
    },
  },
  daliuren: {
    zh: {
      title: '关于大六壬起课',
      sections: [
        {
          h: '四位课式',
          p: [
            '本工具采用四位课式：以起课时辰与地分为基础，自上而下排出人元、贵神、将神、地分四位，各配五行与旺相休囚死，用来判断所问之事的吉凶与动向。',
          ],
        },
        {
          h: '如何起课',
          p: [
            '月将：默认按中气换将（雨水后登明亥将，春分后河魁戌将……），也可选交节换将。将神由月将加时辰推到地分得出。',
            '地分：可按问事方位或随机选取一个地支。贵神按日干取贵人（甲戊庚牛羊、乙己鼠猴、丙丁猪鸡、壬癸蛇兔、辛马虎），卯酉分昼夜，贵人在亥至辰顺行、在巳至戌逆行。人元由日干五子遁到地分得出。',
          ],
        },
        {
          h: '怎么看课',
          p: [
            '四位各自标出五行与当令旺衰：当令者旺，旺所生者相，生旺者休，克旺者囚，旺所克者死。"五动三动"按四位之间的生克列出妻财、官鬼、子孙、父母、兄弟等动象；标"用"的一位为本课用神。',
          ],
        },
      ],
      related: [['/services/daliuren', '大六壬专题'], ['/tools/qimen', '阴盘奇门'], ['/tools/almanac', '老黄历']],
    },
    en: {
      title: 'About the Da Liu Ren chart',
      sections: [
        {
          h: 'The four positions',
          p: [
            'This tool casts the four-position form: from the hour and a chosen earth branch it derives Ren Yuan (human stem), Gui Shen (noble spirit), Jiang Shen (general) and Di Fen (earth branch), each with its element and seasonal strength.',
          ],
        },
        {
          h: 'How it is cast',
          p: [
            'The moon general changes at the mid-month solar term by default (or at the month term). The general is placed by turning the moon general onto the hour and reading it at the earth branch. The noble spirit follows the day stem, split into day and night at Mao and You.',
          ],
        },
        {
          h: 'Reading the result',
          p: [
            'Strength follows the season: the ruling element is prosperous, what it produces is strong, what produces it rests, what controls it is confined and what it controls is dead. The movement list shows wealth, officer, offspring, parent and sibling movements between positions.',
          ],
        },
      ],
      related: [['/services/daliuren', 'Da Liu Ren articles'], ['/tools/qimen', 'Qimen chart'], ['/tools/almanac', 'Chinese almanac']],
    },
  },
  almanac: {
    zh: {
      title: '关于万年历·老黄历',
      sections: [
        {
          h: '老黄历能查什么',
          p: [
            '每天的农历日期、年月日时四柱与纳音、每日宜忌、冲煞、建除十二值星、二十八宿、值神、月相、彭祖百忌、喜神福神财神方位、胎神占方，以及十二时辰的吉凶宜忌。',
          ],
        },
        {
          h: '怎么用',
          p: [
            '在左侧月历点选日期，或用顶部箭头逐日翻看；每天都有独立网址（如 /zh/tools/almanac/2026-10-14），方便收藏和分享。月历上的小字是农历日期和当天的主要宜事。',
            '择日时先看宜忌是否包含所办之事，再避开与自己生肖相冲的日子（"冲"一栏），最后挑选当天的吉时。',
          ],
        },
        {
          h: '数据来源',
          p: [
            '农历、节气与干支来自寿星天文历算法；宜忌、神煞按传统通书规则推算，"今天"按北京时间计算。',
          ],
        },
      ],
      related: [[`/blog/${encodeURIComponent('2026择日最忌的四个日子')}`, '2026 择日最忌的四个日子'], ['/tools/bazi', '八字排盘'], ['/tools/qimen', '阴盘奇门']],
    },
    en: {
      title: 'About the Chinese almanac',
      sections: [
        {
          h: 'What it shows',
          p: [
            'For every day: lunar date, the four pillars with Na Yin, auspicious and inauspicious activities (yi/ji), the clashing zodiac, the twelve day officers, the 28 lunar mansions, directions of the Joy, Fortune and Wealth gods, and the hour-by-hour outlook.',
          ],
        },
        {
          h: 'How to use it',
          p: [
            'Pick a date on the calendar or step day by day. Each day has its own URL, e.g. /en/tools/almanac/2026-10-14. To choose a date, check that your activity is listed as auspicious, avoid days that clash with your zodiac, then pick a lucky hour.',
          ],
        },
        {
          h: 'Data',
          p: ['Lunar dates, solar terms and pillars come from an astronomical calendar; "today" follows China Standard Time.'],
        },
      ],
      related: [[`/blog/${encodeURIComponent('2026择日最忌的四个日子')}`, 'Date selection: days to avoid in 2026'], ['/tools/bazi', 'BaZi chart'], ['/tools/qimen', 'Qimen chart']],
    },
  },
  naming: {
    zh: {
      title: '关于八字起名',
      sections: [
        {
          h: '起名思路',
          p: [
            '先由出生时间排出八字，统计五行力量（月令权重最高），判断日主强弱：身弱喜生扶（印、比劫），身强喜克泄（财、官、食伤），并优先补足八字中缺失的五行。再从常用字库中挑选五行相符、音形俱佳的字组成双字名，支持复姓。',
          ],
        },
        {
          h: '查字功能',
          p: ['可以查询单个汉字的康熙笔画、五行、部首与结构，每个字都有独立页面，方便取名时逐字比较。'],
        },
        {
          h: '使用提示',
          p: [
            '本工具的喜用神为简化模型，适合作为取名参考。名字还要兼顾读音、字义、家族字辈与地方习惯；需要正式命名可通过邮件预约人工分析。',
          ],
        },
      ],
      related: [['/services/naming', '起名专题'], ['/tools/bazi', '八字排盘'], ['/contact', '联系咨询']],
    },
    en: {
      title: 'About BaZi name selection',
      sections: [
        {
          h: 'How names are chosen',
          p: [
            'The tool casts the BaZi chart, weighs the five elements (the month branch counts most) and judges whether the Day Master is weak or strong. A weak chart favours supporting elements, a strong chart favours draining ones, and missing elements are given priority. It then picks common characters with matching elements to build two-character given names.',
          ],
        },
        {
          h: 'Character lookup',
          p: ['Look up any character\'s Kangxi stroke count, element, radical and structure; each character has its own page.'],
        },
        {
          h: 'Note',
          p: ['The favourable-element model is simplified and meant as a reference. For a formal naming, book a consultation by email.'],
        },
      ],
      related: [['/services/naming', 'Naming articles'], ['/tools/bazi', 'BaZi chart'], ['/contact', 'Contact']],
    },
  },
};

export default function ToolGuide({ tool, locale }: { tool: ToolKey; locale: Locale }) {
  const lang = locale === 'zh' ? 'zh' : 'en';
  const g = GUIDES[tool][lang];
  return (
    <section lang={localeHtmlLang[lang]} className="max-w-6xl mx-auto px-4 pb-16 md:pb-24">
      <div className="border-t border-[#efe8dc] pt-10 md:pt-14 grid lg:grid-cols-[minmax(0,1fr)_260px] gap-10">
        <div className="max-w-3xl">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">{g.title}</h2>
          {g.sections.map((s) => (
            <div key={s.h} className="mt-8">
              <h3 className="text-lg font-semibold text-stone-900">{s.h}</h3>
              {s.p.map((para) => (
                <p key={para} className="mt-3 text-[15px] leading-7 text-stone-600 text-pretty">{para}</p>
              ))}
            </div>
          ))}
        </div>
        <aside className="lg:pt-2">
          <div className="text-xs font-medium tracking-[0.15em] uppercase text-stone-400">{lang === 'zh' ? '延伸阅读' : 'Related'}</div>
          <ul className="mt-4 space-y-2">
            {g.related.map(([href, label]) => (
              <li key={href}>
                <Link href={withLocale(locale, href)} className="group flex items-center justify-between rounded-xl bg-white border border-[#efe8dc] px-4 py-3 text-sm text-stone-700 hover:border-[#FF6F61]/40 hover:text-[#c2483c] transition-colors">
                  {label}
                  <span className="text-stone-300 group-hover:text-[#FF6F61] transition-colors" aria-hidden>→</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
