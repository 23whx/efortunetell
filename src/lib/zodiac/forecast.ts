import { ANIMALS, ANIMAL_BY_KEY, type Animal, type AnimalKey } from './data';
import { relationsOf, type Relation } from './compat';

/**
 * Sign-by-sign outlook for a year, following the widely published Tai Sui rules
 * (the year's animal vs. each birth sign). Phrased as traditional belief, not prediction.
 */
const OUTLOOK: Record<Relation | 'none', (sign: Animal, year: Animal) => string> = {
  same: (s) => `Ben Ming Nian (your own sign's year), traditionally treated as "facing Tai Sui". Expect change in career or relationships; many ${s.name}s wear red and avoid rushing big commitments.`,
  clash: (s, y) => `Clashes with Tai Sui (${s.branch} opposes ${y.branch}), the most cautious year in popular forecasts. Common advice: avoid risky moves, double-check contracts and look after health.`,
  harm: () => `Harms Tai Sui. Forecasts warn of misunderstandings and people working against you behind the scenes; keep agreements in writing.`,
  punish: () => `In a punishment relationship with Tai Sui. Stress and criticism are the usual warnings, so pace yourself.`,
  break: () => `Breaks Tai Sui, a milder conflict: plans may need to be revised and partnerships repaired.`,
  trine: (s, y) => `In the same trine as the ${y.name}, so popular forecasts count this as a supportive year with help from others.`,
  secret: (s, y) => `Secret friend of the ${y.name}, one of the luckiest relations: "noble people" and smoother cooperation are expected.`,
  none: () => `No direct relation with Tai Sui, so most forecasts call it a steady year; results depend on effort and the full BaZi chart.`,
};

export interface SignOutlook {
  sign: Animal;
  relations: Relation[];
  tone: 'good' | 'mixed' | 'caution' | 'neutral';
  text: string;
}

export function yearOutlook(yearAnimal: AnimalKey): SignOutlook[] {
  const y = ANIMAL_BY_KEY[yearAnimal];
  return ANIMALS.map((s) => {
    const rel = relationsOf(s, y);
    const good = rel.some((r) => r === 'trine' || r === 'secret');
    const bad = rel.some((r) => r === 'clash' || r === 'harm' || r === 'punish' || r === 'break' || r === 'same');
    const tone: SignOutlook['tone'] = good && bad ? 'mixed' : good ? 'good' : bad ? 'caution' : 'neutral';
    const text = rel.length ? rel.map((r) => OUTLOOK[r](s, y)).join(' ') : OUTLOOK.none(s, y);
    return { sign: s, relations: rel, tone, text };
  });
}
