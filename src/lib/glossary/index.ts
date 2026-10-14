import { DI_ZHI_TERMS, JIE_QI_TERMS, SHI_SHEN_TERMS, TIAN_GAN_TERMS } from './data';
import { JIA_ZI } from './jiazi';

export * from './data';
export * from './jiazi';

export const TERM_CATEGORIES = {
  tiangan: { label: '十天干', intro: '甲乙丙丁戊己庚辛壬癸十个天干，按阴阳五行分为五组，是干支纪年与八字命理的基础符号。', names: TIAN_GAN_TERMS.map((t) => t.name) },
  dizhi: { label: '十二地支', intro: '子丑寅卯辰巳午未申酉戌亥十二地支，对应十二生肖、十二个月与十二时辰，地支中藏有天干（藏干）。', names: DI_ZHI_TERMS.map((t) => t.name) },
  shishen: { label: '十神', intro: '以日主为中心，按五行生克与阴阳异同得出的十种关系，是八字分析性格、六亲与事业的核心工具。', names: SHI_SHEN_TERMS.map((t) => t.name) },
  jieqi: { label: '二十四节气', intro: '按太阳黄经每 15° 划分的二十四个节气。八字以"节"换月、以立春换年，奇门以节气定局，六壬以中气换月将。', names: JIE_QI_TERMS.map((t) => t.name) },
  jiazi: { label: '六十甲子', intro: '十天干与十二地支依次相配形成的六十组干支，用于纪年、纪月、纪日、纪时，每组干支各有纳音五行。', names: JIA_ZI },
} as const;

export type TermCategory = keyof typeof TERM_CATEGORIES;

export function isTermCategory(v: string): v is TermCategory {
  return v in TERM_CATEGORIES;
}

export function termPath(category: TermCategory, name: string): string {
  return `/terms/${category}/${encodeURIComponent(name)}`;
}

/** Find which category a plain term name belongs to (for cross-links); 干支 two-char names go to 六十甲子 */
export function categoryOf(name: string): TermCategory | null {
  for (const [cat, def] of Object.entries(TERM_CATEGORIES) as Array<[TermCategory, (typeof TERM_CATEGORIES)[TermCategory]]>) {
    if ((def.names as readonly string[]).includes(name)) return cat;
  }
  return null;
}
