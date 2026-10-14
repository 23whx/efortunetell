import { CANG_GAN, JIA_ZI, NAYIN, SHISHEN_MATRIX, XUN_KONG } from '@/lib/paipan/bazi/constants';
import { DI_ZHI_TERMS, TIAN_GAN_TERMS, type DiZhiTerm, type TianGanTerm } from './data';

const ZHI = '子丑寅卯辰巳午未申酉戌亥';
const CHANG_SHENG_STAGES = ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'] as const;

export const CHANG_SHENG_MEANING: Record<(typeof CHANG_SHENG_STAGES)[number], string> = {
  长生: '如人初生，生机萌发，主根基好、有发展潜力',
  沐浴: '如婴儿沐浴，柔弱而易受影响，主多情、好变化',
  冠带: '如少年加冠，渐趋成熟，主上进、重仪表',
  临官: '如成年任官，力量充足，主自立、有能力（即"禄"）',
  帝旺: '如壮年鼎盛，力量最强，主刚强、自信，过则易刚愎',
  衰: '如盛极而衰，力量渐退，主稳重保守',
  病: '如人生病，气力不足，主多思虑',
  死: '如气息已尽，主沉静、内敛',
  墓: '如入库收藏，主积蓄、内藏，也主固执',
  绝: '如形体断绝，主变动、独立，易有转折',
  胎: '如受胎孕育，主新的开始与可能',
  养: '如在母腹中养育，主得庇护、渐成形',
};

const GAN_HE: Record<string, string> = { 甲: '己', 己: '甲', 乙: '庚', 庚: '乙', 丙: '辛', 辛: '丙', 丁: '壬', 壬: '丁', 戊: '癸', 癸: '戊' };
const GAN_CHONG: Record<string, string> = { 甲: '庚', 庚: '甲', 乙: '辛', 辛: '乙', 丙: '壬', 壬: '丙', 丁: '癸', 癸: '丁' };
const ZHI_HE: Record<string, string> = { 子: '丑', 丑: '子', 寅: '亥', 亥: '寅', 卯: '戌', 戌: '卯', 辰: '酉', 酉: '辰', 巳: '申', 申: '巳', 午: '未', 未: '午' };
const ZHI_CHONG: Record<string, string> = { 子: '午', 午: '子', 丑: '未', 未: '丑', 寅: '申', 申: '寅', 卯: '酉', 酉: '卯', 辰: '戌', 戌: '辰', 巳: '亥', 亥: '巳' };

export function changShengStage(gan: TianGanTerm, zhi: string): (typeof CHANG_SHENG_STAGES)[number] {
  const start = ZHI.indexOf(gan.changSheng);
  const at = ZHI.indexOf(zhi);
  // 阳干顺行、阴干逆行
  const step = gan.yinYang === '阳' ? (at - start + 12) % 12 : (start - at + 12) % 12;
  return CHANG_SHENG_STAGES[step];
}

/** 与五行关系描述：干支同气 / 干生支 / 支生干 / 干克支 / 支克干 */
function ganZhiRelation(gan: TianGanTerm, zhi: DiZhiTerm): string {
  const SHENG: Record<string, string> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
  const KE: Record<string, string> = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };
  if (gan.wx === zhi.wx) return `干支同为${gan.wx}，天干坐地支本气之上，称为"干支同气"，根基稳固`;
  if (SHENG[zhi.wx] === gan.wx) return `地支${zhi.wx}生天干${gan.wx}，为"坐下印"，天干得地支生扶`;
  if (SHENG[gan.wx] === zhi.wx) return `天干${gan.wx}生地支${zhi.wx}，天干之气向下流泄`;
  if (KE[gan.wx] === zhi.wx) return `天干${gan.wx}克地支${zhi.wx}，天干坐于财地`;
  return `地支${zhi.wx}克天干${gan.wx}，天干坐于官杀之地，受到制约`;
}

export interface JiaZiInfo {
  name: string;
  index: number;
  gan: TianGanTerm;
  zhi: DiZhiTerm;
  naYin: string;
  xun: string;
  kong: [string, string];
  stage: (typeof CHANG_SHENG_STAGES)[number];
  zuoShiShen: string;
  cangGan: Array<{ gan: string; shiShen: string }>;
  relation: string;
  tianKeDiChong: string | null;
  tianHeDiHe: string;
  years: number[];
  prev: string;
  next: string;
}

export function jiaZiInfo(name: string): JiaZiInfo | null {
  const index = JIA_ZI.indexOf(name);
  if (index < 0) return null;
  const gan = TIAN_GAN_TERMS.find((t) => t.name === name[0])!;
  const zhi = DI_ZHI_TERMS.find((t) => t.name === name[1])!;
  const xun = JIA_ZI[index - (index % 10)];
  const cg = CANG_GAN[zhi.name] || [];
  const chongGan = GAN_CHONG[gan.name];
  const years: number[] = [];
  for (let y = 1900; y <= 2100; y++) if ((((y - 4) % 60) + 60) % 60 === index) years.push(y);
  return {
    name,
    index,
    gan,
    zhi,
    naYin: NAYIN[name] || '',
    xun,
    kong: XUN_KONG[xun] || ['', ''],
    stage: changShengStage(gan, zhi.name),
    zuoShiShen: SHISHEN_MATRIX[gan.name][cg[0]] || '',
    cangGan: cg.map((g) => ({ gan: g, shiShen: g === gan.name ? '比肩' : SHISHEN_MATRIX[gan.name][g] })),
    relation: ganZhiRelation(gan, zhi),
    tianKeDiChong: chongGan ? chongGan + ZHI_CHONG[zhi.name] : null,
    tianHeDiHe: GAN_HE[gan.name] + ZHI_HE[zhi.name],
    years,
    prev: JIA_ZI[(index + 59) % 60],
    next: JIA_ZI[(index + 1) % 60],
  };
}

export { JIA_ZI };
