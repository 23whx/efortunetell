import { Lunar } from 'lunar-javascript';
import { jieQiTableForYear } from '@/lib/paipan/calendar';
import { JIA_ZI, NAYIN } from '@/lib/paipan/bazi/constants';
import { ANIMALS, ELEMENTS, NAYIN_EN, STEMS, type Animal, type ElementInfo } from './data';

export const FIRST_YEAR = 1924;
export const LAST_YEAR = 2043;

export const ZODIAC_YEARS: number[] = Array.from({ length: LAST_YEAR - FIRST_YEAR + 1 }, (_, i) => FIRST_YEAR + i);

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

export interface CivilDate {
  y: number;
  m: number;
  d: number;
  hh?: number;
  mm?: number;
}

export function formatLong(dt: CivilDate): string {
  return `${MONTHS[dt.m - 1]} ${dt.d}, ${dt.y}`;
}

export function formatIso(dt: CivilDate): string {
  return `${dt.y}-${pad(dt.m)}-${pad(dt.d)}`;
}

/** Lunar New Year (正月初一) of a Gregorian year */
export function lunarNewYear(year: number): CivilDate {
  const s = Lunar.fromYmd(year, 1, 1).getSolar();
  return { y: s.getYear(), m: s.getMonth(), d: s.getDay() };
}

/** Li Chun (立春) moment of a Gregorian year, Beijing time */
export function liChun(year: number): CivilDate {
  const t = jieQiTableForYear(year)['立春'];
  return { y: t.getFullYear(), m: t.getMonth() + 1, d: t.getDate(), hh: t.getHours(), mm: t.getMinutes() };
}

export interface ZodiacYear {
  year: number;
  ganZhi: string;
  stem: string;
  branch: string;
  pinyin: string;
  animal: Animal;
  element: ElementInfo;
  yang: boolean;
  naYin: string;
  naYinEn: string;
  naYinMeaning: string;
  newYear: CivilDate;
  /** the day before next year's lunar new year */
  lastDay: CivilDate;
  liChun: CivilDate;
}

export function zodiacYear(year: number): ZodiacYear {
  const idx = (((year - 4) % 60) + 60) % 60;
  const ganZhi = JIA_ZI[idx];
  const stem = ganZhi[0];
  const branch = ganZhi[1];
  const st = STEMS[stem];
  const animal = ANIMALS[idx % 12];
  const naYin = NAYIN[ganZhi];
  const next = lunarNewYear(year + 1);
  const last = new Date(next.y, next.m - 1, next.d - 1);
  return {
    year,
    ganZhi,
    stem,
    branch,
    pinyin: `${st.pinyin} ${animal.branchPinyin}`,
    animal,
    element: ELEMENTS[st.element],
    yang: st.yang,
    naYin,
    naYinEn: NAYIN_EN[naYin]?.name ?? '',
    naYinMeaning: NAYIN_EN[naYin]?.meaning ?? '',
    newYear: lunarNewYear(year),
    lastDay: { y: last.getFullYear(), m: last.getMonth() + 1, d: last.getDate() },
    liChun: liChun(year),
  };
}

export function isZodiacYear(v: string): boolean {
  if (!/^\d{4}$/.test(v)) return false;
  const y = Number(v);
  return y >= FIRST_YEAR && y <= LAST_YEAR;
}
