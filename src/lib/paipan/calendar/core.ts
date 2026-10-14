/**
 * 排盘历法单一源（canonical）
 *
 * - 四柱：lunar-javascript（寿星天文历），与通行黄历一致
 * - 硬验收：1994-10-26 日柱 = 乙酉（禁止错误「壬子锚点」）
 * - 早晚子：EightChar.setSect(1 晚子 / 2 早子)
 * - 节气：lunar-javascript 表；跨年合并 year±1，避免「冬至」键指向上年
 */
import { Solar } from 'lunar-javascript';
import type {
  CivilParts,
  FourPillars,
  GanZhiParts,
  JieQiPoint,
  ZiMode,
} from './types';

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function formatLocal(dt: Date): string {
  return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())} ${pad2(dt.getHours())}:${pad2(dt.getMinutes())}`;
}

export function formatLocalHms(dt: Date): string {
  return `${formatLocal(dt)}:${pad2(dt.getSeconds())}`;
}

export function formatDateOnly(dt: Date): string {
  return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
}

export function civilToDate(p: CivilParts): Date {
  return new Date(
    p.year,
    p.month - 1,
    p.day,
    p.hour,
    p.minute ?? 0,
    p.second ?? 0
  );
}

/**
 * 真太阳时：经度时差 + 均时差（Equation of Time，近似）
 * 基准经线：东经 120°（中国民用时）
 */
export function trueSolarAdjust(dt: Date, longitude: number): Date {
  const start = new Date(dt.getFullYear(), 0, 0);
  const n = Math.floor((dt.getTime() - start.getTime()) / 86400000);
  const B = (2 * Math.PI * (n - 81)) / 364;
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  const lngOffset = 4.0 * (longitude - 120.0);
  return new Date(dt.getTime() + (lngOffset + eot) * 60 * 1000);
}

function splitGz(gz: string): GanZhiParts {
  return {
    gan: gz[0] || '',
    zhi: gz[1] || '',
    ganZhi: gz,
  };
}

/**
 * 用 lunar-javascript 取四柱（全站唯一权威路径）
 * @param ziMode late = 23 点换日（不分早晚子，lunar sect 1）；early = 0 点换日、分早晚子，夜子时日柱仍为当天（sect 2）
 */
export function fourPillarsFromLunar(
  dt: Date,
  ziMode: ZiMode = 'late'
): FourPillars {
  const solar = Solar.fromYmdHms(
    dt.getFullYear(),
    dt.getMonth() + 1,
    dt.getDate(),
    dt.getHours(),
    dt.getMinutes(),
    dt.getSeconds()
  );
  const ec = solar.getLunar().getEightChar() as unknown as {
    getYear: () => string;
    getMonth: () => string;
    getDay: () => string;
    getTime: () => string;
    setSect?: (n: number) => void;
  };
  // 1=晚子时 2=早子时
  if (typeof ec.setSect === 'function') {
    ec.setSect(ziMode === 'late' ? 1 : 2);
  }
  const year = splitGz(ec.getYear());
  const month = splitGz(ec.getMonth());
  const day = splitGz(ec.getDay());
  const hour = splitGz(ec.getTime());
  return {
    year,
    month,
    day,
    hour,
    formatted: `${year.ganZhi} ${month.ganZhi} ${day.ganZhi} ${hour.ganZhi}`,
  };
}

/** 公历日柱（万年历日盘）：固定正午，避免 23 点晚子污染「今日」日柱 */
export function dayPillarAtNoon(
  year: number,
  month: number,
  day: number
): GanZhiParts {
  const noon = new Date(year, month - 1, day, 12, 0, 0);
  return fourPillarsFromLunar(noon, 'late').day;
}

/**
 * 取某公历年附近节气表（lunar-js 以「冬至起」的农历年为主，
 * 键「冬至」常为上年冬至；调用方应合并 year±1）
 */
export function jieQiTableForYear(year: number): Record<string, Date> {
  const lunar = Solar.fromYmd(year, 6, 15).getLunar();
  const table = lunar.getJieQiTable() as Record<string, unknown>;
  const out: Record<string, Date> = {};
  for (const [name, solar] of Object.entries(table || {})) {
    if (!/[\u4e00-\u9fff]/.test(name)) continue;
    try {
      const s = solar as {
        getYear: () => number;
        getMonth: () => number;
        getDay: () => number;
        getHour: () => number;
        getMinute: () => number;
        getSecond?: () => number;
      };
      out[name] = new Date(
        s.getYear(),
        s.getMonth() - 1,
        s.getDay(),
        s.getHour(),
        s.getMinute(),
        typeof s.getSecond === 'function' ? s.getSecond() : 0
      );
    } catch {
      /* skip */
    }
  }
  return out;
}

/** 合并 year-1..year+1 节气，按时刻去重排序 */
export function collectJieQiPoints(
  centerYear: number,
  names?: readonly string[]
): JieQiPoint[] {
  const points: JieQiPoint[] = [];
  for (const y of [centerYear - 1, centerYear, centerYear + 1]) {
    const table = jieQiTableForYear(y);
    const keys = names ?? Object.keys(table);
    for (const name of keys) {
      if (table[name]) points.push({ name, time: table[name] });
    }
  }
  points.sort((a, b) => a.time.getTime() - b.time.getTime());
  const seen = new Set<string>();
  return points.filter((p) => {
    const k = `${p.name}@${p.time.getTime()}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** 当前时刻所在节气段（上一交节气 → 下一交节气） */
export function currentJieQiSegment(
  dt: Date,
  names?: readonly string[]
): { name: string; start: Date; end: Date } {
  const pts = collectJieQiPoints(dt.getFullYear(), names);
  if (pts.length === 0) {
    return { name: '', start: dt, end: dt };
  }
  let cur = pts[0];
  let nxt = pts[pts.length - 1];
  for (let i = 0; i < pts.length; i++) {
    if (pts[i].time.getTime() <= dt.getTime()) {
      cur = pts[i];
      if (i + 1 < pts.length) nxt = pts[i + 1];
    } else break;
  }
  return { name: cur.name, start: cur.time, end: nxt.time };
}

/** 上一「节」（非中气）与下一「节」—— 八字大运用 */
export function findJieContext(
  dt: Date,
  jieNames: readonly string[]
): { prev: JieQiPoint; next: JieQiPoint } {
  const points = collectJieQiPoints(dt.getFullYear(), jieNames);
  let prev = points[0] ?? { name: '', time: dt };
  let next = points[points.length - 1] ?? { name: '', time: dt };
  for (let i = 0; i < points.length; i++) {
    if (points[i].time.getTime() <= dt.getTime()) {
      prev = points[i];
      if (i + 1 < points.length) next = points[i + 1];
    } else break;
  }
  return { prev, next };
}

/**
 * 奇门阴阳遁：
 * - 冬至（含）→ 夏至前：阳遁
 * - 夏至（含）→ 冬至前：阴遁
 *
 * 必须合并 year±1 的节气表：lunar-js 单年表中「冬至」常为**上年**冬至，
 * 若只用当年表，夏至后会被误判为阳遁。
 */
export function qimenDunType(dt: Date): 'yang' | 'yin' {
  const y = dt.getFullYear();
  const bounds: Array<{ dun: 'yang' | 'yin'; time: Date }> = [];
  for (const yr of [y - 1, y, y + 1]) {
    const table = jieQiTableForYear(yr);
    if (table['夏至']) bounds.push({ dun: 'yin', time: table['夏至'] });
    if (table['冬至']) bounds.push({ dun: 'yang', time: table['冬至'] });
  }
  bounds.sort((a, b) => a.time.getTime() - b.time.getTime());
  // 去重
  const uniq: typeof bounds = [];
  const seen = new Set<number>();
  for (const b of bounds) {
    if (seen.has(b.time.getTime())) continue;
    seen.add(b.time.getTime());
    uniq.push(b);
  }
  let dun: 'yang' | 'yin' = 'yang';
  for (const b of uniq) {
    if (b.time.getTime() <= dt.getTime()) dun = b.dun;
    else break;
  }
  return dun;
}

/** 解析 datetime-local / ISO 本地墙钟 */
export function parseCivilDatetime(value: string): CivilParts | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})/.exec(value);
  if (!m) return null;
  return {
    year: Number(m[1]),
    month: Number(m[2]),
    day: Number(m[3]),
    hour: Number(m[4]),
    minute: Number(m[5]),
  };
}
