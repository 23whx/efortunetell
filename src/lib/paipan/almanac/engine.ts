/**
 * 万年历 / 老黄历 — frontend engine
 * Data via lunar-javascript (寿星天文历系公开实现)
 * Align with 易世家 calendar fields where names map cleanly.
 */
import { Solar, Lunar } from 'lunar-javascript';
import type { AlmanacDay, AlmanacMonthCell, GanZhiPillar } from './types';

const WEEK_ZH = ['日', '一', '二', '三', '四', '五', '六'];
const WEEK_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SHICHEN: Array<{ zhi: string; hour: number; label: string }> = [
  { zhi: '子', hour: 0, label: '23:00–01:00' },
  { zhi: '丑', hour: 2, label: '01:00–03:00' },
  { zhi: '寅', hour: 4, label: '03:00–05:00' },
  { zhi: '卯', hour: 6, label: '05:00–07:00' },
  { zhi: '辰', hour: 8, label: '07:00–09:00' },
  { zhi: '巳', hour: 10, label: '09:00–11:00' },
  { zhi: '午', hour: 12, label: '11:00–13:00' },
  { zhi: '未', hour: 14, label: '13:00–15:00' },
  { zhi: '申', hour: 16, label: '15:00–17:00' },
  { zhi: '酉', hour: 18, label: '17:00–19:00' },
  { zhi: '戌', hour: 20, label: '19:00–21:00' },
  { zhi: '亥', hour: 22, label: '21:00–23:00' },
];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function formatDateKey(y: number, m: number, d: number): string {
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

export function parseDateKey(date: string): { y: number; m: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return { y, m: mo, d };
}

function pillarFromGanZhi(gz: string, naYin: string): GanZhiPillar {
  return {
    ganZhi: gz,
    gan: gz[0] || '',
    zhi: gz[1] || '',
    naYin,
  };
}

function safeArr(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map(String).filter(Boolean);
}

function safeStr(v: unknown): string {
  if (v == null) return '';
  return String(v);
}

function termName(v: unknown): string | null {
  if (v == null || v === '') return null;
  if (typeof v === 'string') return v;
  if (typeof v === 'object') {
    const o = v as { getName?: () => string; toString?: () => string };
    if (typeof o.getName === 'function') {
      const n = o.getName();
      if (n) return n;
    }
    if (typeof o.toString === 'function') {
      const n = o.toString();
      if (n && n !== '[object Object]') return n;
    }
  }
  const s = safeStr(v);
  return s || null;
}

function getNearbyTerms(lunar: Lunar, year: number): Array<{ name: string; datetime: string }> {
  try {
    const table = lunar.getJieQiTable() as Record<string, { toYmdHms?: () => string; toYmd?: () => string }>;
    const out: Array<{ name: string; datetime: string }> = [];
    for (const [name, solar] of Object.entries(table || {})) {
      // skip latin keys like DA_XUE
      if (!/[\u4e00-\u9fff]/.test(name)) continue;
      const dt = solar?.toYmdHms?.() || solar?.toYmd?.() || '';
      if (!dt) continue;
      if (dt.startsWith(String(year)) || dt.startsWith(String(year - 1)) || dt.startsWith(String(year + 1))) {
        out.push({ name, datetime: dt });
      }
    }
    out.sort((a, b) => a.datetime.localeCompare(b.datetime));
    return out;
  } catch {
    return [];
  }
}

export function getAlmanacDay(dateKey: string, hour = 12, minute = 0): AlmanacDay | null {
  const parsed = parseDateKey(dateKey);
  if (!parsed) return null;
  const { y, m, d } = parsed;

  // 日盘按公历「日」：年月日柱用正午，避免 23 点晚子把「今日」日柱改成次日
  const solarNoon = Solar.fromYmdHms(y, m, d, 12, 0, 0);
  const lunarNoon = solarNoon.getLunar();
  const solar = Solar.fromYmdHms(y, m, d, hour, minute, 0);
  const lunar = solar.getLunar();
  const week = solarNoon.getWeek(); // 0=Sun in lunar-javascript

  const yearGz = lunarNoon.getYearInGanZhiExact?.() || lunarNoon.getYearInGanZhi();
  const monthGz = lunarNoon.getMonthInGanZhiExact?.() || lunarNoon.getMonthInGanZhi();
  const dayGz = lunarNoon.getDayInGanZhiExact?.() || lunarNoon.getDayInGanZhi();
  const timeGz = lunar.getTimeInGanZhi();

  const hours = SHICHEN.map((sc) => {
    const s = Solar.fromYmdHms(y, m, d, sc.hour, 0, 0);
    // 子时跨日：23 点用当天 23 点
    const hh = sc.zhi === '子' ? 23 : sc.hour;
    const s2 = Solar.fromYmdHms(y, m, d, hh === 0 ? 0 : hh, 30, 0);
    const l = (sc.zhi === '子' ? Solar.fromYmdHms(y, m, d, 23, 30, 0) : s2).getLunar();
    return {
      zhi: sc.zhi,
      label: sc.label,
      ganZhi: l.getTimeInGanZhi(),
      yi: safeArr(l.getTimeYi()),
      ji: safeArr(l.getTimeJi()),
    };
  });

  const jieQiToday = safeStr(lunar.getJieQi());

  return {
    date: dateKey,
    year: y,
    month: m,
    day: d,
    week,
    weekName: WEEK_EN[week] || '',
    weekNameZh: WEEK_ZH[week] || '',
    constellation: safeStr(solar.getXingZuo()),

    lunar: {
      yearCn: safeStr(lunar.getYearInChinese()),
      monthCn: safeStr(lunar.getMonthInChinese()),
      dayCn: safeStr(lunar.getDayInChinese()),
      full: safeStr(lunar.toString()),
      isLeap: Boolean(lunar.getMonth() < 0),
      month: Math.abs(lunar.getMonth()),
      day: lunar.getDay(),
      yearShengXiao: safeStr(lunar.getYearShengXiao()),
      dayShengXiao: safeStr(lunar.getDayShengXiao()),
      yueXiang: safeStr(lunar.getYueXiang()),
    },

    pillars: {
      year: pillarFromGanZhi(yearGz, safeStr(lunarNoon.getYearNaYin())),
      month: pillarFromGanZhi(monthGz, safeStr(lunarNoon.getMonthNaYin())),
      day: pillarFromGanZhi(dayGz, safeStr(lunarNoon.getDayNaYin())),
      time: {
        ...pillarFromGanZhi(timeGz, safeStr(lunar.getTimeNaYin?.() || '')),
        hourLabel: `${pad2(hour)}:${pad2(minute)}`,
      },
    },

    solarTerms: {
      current: jieQiToday || null,
      prevJie: termName(lunar.getPrevJie()),
      nextJie: termName(lunar.getNextJie()),
      prevQi: termName(lunar.getPrevQi()),
      nextQi: termName(lunar.getNextQi()),
      nearby: getNearbyTerms(lunar, y).slice(0, 24),
    },

    yi: safeArr(lunar.getDayYi()),
    ji: safeArr(lunar.getDayJi()),
    chong: safeStr(lunar.getDayChongDesc()),
    chongShengXiao: safeStr(lunar.getDayChongShengXiao()),
    sha: safeStr(lunar.getDaySha()),
    jianChu: safeStr(lunar.getZhiXing()),
    xiu: safeStr(lunar.getXiu()),
    xiuLuck: safeStr(lunar.getXiuLuck()),
    xiuSong: safeStr(lunar.getXiuSong?.() || ''),
    pengZuGan: safeStr(lunar.getPengZuGan()),
    pengZuZhi: safeStr(lunar.getPengZuZhi()),
    tianShen: safeStr(lunar.getDayTianShen()),
    tianShenType: safeStr(lunar.getDayTianShenType()),
    jiShen: safeArr(lunar.getDayJiShen()),
    xiongSha: safeArr(lunar.getDayXiongSha()),
    festivals: safeArr(lunar.getFestivals()),
    otherFestivals: safeArr(lunar.getOtherFestivals()),

    positions: {
      xi: safeStr(lunar.getDayPositionXiDesc?.() || lunar.getDayPositionXi()),
      fu: safeStr(lunar.getDayPositionFuDesc?.() || lunar.getDayPositionFu()),
      cai: safeStr(lunar.getDayPositionCaiDesc?.() || lunar.getDayPositionCai()),
      yangGui: safeStr(lunar.getDayPositionYangGuiDesc?.() || lunar.getDayPositionYangGui()),
      yinGui: safeStr(lunar.getDayPositionYinGuiDesc?.() || lunar.getDayPositionYinGui()),
      taiSui: safeStr(lunar.getDayPositionTaiSuiDesc?.() || lunar.getDayPositionTaiSui()),
      taiShen: safeStr(lunar.getDayPositionTai()),
    },

    hours,
  };
}

export function getAlmanacMonth(year: number, month: number, todayKey?: string): AlmanacMonthCell[] {
  const first = Solar.fromYmd(year, month, 1);
  const weekStart = first.getWeek(); // 0=Sun
  const dim = new Date(year, month, 0).getDate();
  const today =
    todayKey ||
    formatDateKey(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());

  const cells: AlmanacMonthCell[] = [];

  // leading days from previous month
  const prevDate = new Date(year, month - 1, 0);
  const prevDim = prevDate.getDate();
  const prevY = prevDate.getFullYear();
  const prevM = prevDate.getMonth() + 1;

  for (let i = 0; i < weekStart; i++) {
    const d = prevDim - weekStart + i + 1;
    const date = formatDateKey(prevY, prevM, d);
    const solar = Solar.fromYmd(prevY, prevM, d);
    const lunar = solar.getLunar();
    const yi = safeArr(lunar.getDayYi());
    cells.push({
      date,
      day: d,
      lunarDayCn: safeStr(lunar.getDayInChinese()),
      isCurrentMonth: false,
      isToday: date === today,
      yiTop: yi[0] || null,
      term: safeStr(lunar.getJieQi()) || null,
      festival: safeArr(lunar.getFestivals())[0] || safeArr(lunar.getOtherFestivals())[0] || null,
    });
  }

  for (let d = 1; d <= dim; d++) {
    const date = formatDateKey(year, month, d);
    const solar = Solar.fromYmd(year, month, d);
    const lunar = solar.getLunar();
    const yi = safeArr(lunar.getDayYi());
    cells.push({
      date,
      day: d,
      lunarDayCn: safeStr(lunar.getDayInChinese()),
      isCurrentMonth: true,
      isToday: date === today,
      yiTop: yi[0] || null,
      term: safeStr(lunar.getJieQi()) || null,
      festival: safeArr(lunar.getFestivals())[0] || safeArr(lunar.getOtherFestivals())[0] || null,
    });
  }

  // trailing to complete 6 weeks (42) or at least full weeks
  const target = cells.length <= 35 ? 35 : 42;
  let n = 1;
  const nextM = month === 12 ? 1 : month + 1;
  const nextY = month === 12 ? year + 1 : year;
  while (cells.length < target) {
    const date = formatDateKey(nextY, nextM, n);
    const solar = Solar.fromYmd(nextY, nextM, n);
    const lunar = solar.getLunar();
    const yi = safeArr(lunar.getDayYi());
    cells.push({
      date,
      day: n,
      lunarDayCn: safeStr(lunar.getDayInChinese()),
      isCurrentMonth: false,
      isToday: date === today,
      yiTop: yi[0] || null,
      term: safeStr(lunar.getJieQi()) || null,
      festival: safeArr(lunar.getFestivals())[0] || safeArr(lunar.getOtherFestivals())[0] || null,
    });
    n += 1;
  }

  return cells;
}

export function todayDateKey(timeZone = 'Asia/Shanghai'): string {
  try {
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    // en-CA → YYYY-MM-DD
    return fmt.format(new Date());
  } catch {
    const n = new Date();
    return formatDateKey(n.getFullYear(), n.getMonth() + 1, n.getDate());
  }
}

export function shiftDateKey(dateKey: string, deltaDays: number): string {
  const p = parseDateKey(dateKey);
  if (!p) return dateKey;
  const dt = new Date(p.y, p.m - 1, p.d);
  dt.setDate(dt.getDate() + deltaDays);
  return formatDateKey(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
}
