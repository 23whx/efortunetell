import type { HanziRecord, Wuxing } from './types';
import seed from './hanzi-seed.json';
import compounds from './compound-surnames.json';

const DATA = seed as HanziRecord[];
const COMPOUND = compounds as string[];

const byChar = new Map(DATA.map((h) => [h.char, h]));

export function getHanzi(char: string): HanziRecord | null {
  if (!char) return null;
  return byChar.get(char) || null;
}

export function searchHanzi(query: string): HanziRecord[] {
  const q = query.trim();
  if (!q) return [];
  if (q.length === 1) {
    const one = getHanzi(q);
    return one ? [one] : [];
  }
  // multi: filter contains
  return DATA.filter((h) => q.includes(h.char)).slice(0, 50);
}

export function listByWuxing(wx: Wuxing | string, limit = 80): HanziRecord[] {
  return DATA.filter((h) => h.wuxing === wx).slice(0, limit);
}

export function listByKangxi(n: number, limit = 80): HanziRecord[] {
  return DATA.filter((h) => h.kangxi === n).slice(0, limit);
}

export function listByRadical(radical: string, limit = 80): HanziRecord[] {
  return DATA.filter(
    (h) => h.radical === radical || h.radicalKangxi === radical
  ).slice(0, limit);
}

export function listByStructure(structure: string, limit = 80): HanziRecord[] {
  return DATA.filter((h) => h.structure === structure).slice(0, limit);
}

export function allHanzi(): HanziRecord[] {
  return DATA;
}

export function splitSurname(fullOrSurname: string): {
  surname: string;
  rest: string;
} {
  const s = fullOrSurname.trim();
  if (!s) return { surname: '', rest: '' };
  const two = s.slice(0, 2);
  if (COMPOUND.includes(two)) {
    return { surname: two, rest: s.slice(2) };
  }
  return { surname: s[0], rest: s.slice(1) };
}

export function compoundSurnames(): string[] {
  return COMPOUND;
}

export const STRUCTURES = [
  '单一结构',
  '左右结构',
  '上下结构',
  '左中右结构',
  '上中下结构',
  '右上包围结构',
  '左上包围结构',
  '左下包围结构',
  '全包围结构',
  '品字结构',
  '半包围结构',
] as const;

export const WUXING_LIST: Wuxing[] = ['金', '木', '水', '火', '土'];
