import { EARTHLY_BRANCHES, HEAVENLY_STEMS, getYearPillar } from './calendar';

export type Gender = 'male' | 'female';

export type DayunItem = {
  index: number;
  pillar: string;
  stem: string;
  branch: string;
  startYear: number;
  endYear: number;
  startAge: number;
  endAge: number;
};

// calendar.ts 里的节气近似表（只用于“起运”粗算）
const SOLAR_TERMS_APPROX = [
  { month: 1, day: 5 },  // 小寒
  { month: 2, day: 4 },  // 立春
  { month: 3, day: 6 },  // 惊蛰
  { month: 4, day: 5 },  // 清明
  { month: 5, day: 6 },  // 立夏
  { month: 6, day: 6 },  // 芒种
  { month: 7, day: 7 },  // 小暑
  { month: 8, day: 8 },  // 立秋
  { month: 9, day: 8 },  // 白露
  { month: 10, day: 8 }, // 寒露
  { month: 11, day: 7 }, // 立冬
  { month: 12, day: 7 }, // 大雪
];

function isYangStem(stem: string): boolean {
  const idx = HEAVENLY_STEMS.indexOf(stem);
  // 甲丙戊庚壬为阳（索引 0,2,4,6,8）
  return idx % 2 === 0;
}

/**
 * 计算大运顺逆（传统规则简化版）
 * - 阳年男顺女逆
 * - 阴年男逆女顺
 */
export function getDayunDirection(yearStem: string, gender: Gender): 1 | -1 {
  const yang = isYangStem(yearStem);
  if (gender === 'male') return yang ? 1 : -1;
  return yang ? -1 : 1;
}

function findNextTermDate(birth: Date): Date {
  const y = birth.getFullYear();
  for (const t of SOLAR_TERMS_APPROX) {
    const d = new Date(y, t.month - 1, t.day, 0, 0, 0);
    if (d.getTime() > birth.getTime()) return d;
  }
  // next year
  const first = SOLAR_TERMS_APPROX[0];
  return new Date(y + 1, first.month - 1, first.day, 0, 0, 0);
}

function findPrevTermDate(birth: Date): Date {
  const y = birth.getFullYear();
  for (let i = SOLAR_TERMS_APPROX.length - 1; i >= 0; i--) {
    const t = SOLAR_TERMS_APPROX[i];
    const d = new Date(y, t.month - 1, t.day, 0, 0, 0);
    if (d.getTime() < birth.getTime()) return d;
  }
  // prev year
  const last = SOLAR_TERMS_APPROX[SOLAR_TERMS_APPROX.length - 1];
  return new Date(y - 1, last.month - 1, last.day, 0, 0, 0);
}

/**
 * 起运年龄（粗算）：出生到下一/上一节气的天数 ÷ 3
 * 说明：由于当前项目节气为近似表，这里返回的是“近似起运年龄”，用于趋势图展示。
 */
export function getStartLuckAgeYears(birth: Date, direction: 1 | -1): number {
  const ref = direction === 1 ? findNextTermDate(birth) : findPrevTermDate(birth);
  const days = Math.abs(ref.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.min(10, days / 3));
}

function advancePillar(stem: string, branch: string, direction: 1 | -1, steps: number): { stem: string; branch: string; pillar: string } {
  const stemIdx = HEAVENLY_STEMS.indexOf(stem);
  const branchIdx = EARTHLY_BRANCHES.indexOf(branch);
  const nextStem = HEAVENLY_STEMS[(stemIdx + direction * steps + 1000) % 10];
  const nextBranch = EARTHLY_BRANCHES[(branchIdx + direction * steps + 1000) % 12];
  return { stem: nextStem, branch: nextBranch, pillar: `${nextStem}${nextBranch}` };
}

/**
 * 生成大运列表（10 年一柱），用于“走势报告”
 * - 以月柱为基准，第一步大运为月柱顺/逆推 1
 */
export function generateDayun(params: {
  birthDateTime: Date;
  gender: Gender;
  monthPillar: { stem: string; branch: string };
  steps?: number; // 默认 9 步（约 90 年）
}): { direction: 1 | -1; startAgeYears: number; items: DayunItem[] } {
  const { birthDateTime, gender, monthPillar, steps = 9 } = params;
  const y = birthDateTime.getFullYear();
  const yearStem = getYearPillar(y, birthDateTime.getMonth() + 1).stem;
  const direction = getDayunDirection(yearStem, gender);
  const startAgeYears = getStartLuckAgeYears(birthDateTime, direction);

  // 起运年份（粗算）：出生年份 + 四舍五入的起运年龄
  const startYear = y + Math.round(startAgeYears);

  const items: DayunItem[] = [];
  for (let i = 0; i < steps; i++) {
    const p = advancePillar(monthPillar.stem, monthPillar.branch, direction, i + 1);
    const sy = startYear + i * 10;
    const ey = sy + 9;
    const sa = Math.round((startAgeYears + i * 10) * 10) / 10;
    const ea = Math.round((startAgeYears + (i + 1) * 10) * 10) / 10;
    items.push({
      index: i + 1,
      pillar: p.pillar,
      stem: p.stem,
      branch: p.branch,
      startYear: sy,
      endYear: ey,
      startAge: sa,
      endAge: ea,
    });
  }

  return { direction, startAgeYears, items };
}


