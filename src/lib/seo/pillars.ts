export type PillarKey = 'bazi' | 'qimen-yinpan' | 'daliuren' | 'fengshui' | 'naming';

export type Pillar = {
  key: PillarKey;
  slug: PillarKey;
  zhTitle: string;
  enTitle: string;
  zhDesc: string;
  enDesc: string;
  category: string; // matches public.articles.category
  keywords: string[];
  keywordKeys: string[];
};

export const PILLARS: Pillar[] = [
  {
    key: 'bazi',
    slug: 'bazi',
    zhTitle: '八字',
    enTitle: 'BaZi (Four Pillars)',
    zhDesc: '系统学习八字：十神、格局、用神与流年实战。',
    enDesc: 'Learn BaZi with practical frameworks: Ten Gods, structures, useful god, and yearly luck.',
    category: '八字',
    keywords: ['bazi', 'four pillars', 'ten gods', '用神', '格局', '流年'],
    keywordKeys: ['keyword.bazi', 'keyword.fourPillars', 'keyword.tenGods', 'keyword.usefulGod', 'keyword.structure', 'keyword.yearlyLuck'],
  },
  {
    key: 'qimen-yinpan',
    slug: 'qimen-yinpan',
    zhTitle: '阴盘奇门',
    enTitle: 'Yin Pan Qi Men Dun Jia',
    zhDesc: '阴盘奇门专题：盘局结构、落宫取象、断事思路与案例。',
    enDesc: 'Yin Pan QMDJ: chart structure, palace interpretation, decision frameworks, and examples.',
    category: '阴盘奇门',
    keywords: ['qimen', 'qimen dunjia', 'yin pan', '奇门遁甲', '阴盘奇门'],
    keywordKeys: ['keyword.qimen', 'keyword.qimenDunjia', 'keyword.yinPan', 'keyword.yinPanQimen'],
  },
  {
    key: 'daliuren',
    slug: 'daliuren',
    zhTitle: '大六壬',
    enTitle: 'Da Liu Ren',
    zhDesc: '六壬预测：神将取象、定成败和应期。',
    enDesc: 'Da Liu Ren: 3 transmissions/4 lessons, spirits & generals, timing, and real cases.',
    category: '大六壬',
    keywords: ['da liu ren', '六壬', '神将', '应期'],
    keywordKeys: ['keyword.daLiuRen', 'keyword.liuRen', 'keyword.spiritsGenerals', 'keyword.timing'],
  },
  {
    key: 'fengshui',
    slug: 'fengshui',
    zhTitle: '风水',
    enTitle: 'Feng Shui',
    zhDesc: '从形势到理气：宅运、飞星、布局与避坑清单。',
    enDesc: 'From form to formulas: house luck, flying stars, layout, and practical checklists.',
    category: '风水',
    keywords: ['feng shui', '飞星', '宅运', '阳宅', '布局'],
    keywordKeys: ['keyword.fengShui', 'keyword.flyingStars', 'keyword.houseLuck', 'keyword.yangZhai', 'keyword.layout'],
  },
  {
    key: 'naming',
    slug: 'naming',
    zhTitle: '起名',
    enTitle: 'Name Selection',
    zhDesc: '起名方法论：五行补偏、音形义与避雷规则。',
    enDesc: 'Name selection: balancing elements, phonetics/meaning, and practical do & don’t.',
    category: '起名',
    keywords: ['name selection', '起名', '姓名学', '五行', '补偏'],
    keywordKeys: ['keyword.nameSelection', 'keyword.naming', 'keyword.nameology', 'keyword.fiveElements', 'keyword.balancing'],
  },
];

export function getPillarBySlug(slug: string) {
  return PILLARS.find((p) => p.slug === slug) ?? null;
}
