import { ANIMALS, type Animal, type AnimalKey } from './data';

/** Classical earthly-branch relations between two zodiac signs */
export type Relation = 'trine' | 'secret' | 'same' | 'clash' | 'harm' | 'punish' | 'break';

const pair = (a: string, b: string) => [a, b].sort().join('');
const TRINES = ['申子辰', '亥卯未', '寅午戌', '巳酉丑'];
const LIU_HE = new Set(['子丑', '寅亥', '卯戌', '辰酉', '巳申', '午未'].map((p) => pair(p[0], p[1])));
const CHONG = new Set(['子午', '丑未', '寅申', '卯酉', '辰戌', '巳亥'].map((p) => pair(p[0], p[1])));
const HAI = new Set(['子未', '丑午', '寅巳', '卯辰', '申亥', '酉戌'].map((p) => pair(p[0], p[1])));
const XING = new Set(['子卯', '寅巳', '寅申', '巳申', '丑戌', '戌未', '丑未'].map((p) => pair(p[0], p[1])));
const SELF_XING = new Set(['辰', '午', '酉', '亥']);
const PO = new Set(['子酉', '卯午', '辰丑', '未戌', '寅亥', '巳申'].map((p) => pair(p[0], p[1])));

const SCORE: Record<Relation, number> = { trine: 2, secret: 2, same: 1, clash: -3, harm: -2, punish: -1.5, break: -1 };

export const RELATION_TEXT: Record<Relation, { name: string; zh: string; text: string }> = {
  trine: { name: 'Trine (San He)', zh: '三合', text: 'They belong to the same trine of three signs that share an element and outlook. Trine partners understand each other’s goals and tend to pull in the same direction.' },
  secret: { name: 'Secret friends (Liu He)', zh: '六合', text: 'They form one of the six harmonious pairs. This is a quiet, supportive bond: each covers the other’s blind spots without needing to be asked.' },
  same: { name: 'Same sign', zh: '同属', text: 'Two of the same sign recognise themselves in each other. Shared habits make things easy at first, but they also share the same weaknesses.' },
  clash: { name: 'Clash (Liu Chong)', zh: '六冲', text: 'They sit opposite each other on the zodiac wheel. Opposites attract, but their instincts run in different directions, so friction and sudden changes are common.' },
  harm: { name: 'Harm (Liu Hai)', zh: '六害', text: 'Each one’s best partner is the other’s rival, so third parties and misunderstandings tend to come between them. Problems build up quietly rather than in open conflict.' },
  punish: { name: 'Punishment (Xing)', zh: '相刑', text: 'This is a punishment relationship in classical astrology: a tendency to criticise, test or wear each other down, especially under stress.' },
  break: { name: 'Break (Po)', zh: '相破', text: 'A break relationship suggests plans that get disrupted and trust that needs repair. It is a mild negative, often outweighed by other factors.' },
};

export interface Compat {
  a: Animal;
  b: Animal;
  slug: string;
  relations: Relation[];
  score: number;
  label: 'Excellent' | 'Good' | 'Average' | 'Some friction' | 'Challenging';
}

export function relationsOf(a: Animal, b: Animal): Relation[] {
  const x = a.branch;
  const y = b.branch;
  const k = pair(x, y);
  const out: Relation[] = [];
  if (x === y) {
    out.push('same');
    if (SELF_XING.has(x)) out.push('punish');
    return out;
  }
  if (TRINES.some((t) => t.includes(x) && t.includes(y))) out.push('trine');
  if (LIU_HE.has(k)) out.push('secret');
  if (CHONG.has(k)) out.push('clash');
  if (HAI.has(k)) out.push('harm');
  if (XING.has(k)) out.push('punish');
  if (PO.has(k)) out.push('break');
  return out;
}

function labelOf(score: number): Compat['label'] {
  if (score >= 2) return 'Excellent';
  if (score >= 1) return 'Good';
  if (score >= 0) return 'Average';
  if (score > -2) return 'Some friction';
  return 'Challenging';
}

/** Slug orders the pair by branch order: rat-ox, not ox-rat */
export function compatSlug(a: AnimalKey, b: AnimalKey): string {
  const ia = ANIMALS.findIndex((x) => x.key === a);
  const ib = ANIMALS.findIndex((x) => x.key === b);
  return ia <= ib ? `${a}-${b}` : `${b}-${a}`;
}

export function compat(a: Animal, b: Animal): Compat {
  const relations = relationsOf(a, b);
  const score = relations.reduce((s, r) => s + SCORE[r], 0);
  return { a, b, slug: compatSlug(a.key, b.key), relations, score, label: labelOf(score) };
}

export const ALL_PAIRS: Compat[] = ANIMALS.flatMap((a, i) => ANIMALS.slice(i).map((b) => compat(a, b)));

export function compatBySlug(slug: string): Compat | null {
  return ALL_PAIRS.find((p) => p.slug === slug) ?? null;
}

/** Practical advice per rating band, phrased around the two signs */
export function adviceFor(c: Compat): { love: string; work: string } {
  const A = c.a.name;
  const B = c.b.name;
  switch (c.label) {
    case 'Excellent':
      return {
        love: `${A} and ${B} usually find a natural rhythm. The main risk is complacency: keep making time for each other instead of assuming the bond will look after itself.`,
        work: `A strong working pair. Give each a clear area of ownership and they will cover each other’s gaps.`,
      };
    case 'Good':
      return {
        love: `${A} and ${B} get along well and recover from disagreements quickly. Talking openly about money and routines keeps small differences small.`,
        work: `Reliable colleagues. Shared goals matter more here than personal chemistry, so agree on priorities early.`,
      };
    case 'Average':
      return {
        love: `Neither especially easy nor difficult: the relationship depends on the two people more than on the signs. Mutual respect for each other’s pace is the key.`,
        work: `They can cooperate well on defined tasks. Spell out who decides what to avoid quiet frustration.`,
      };
    case 'Some friction':
      return {
        love: `${A} and ${B} may misread each other’s intentions. Patience and saying things directly, rather than hinting, prevent resentment from piling up.`,
        work: `Better as partners with separate responsibilities than in a tight hierarchy. Written agreements help.`,
      };
    default:
      return {
        love: `${A} and ${B} feel strong attraction and strong friction. It can work when both accept that they see the world differently and avoid power struggles.`,
        work: `Expect different instincts about risk and pace. A third person who mediates, or a clear division of roles, makes cooperation much easier.`,
      };
  }
}

/** Tailwind classes per rating label (shared by the chart and pair pages) */
export const TONE: Record<Compat['label'], string> = {
  Excellent: 'bg-emerald-600 text-white',
  Good: 'bg-emerald-100 text-emerald-900',
  Average: 'bg-stone-100 text-stone-700',
  'Some friction': 'bg-amber-100 text-amber-900',
  Challenging: 'bg-rose-100 text-rose-900',
};
