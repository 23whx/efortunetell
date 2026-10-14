/**
 * 八字排盘引擎（前端）
 * 四柱历法：统一走 @/lib/paipan/calendar（lunar-javascript）
 * - 1994-10-26 日柱 = 乙酉（勿再用错误的「壬子锚点」）
 * - 早晚子：EightChar.setSect(1 晚子 / 2 早子)
 * 大运/司令/藏干十神：易世家规格表
 */
import {
  findJieContext as findJieContextShared,
  formatDateOnly,
  formatLocal,
  fourPillarsFromLunar,
  jieQiTableForYear,
  parseCivilDatetime as parseCivilDatetimeShared,
  trueSolarAdjust,
} from '@/lib/paipan/calendar';
import {
  CANG_GAN,
  GAN_WX,
  isYangGan,
  JIA_ZI,
  JIE_TO_MONTH_ZHI,
  NAYIN,
  SHISHEN_MATRIX,
  SI_LING,
  XUN_KONG,
  ZHI_WX,
  ZODIAC,
} from './constants';
import type {
  BaZiChart,
  BaZiInput,
  DaYunCycle,
  DayunDirection,
  PillarView,
  SiLingInfo,
  TermPoint,
  ZiMode,
} from './types';

function gzIndex(gz: string): number {
  return JIA_ZI.indexOf(gz);
}

function shiShen(dayGan: string, target: string): string {
  if (dayGan === target) return '日主';
  return SHISHEN_MATRIX[dayGan]?.[target] || '';
}

function xunShouOf(gz: string): string {
  const idx = gzIndex(gz);
  return JIA_ZI[idx - (idx % 10)];
}

function xunKongOf(gz: string): [string, string] {
  return XUN_KONG[xunShouOf(gz)] || ['', ''];
}

function findJieContext(dt: Date): {
  prev: { name: string; time: Date };
  next: { name: string; time: Date };
} {
  const jieNames = JIE_TO_MONTH_ZHI.map(([n]) => n);
  return findJieContextShared(dt, jieNames);
}

function toTermPoint(p: { name: string; time: Date }): TermPoint {
  return { name: p.name, time: formatLocal(p.time) };
}

function pillarView(
  p: { gan: string; zhi: string; ganZhi: string },
  dayGan: string
): PillarView {
  const cg = CANG_GAN[p.zhi] || [];
  return {
    gan: p.gan,
    zhi: p.zhi,
    ganZhi: p.ganZhi,
    cangGan: cg,
    shiShenOnGan: p.gan === dayGan ? '日主' : shiShen(dayGan, p.gan),
    shiShenOnCangGan: cg.map((g) => shiShen(dayGan, g)),
    naYin: NAYIN[p.ganZhi] || '',
    wuxingGan: GAN_WX[p.gan] || '',
    wuxingZhi: ZHI_WX[p.zhi] || '',
  };
}

function dayunDirection(yearGan: string, gender: 'male' | 'female'): DayunDirection {
  const yang = isYangGan(yearGan);
  const male = gender === 'male';
  return (yang && male) || (!yang && !male) ? 'forward' : 'backward';
}

function buildSiLing(monthZhi: string, dayInJie: number, dayGan: string): SiLingInfo {
  const table = SI_LING[monthZhi] || [{ gan: CANG_GAN[monthZhi]?.[0] || '', days: 30 }];
  let remain = Math.max(1, dayInJie);
  let chosen = table[table.length - 1].gan;
  let label = '';
  let acc = 0;
  for (const seg of table) {
    acc += seg.days;
    if (remain <= acc) {
      chosen = seg.gan;
      label = `${seg.gan}当令（本段${seg.days}日）`;
      break;
    }
  }
  if (!label) label = `${chosen}当令`;
  return {
    gan: chosen,
    shiShen: shiShen(dayGan, chosen),
    dayInJie: Math.max(1, dayInJie),
    segmentLabel: label,
    table,
  };
}

function yearsToYMD(startYears: number): { y: number; m: number; d: number } {
  const y = Math.floor(startYears);
  const monthF = (startYears - y) * 12;
  const m = Math.floor(monthF);
  const d = Math.max(0, Math.round((monthF - m) * 30));
  return { y, m, d };
}

function addYMD(base: Date, y: number, m: number, d: number): Date {
  const out = new Date(base.getTime());
  out.setFullYear(out.getFullYear() + y);
  out.setMonth(out.getMonth() + m);
  out.setDate(out.getDate() + d);
  return out;
}

export function chartBazi(input: BaZiInput): BaZiChart {
  const minute = input.minute ?? 0;
  const ziMode: ZiMode = input.ziMode ?? 'late';
  const useTrueSolar = Boolean(input.useTrueSolarTime);
  const pdy = Boolean(input.pdy);

  const civil = new Date(input.year, input.month - 1, input.day, input.hour, minute, 0);
  let used = civil;
  if (useTrueSolar && typeof input.longitude === 'number') {
    used = trueSolarAdjust(civil, input.longitude);
  }

  const pillars = fourPillarsFromLunar(used, ziMode);
  const y = pillars.year;
  const m = pillars.month;
  const d = pillars.day;
  const h = pillars.hour;

  const { prev, next } = findJieContext(used);
  const direction = dayunDirection(y.gan, input.gender);

  const deltaMs =
    direction === 'forward'
      ? next.time.getTime() - used.getTime()
      : used.getTime() - prev.time.getTime();
  const deltaDays = Math.max(deltaMs / 86400000, 0);

  let startYears: number;
  if (pdy) {
    const w = Math.max((used.getTime() - prev.time.getTime()) / 86400000, 0);
    const s = Math.max((next.time.getTime() - used.getTime()) / 86400000, 0);
    const sum = s + w;
    startYears = sum > 0 ? (direction === 'forward' ? (10 * s) / sum : (10 * w) / sum) : 0;
  } else {
    // 三天折一年
    startYears = deltaDays / 3;
  }

  const ymd = yearsToYMD(startYears);
  const qiyunDate = addYMD(civil, ymd.y, ymd.m, ymd.d);
  const dayGan = d.gan;

  // 司令：节后第几天（按日历日差 + 1）
  const dayInJie =
    Math.floor((used.getTime() - prev.time.getTime()) / 86400000) + 1;
  const siLing = buildSiLing(m.zhi, dayInJie, dayGan);

  // 大运序列
  const monthIdx = gzIndex(m.ganZhi);
  const cycles: DaYunCycle[] = [];
  for (let i = 0; i < 8; i++) {
    const step = i + 1;
    const j =
      direction === 'forward'
        ? (monthIdx + step) % 60
        : (((monthIdx - step) % 60) + 60) % 60;
    const gz = JIA_ZI[j];
    const startAge = Math.round((startYears + i * 10) * 100) / 100;
    const endAge = Math.round((startYears + (i + 1) * 10) * 100) / 100;
    const startDt = addYMD(qiyunDate, i * 10, 0, 0);
    const endDt = addYMD(qiyunDate, (i + 1) * 10, 0, 0);
    cycles.push({
      index: i,
      ganZhi: gz,
      gan: gz[0],
      zhi: gz[1],
      naYin: NAYIN[gz] || '',
      shiShenOnGan: shiShen(dayGan, gz[0]),
      cangGan: CANG_GAN[gz[1]] || [],
      startAge,
      endAge,
      startDate: formatDateOnly(startDt),
      endDate: formatDateOnly(endDt),
      jiaoYunDate: formatDateOnly(startDt),
    });
  }

  const yearView = pillarView(y, dayGan);
  const monthView = pillarView(m, dayGan);
  const dayView = pillarView(d, dayGan);
  const hourView = pillarView(h, dayGan);

  const lichunTable = jieQiTableForYear(used.getFullYear());
  const lichunDt = lichunTable['立春'];

  // 是否正值节气时刻（全 24 节气，前后 1 分钟）
  let onTerm: string | null = null;
  const allTerms = jieQiTableForYear(used.getFullYear());
  for (const [name, t] of Object.entries(allTerms)) {
    if (Math.abs(t.getTime() - used.getTime()) < 60 * 1000) {
      onTerm = name;
      break;
    }
  }

  return {
    meta: {
      product: '子平八字 · 本地计算',
      inputCivil: formatLocal(civil),
      usedDatetime: formatLocal(used),
      timezone: 'Asia/Shanghai',
      sect: {
        ziMode,
        useTrueSolarTime: useTrueSolar,
        pdy,
        yearBoundary: 'lichun',
        monthBoundary: 'jie',
      },
      gender: input.gender,
      longitude: input.longitude ?? null,
      latitude: input.latitude ?? null,
      prevJie: toTermPoint(prev),
      nextJie: toTermPoint(next),
      liChun: lichunDt
        ? { name: '立春', time: formatLocal(lichunDt) }
        : null,
      birthSolarTerms: {
        prev: toTermPoint(prev),
        next: toTermPoint(next),
        onTerm,
      },
      engineNote:
        '立春换年、节令换月，节气时刻取自寿星天文历；司令按人元司令分野表，三天折一年起运。',
    },
    siZhu: {
      year: yearView,
      month: monthView,
      day: dayView,
      hour: hourView,
    },
    formatted: `${yearView.ganZhi} ${monthView.ganZhi} ${dayView.ganZhi} ${hourView.ganZhi}`,
    xunKong: xunKongOf(dayView.ganZhi),
    xunShou: xunShouOf(dayView.ganZhi),
    zodiac: ZODIAC[yearView.zhi] || '',
    siLing,
    daYun: {
      direction,
      directionLabel: direction === 'forward' ? '顺行' : '逆行',
      startAgeYears: Math.round(startYears * 100) / 100,
      startAgeText: `${ymd.y}年${ymd.m}个月${ymd.d}天`,
      qiyunDate: formatDateOnly(qiyunDate),
      qiyunDesc: `出生后约 ${ymd.y} 年 ${ymd.m} 个月 ${ymd.d} 天起运（${
        pdy ? 'pdy比例' : '三天折一年'
      }）`,
      deltaDaysToJie: Math.round(deltaDays * 1000) / 1000,
      cycles,
    },
  };
}

/** 从 ISO / datetime-local 字符串解析（按本地墙钟） */
export function parseCivilDatetime(value: string): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
} | null {
  return parseCivilDatetimeShared(value);
}

export function assertBaziGoldenCases(): Array<{ name: string; ok: boolean; got: string; expect: string }> {
  const cases: Array<{ name: string; input: BaZiInput; expect: string }> = [
    {
      name: 'DAY-1994-10-26-乙酉',
      input: {
        year: 1994,
        month: 10,
        day: 26,
        hour: 12,
        minute: 0,
        gender: 'male',
        ziMode: 'late',
      },
      expect: '甲戌 甲戌 乙酉 壬午',
    },
    {
      name: '1990-01-15-lunar',
      input: {
        year: 1990,
        month: 1,
        day: 15,
        hour: 10,
        minute: 30,
        gender: 'male',
        ziMode: 'late',
      },
      // 通行历：庚辰日（旧错误锚点曾误为甲戌）
      expect: '己巳 丁丑 庚辰 辛巳',
    },
  ];
  return cases.map((c) => {
    const chart = chartBazi(c.input);
    return {
      name: c.name,
      ok: chart.formatted === c.expect,
      got: chart.formatted,
      expect: c.expect,
    };
  });
}
