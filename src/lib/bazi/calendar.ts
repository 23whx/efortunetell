/**
 * 八字计算库 - 天干地支万年历
 * 基于农历算法实现，无需依赖外部API
 */

// 天干
export const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支
export const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 五行
export const FIVE_ELEMENTS: Record<string, string> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水'
};

// 十二生肖
export const ZODIAC_ANIMALS = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

/**
 * 计算年柱（基于公历年份）
 */
export function getYearPillar(year: number, month: number): { stem: string; branch: string; zodiac: string } {
  // 如果是1月或2月初，可能还在上一年的农历年
  // 简化处理：立春前算上一年
  const springStartMonth = 2; // 2月为立春月份（简化）
  const adjustedYear = month < springStartMonth ? year - 1 : year;
  
  // 公元4年为甲子年（天干地支纪年的起点）
  const baseYear = 4;
  const yearOffset = adjustedYear - baseYear;
  
  const stemIndex = yearOffset % 10;
  const branchIndex = yearOffset % 12;
  
  return {
    stem: HEAVENLY_STEMS[stemIndex < 0 ? stemIndex + 10 : stemIndex],
    branch: EARTHLY_BRANCHES[branchIndex < 0 ? branchIndex + 12 : branchIndex],
    zodiac: ZODIAC_ANIMALS[branchIndex < 0 ? branchIndex + 12 : branchIndex]
  };
}

/**
 * 简化的节气日期表（每月大致节气日期）
 * 用于确定月支（实际应该精确计算节气，这里用近似值）
 */
const SOLAR_TERMS_APPROX = [
  { month: 1, day: 5, branch: 1 },    // 小寒，进入丑月
  { month: 2, day: 4, branch: 2 },    // 立春，进入寅月
  { month: 3, day: 6, branch: 3 },    // 惊蛰，进入卯月
  { month: 4, day: 5, branch: 4 },    // 清明，进入辰月
  { month: 5, day: 6, branch: 5 },    // 立夏，进入巳月
  { month: 6, day: 6, branch: 6 },    // 芒种，进入午月
  { month: 7, day: 7, branch: 7 },    // 小暑，进入未月
  { month: 8, day: 8, branch: 8 },    // 立秋，进入申月
  { month: 9, day: 8, branch: 9 },    // 白露，进入酉月
  { month: 10, day: 8, branch: 10 },  // 寒露，进入戌月
  { month: 11, day: 7, branch: 11 },  // 立冬，进入亥月
  { month: 12, day: 7, branch: 0 },   // 大雪，进入子月
];

/**
 * 计算月柱（基于年干和节气）
 */
export function getMonthPillar(year: number, month: number, day: number): { stem: string; branch: string } {
  const yearPillar = getYearPillar(year, month);
  const yearStemIndex = HEAVENLY_STEMS.indexOf(yearPillar.stem);
  
  // 根据节气确定月支
  let monthBranchIndex = 2; // 默认寅月（立春后）
  
  // 简化处理：根据公历月份和日期判断节气
  for (let i = 0; i < SOLAR_TERMS_APPROX.length; i++) {
    const term = SOLAR_TERMS_APPROX[i];
    if (month < term.month || (month === term.month && day < term.day)) {
      // 还没到这个节气，用上一个月支
      monthBranchIndex = i === 0 ? SOLAR_TERMS_APPROX[SOLAR_TERMS_APPROX.length - 1].branch : SOLAR_TERMS_APPROX[i - 1].branch;
      break;
    }
    if (month === term.month && day >= term.day) {
      monthBranchIndex = term.branch;
    }
    if (i === SOLAR_TERMS_APPROX.length - 1 && (month > term.month || (month === term.month && day >= term.day))) {
      monthBranchIndex = term.branch;
    }
  }
  
  const monthBranch = EARTHLY_BRANCHES[monthBranchIndex];
  
  // 月干计算公式：甲己之年丙作首，乙庚之年戊为头，丙辛之岁寻庚上，丁壬壬寅顺水流，若问戊癸何方发，甲寅之上好追求
  // 意思是：甲年和己年的寅月起丙，乙年和庚年的寅月起戊，丙年和辛年的寅月起庚，丁年和壬年的寅月起壬，戊年和癸年的寅月起甲
  
  let monthStemStart: number;
  if (yearStemIndex === 0 || yearStemIndex === 5) {
    monthStemStart = 2; // 甲、己年，寅月起丙
  } else if (yearStemIndex === 1 || yearStemIndex === 6) {
    monthStemStart = 4; // 乙、庚年，寅月起戊
  } else if (yearStemIndex === 2 || yearStemIndex === 7) {
    monthStemStart = 6; // 丙、辛年，寅月起庚
  } else if (yearStemIndex === 3 || yearStemIndex === 8) {
    monthStemStart = 8; // 丁、壬年，寅月起壬
  } else {
    monthStemStart = 0; // 戊、癸年，寅月起甲
  }
  
  // 从寅月(index=2)开始计算偏移
  const offsetFromYin = (monthBranchIndex - 2 + 12) % 12;
  const monthStemIndex = (monthStemStart + offsetFromYin) % 10;
  const monthStem = HEAVENLY_STEMS[monthStemIndex];
  
  return {
    stem: monthStem,
    branch: monthBranch
  };
}

/**
 * 计算日柱（从基准日期推算）
 * 基准：2025年12月31日 = 甲戌日（用户提供的准确日期）
 */
export function getDayPillar(year: number, month: number, day: number): { stem: string; branch: string } {
  // 计算从基准日期到目标日期的天数
  const baseDate = new Date(2025, 11, 31); // 2025年12月31日（月份是0-based，所以11表示12月）
  const targetDate = new Date(year, month - 1, day);
  const daysDiff = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // 2025年12月31日是甲戌日
  // 甲 = 0 (在天干数组中的索引), 戌 = 10 (在地支数组中的索引)
  const baseStemIndex = 0;  // 甲
  const baseBranchIndex = 10; // 戌
  
  let stemIndex = (baseStemIndex + daysDiff) % 10;
  let branchIndex = (baseBranchIndex + daysDiff) % 12;
  
  // 处理负数情况
  if (stemIndex < 0) stemIndex += 10;
  if (branchIndex < 0) branchIndex += 12;
  
  return {
    stem: HEAVENLY_STEMS[stemIndex],
    branch: EARTHLY_BRANCHES[branchIndex]
  };
}

/**
 * 计算时柱（基于日干和时辰）
 */
export function getHourPillar(year: number, month: number, day: number, hour: number): { stem: string; branch: string } {
  const dayPillar = getDayPillar(year, month, day);
  const dayStemIndex = HEAVENLY_STEMS.indexOf(dayPillar.stem);
  
  // 时支：子时(23-1)、丑时(1-3)、寅时(3-5)...
  let hourBranchIndex: number;
  if (hour >= 23 || hour < 1) hourBranchIndex = 0; // 子
  else hourBranchIndex = Math.floor((hour + 1) / 2);
  
  const hourBranch = EARTHLY_BRANCHES[hourBranchIndex];
  
  // 时干计算公式：甲己还生甲，乙庚丙作初，丙辛从戊起，丁壬庚子居，戊癸何方发，壬子是真途
  // 即：子时的天干起点
  const hourStemStartMap: Record<number, number> = {
    0: 0,  // 甲日，子时起甲
    1: 2,  // 乙日，子时起丙
    2: 4,  // 丙日，子时起戊
    3: 6,  // 丁日，子时起庚
    4: 8,  // 戊日，子时起壬
    5: 0,  // 己日，子时起甲
    6: 2,  // 庚日，子时起丙
    7: 4,  // 辛日，子时起戊
    8: 6,  // 壬日，子时起庚
    9: 8,  // 癸日，子时起壬
  };
  
  const hourStemStart = hourStemStartMap[dayStemIndex];
  const hourStemIndex = (hourStemStart + hourBranchIndex) % 10;
  const hourStem = HEAVENLY_STEMS[hourStemIndex];
  
  return {
    stem: hourStem,
    branch: hourBranch
  };
}

/**
 * 完整八字接口
 */
export interface BaZi {
  year: { stem: string; branch: string; pillar: string; zodiac: string };
  month: { stem: string; branch: string; pillar: string };
  day: { stem: string; branch: string; pillar: string };
  hour: { stem: string; branch: string; pillar: string };
  elements: {
    year: { stem: string; branch: string };
    month: { stem: string; branch: string };
    day: { stem: string; branch: string };
    hour: { stem: string; branch: string };
  };
  input: {
    datetime: string;
    year: number;
    month: number;
    day: number;
    hour: number;
  };
}

/**
 * 根据公历日期时间生成八字
 */
export function calculateBaZi(datetime: Date | string): BaZi {
  const date = typeof datetime === 'string' ? new Date(datetime) : datetime;
  
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  
  const yearPillar = getYearPillar(year, month);
  const monthPillar = getMonthPillar(year, month, day);
  const dayPillar = getDayPillar(year, month, day);
  const hourPillar = getHourPillar(year, month, day, hour);
  
  return {
    year: {
      stem: yearPillar.stem,
      branch: yearPillar.branch,
      pillar: `${yearPillar.stem}${yearPillar.branch}`,
      zodiac: yearPillar.zodiac
    },
    month: {
      stem: monthPillar.stem,
      branch: monthPillar.branch,
      pillar: `${monthPillar.stem}${monthPillar.branch}`
    },
    day: {
      stem: dayPillar.stem,
      branch: dayPillar.branch,
      pillar: `${dayPillar.stem}${dayPillar.branch}`
    },
    hour: {
      stem: hourPillar.stem,
      branch: hourPillar.branch,
      pillar: `${hourPillar.stem}${hourPillar.branch}`
    },
    elements: {
      year: {
        stem: FIVE_ELEMENTS[yearPillar.stem] || '',
        branch: FIVE_ELEMENTS[yearPillar.branch] || ''
      },
      month: {
        stem: FIVE_ELEMENTS[monthPillar.stem] || '',
        branch: FIVE_ELEMENTS[monthPillar.branch] || ''
      },
      day: {
        stem: FIVE_ELEMENTS[dayPillar.stem] || '',
        branch: FIVE_ELEMENTS[dayPillar.branch] || ''
      },
      hour: {
        stem: FIVE_ELEMENTS[hourPillar.stem] || '',
        branch: FIVE_ELEMENTS[hourPillar.branch] || ''
      }
    },
    input: {
      datetime: date.toISOString(),
      year,
      month,
      day,
      hour
    }
  };
}

/**
 * 格式化八字为字符串
 */
export function formatBaZi(bazi: BaZi): string {
  return `${bazi.year.pillar} ${bazi.month.pillar} ${bazi.day.pillar} ${bazi.hour.pillar}`;
}

/**
 * 获取八字的五行统计
 */
export function getElementsCount(bazi: BaZi): Record<string, number> {
  const elements = ['木', '火', '土', '金', '水'];
  const count: Record<string, number> = {};
  
  elements.forEach(element => {
    count[element] = 0;
  });
  
  // 统计八个字的五行
  Object.values(bazi.elements).forEach(pillar => {
    if (pillar.stem) count[pillar.stem] = (count[pillar.stem] || 0) + 1;
    if (pillar.branch) count[pillar.branch] = (count[pillar.branch] || 0) + 1;
  });
  
  return count;
}

