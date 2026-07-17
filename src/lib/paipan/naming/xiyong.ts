/**
 * 喜用神简化模型 v1（A 不可用时的 B 方案）
 * 以日主五行为我，统计四柱干支五行多寡：
 * - 缺者优先为喜
 * - 我弱则喜生我、同我；我强则喜我克、我生（泄）
 */
import { chartBazi, GAN_WX, ZHI_WX, type Gender } from '@/lib/paipan/bazi';
import type { XiYongResult, Wuxing } from './types';

const ORDER: Wuxing[] = ['木', '火', '土', '金', '水'];

const SHENG: Record<Wuxing, Wuxing> = {
  木: '火',
  火: '土',
  土: '金',
  金: '水',
  水: '木',
};

const KE: Record<Wuxing, Wuxing> = {
  木: '土',
  土: '水',
  水: '火',
  火: '金',
  金: '木',
};

function emptyCounts(): Record<Wuxing, number> {
  return { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
}

export function computeXiYong(input: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute?: number;
  gender: Gender;
  ziMode?: 'late' | 'early';
}): XiYongResult {
  const chart = chartBazi({
    year: input.year,
    month: input.month,
    day: input.day,
    hour: input.hour,
    minute: input.minute ?? 0,
    gender: input.gender,
    ziMode: input.ziMode ?? 'late',
  });

  const counts = emptyCounts();
  const pillars = [
    chart.siZhu.year,
    chart.siZhu.month,
    chart.siZhu.day,
    chart.siZhu.hour,
  ];
  for (const p of pillars) {
    const gw = (GAN_WX[p.gan] || '') as Wuxing;
    const zw = (ZHI_WX[p.zhi] || '') as Wuxing;
    if (gw in counts) counts[gw] += 1.2; // 天干权重略高
    if (zw in counts) counts[zw] += 1;
    // 藏干略计
    for (const cg of p.cangGan) {
      const cw = (GAN_WX[cg] || '') as Wuxing;
      if (cw in counts) counts[cw] += 0.35;
    }
  }

  const dayMaster = chart.siZhu.day.gan;
  const dayMasterWx = (GAN_WX[dayMaster] || '土') as Wuxing;

  // 同党：我 + 生我；异党：克我 + 我克 + 我生
  const same = counts[dayMasterWx] + counts[shengWo(dayMasterWx)];
  const other =
    counts[KE[dayMasterWx]] + // 我克
    counts[keWo(dayMasterWx)] + // 克我
    counts[SHENG[dayMasterWx]]; // 我生
  const weak = same < other;

  const missing = ORDER.filter((w) => counts[w] < 0.5);
  const xi: Wuxing[] = [];
  const ji: Wuxing[] = [];

  if (weak) {
    // 弱：喜生我、同我；忌克我、我克过多
    xi.push(shengWo(dayMasterWx), dayMasterWx);
    ji.push(keWo(dayMasterWx), KE[dayMasterWx]);
  } else {
    // 强：喜我克、我生（食伤泄秀）；忌生我、同我堆叠
    xi.push(KE[dayMasterWx], SHENG[dayMasterWx]);
    ji.push(shengWo(dayMasterWx), dayMasterWx);
  }

  // 缺者插入喜用前列
  for (const m of missing) {
    if (!xi.includes(m) && !ji.includes(m)) xi.unshift(m);
    else if (!xi.includes(m)) xi.unshift(m);
  }

  // unique keep order
  const uniq = (arr: Wuxing[]) => [...new Set(arr)];
  const xiU = uniq(xi).slice(0, 3);
  const jiU = uniq(ji).filter((x) => !xiU.includes(x)).slice(0, 2);

  return {
    dayMaster,
    dayMasterWx,
    xi: xiU,
    ji: jiU,
    counts: {
      金: round1(counts.金),
      木: round1(counts.木),
      水: round1(counts.水),
      火: round1(counts.火),
      土: round1(counts.土),
    },
    method: 'simplified-v1',
    note: weak
      ? '日主偏弱：喜生扶；缺五行优先补。'
      : '日主偏强：喜克泄；缺五行优先补。',
  };
}

function shengWo(me: Wuxing): Wuxing {
  return (Object.entries(SHENG).find(([, v]) => v === me)?.[0] || '土') as Wuxing;
}

function keWo(me: Wuxing): Wuxing {
  return (Object.entries(KE).find(([, v]) => v === me)?.[0] || '土') as Wuxing;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
