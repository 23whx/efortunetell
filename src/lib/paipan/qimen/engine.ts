/**
 * 阴盘奇门（时家 · 拆补默认）
 * 对齐《易世家》规格，参看《热卜》字段。
 * 四柱/节气/阴阳遁：统一走 @/lib/paipan/calendar（lunar-javascript）
 */
import {
  currentJieQiSegment,
  formatLocal,
  fourPillarsFromLunar,
  qimenDunType,
  trueSolarAdjust,
  type ZiMode,
} from '@/lib/paipan/calendar';
import {
  BA_MEN,
  BA_SHEN,
  GRID_LAYOUT,
  JIU_XING,
  PALACE_BAGUA,
  PALACE_POS,
  PALACE_RING_YANG,
  PALACE_RING_YIN,
  SAN_QI_LIU_YI,
  SOLAR_TERMS_ORDER,
  XUN_SHOU_YI,
  YANG_DUN_JU,
  YIN_DUN_JU,
  ZHI_PALACE,
} from './constants';
import type {
  DunType,
  GongWei,
  QimenCalendarSource,
  QimenChart,
  QimenInput,
  QimenMethod,
  YuanType,
} from './types';

function currentQimenJie(dt: Date): {
  name: string;
  start: Date;
  end: Date;
} {
  return currentJieQiSegment(dt, SOLAR_TERMS_ORDER);
}

function dunType(dt: Date): DunType {
  return qimenDunType(dt);
}

/** 拆补简化：节后 0–4 上元，5–9 中，10+ 下 */
function yuanBySimple(dt: Date, jieStart: Date): YuanType {
  const days = Math.floor(
    (Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate()) -
      Date.UTC(jieStart.getFullYear(), jieStart.getMonth(), jieStart.getDate())) /
      86400000
  );
  const d = Math.max(days, 0);
  if (d < 5) return 'shang';
  if (d < 10) return 'zhong';
  return 'xia';
}

function juShu(dun: DunType, jieName: string, yuan: YuanType): { ju: number; juKey: string } {
  const table = dun === 'yang' ? YANG_DUN_JU : YIN_DUN_JU;
  let juKey = jieName;
  if (!(juKey in table)) {
    const order = [...SOLAR_TERMS_ORDER];
    if (order.includes(juKey as (typeof SOLAR_TERMS_ORDER)[number])) {
      const i = order.indexOf(juKey as (typeof SOLAR_TERMS_ORDER)[number]);
      for (let k = i; k >= 0; k--) {
        if (order[k] in table) {
          juKey = order[k];
          break;
        }
      }
    }
    if (!(juKey in table)) {
      juKey = dun === 'yang' ? '冬至' : '夏至';
    }
  }
  const tri = table[juKey];
  const ju = { shang: tri[0], zhong: tri[1], xia: tri[2] }[yuan];
  return { ju, juKey };
}

function ring(dun: DunType): number[] {
  return dun === 'yang' ? [...PALACE_RING_YANG] : [...PALACE_RING_YIN];
}

function placeDiPan(dun: DunType, ju: number): Record<number, string> {
  const r = ring(dun);
  let startPalace = ju === 5 ? 2 : ju;
  if (!r.includes(startPalace)) startPalace = r[0];
  const si = r.indexOf(startPalace);
  const pos: Record<number, string> = {};
  for (let i = 0; i < SAN_QI_LIU_YI.length; i++) {
    const palace =
      dun === 'yang' ? r[(si + i) % r.length] : r[(si - i + r.length * 8) % r.length];
    pos[palace] = SAN_QI_LIU_YI[i];
  }
  pos[5] = pos[2] || '';
  return pos;
}

function invertMap(m: Record<number, string>): Record<string, number> {
  const inv: Record<string, number> = {};
  for (const [p, g] of Object.entries(m)) {
    const palace = Number(p);
    if (palace === 5) continue;
    inv[g] = palace;
  }
  return inv;
}

function xunShouOfHour(hourGz: string): string {
  // reuse jiazi: hour gan+zhi, find 甲x of same decade
  const JIA_ZI = (() => {
    const G = '甲乙丙丁戊己庚辛壬癸';
    const Z = '子丑寅卯辰巳午未申酉戌亥';
    const a: string[] = [];
    for (let i = 0; i < 60; i++) a.push(G[i % 10] + Z[i % 12]);
    return a;
  })();
  const idx = JIA_ZI.indexOf(hourGz);
  if (idx < 0) return '甲子';
  return JIA_ZI[idx - (idx % 10)];
}

function xunKongOf(gz: string): [string, string] {
  const map: Record<string, [string, string]> = {
    甲子: ['戌', '亥'],
    甲戌: ['申', '酉'],
    甲申: ['午', '未'],
    甲午: ['辰', '巳'],
    甲辰: ['寅', '卯'],
    甲寅: ['子', '丑'],
  };
  return map[xunShouOfHour(gz)] || ['', ''];
}

function yiMaZhi(hourZhi: string): string {
  if ('寅午戌'.includes(hourZhi)) return '申';
  if ('申子辰'.includes(hourZhi)) return '寅';
  if ('巳酉丑'.includes(hourZhi)) return '亥';
  return '巳';
}

const YUAN_LABEL: Record<YuanType, string> = {
  shang: '上元',
  zhong: '中元',
  xia: '下元',
};

export function chartYinpanQimen(input: QimenInput): QimenChart {
  const minute = input.minute ?? 0;
  const ziMode: ZiMode = input.ziMode ?? 'late';
  const method: QimenMethod = input.method ?? 'chaibu';
  const useTrueSolar = Boolean(input.useTrueSolarTime);
  const calendarSource: QimenCalendarSource = input.calendarSource ?? 'lunar';

  const civil = new Date(input.year, input.month - 1, input.day, input.hour, minute, 0);
  let used = civil;
  if (useTrueSolar && typeof input.longitude === 'number') {
    used = trueSolarAdjust(civil, input.longitude);
  }

  // 四柱：与八字/六壬同一历法源（lunar-javascript + setSect）
  const pillars = fourPillarsFromLunar(used, ziMode);
  const dayGz = pillars.day.ganZhi;
  const hourGz = pillars.hour.ganZhi;
  const hourGan = pillars.hour.gan;
  const hourZhi = pillars.hour.zhi;

  const { name: jieName, start: jieStart, end: jieEnd } = currentQimenJie(used);
  const dun = dunType(used);
  // 拆补简化三元；置闰预留同路径（差异见文档）
  const yuan = yuanBySimple(used, jieStart);
  const { ju, juKey } = juShu(dun, jieName, yuan);

  const di = placeDiPan(dun, ju);
  const ganToPalace = invertMap(di);

  const xs = xunShouOfHour(hourGz);
  const yi = XUN_SHOU_YI[xs] || '戊';
  let origin = ganToPalace[yi] ?? 2;
  let target = ganToPalace[hourGan] ?? origin;
  if (origin === 5) origin = 2;
  if (target === 5) target = 2;

  const originStarPalace = origin === 5 ? 2 : origin;
  const zhiFuStar = JIU_XING[originStarPalace];
  const zhiShiName = BA_MEN[originStarPalace] || '休';

  const r = ring(dun);
  const oI = r.indexOf(r.includes(origin) ? origin : 2);
  const tI = r.indexOf(r.includes(target) ? target : 2);
  const shift = (tI - oI + r.length) % r.length;

  const tian: Record<number, string> = {};
  const stars: Record<number, string> = {};
  const mens: Record<number, string | null> = {};
  const shens: Record<number, string> = {};

  for (const p of r) {
    const src = r[(r.indexOf(p) - shift + r.length) % r.length];
    stars[p] = JIU_XING[src];
    tian[p] = di[src] || '';
    mens[p] = BA_MEN[src];
  }
  stars[5] = '天禽';
  tian[5] = di[2] || '';
  mens[5] = null;

  // 八神：值符在 target，阳顺阴逆
  for (const p of r) {
    let idx: number;
    if (dun === 'yang') {
      idx = (r.indexOf(p) - tI + r.length) % r.length;
    } else {
      idx = (tI - r.indexOf(p) + r.length) % r.length;
    }
    shens[p] = BA_SHEN[idx % 8];
  }
  shens[5] = shens[2];

  const ma = yiMaZhi(hourZhi);
  const maPalace = ZHI_PALACE[ma];
  const kong = xunKongOf(hourGz);
  const kongPalaces = new Set(kong.map((z) => ZHI_PALACE[z]).filter(Boolean));

  const gongWei: GongWei[] = [];
  const byPalace: Record<number, GongWei> = {};
  for (let p = 1; p <= 9; p++) {
    const cell: GongWei = {
      palace: p,
      position: PALACE_POS[p],
      bagua: PALACE_BAGUA[p],
      diPanGan: di[p] ?? null,
      tianPanGan: p in tian ? tian[p] : di[p === 5 ? 2 : p] ?? null,
      star: stars[p] ?? JIU_XING[p],
      men: p in mens ? mens[p] : BA_MEN[p],
      shen: shens[p] ?? null,
      anGan: null,
      maXing: p === maPalace,
      kongWang: kongPalaces.has(p),
    };
    gongWei.push(cell);
    byPalace[p] = cell;
  }

  void juKey;
  void method; // zhirun uses same path until full 置闰 implemented

  const sourceNote =
    calendarSource === 'yishijia'
      ? '定局/九宫按易世家表；四柱与节气为 lunar-javascript（旧 JD 日柱已废弃）。'
      : '四柱/节气/阴阳遁：lunar-javascript；定局表按易世家。';

  return {
    meta: {
      product: '易世家规格 · 时家阴盘',
      inputCivil: formatLocal(civil),
      usedDatetime: formatLocal(used),
      dun,
      dunLabel: dun === 'yang' ? '阳遁' : '阴遁',
      jieQi: jieName,
      jieStart: formatLocal(jieStart),
      jieEnd: formatLocal(jieEnd),
      yuan,
      yuanLabel: YUAN_LABEL[yuan],
      juShu: ju,
      xunShou: xs,
      xunShouYi: yi,
      zhiFu: zhiFuStar,
      zhiShi: zhiShiName || '休',
      siZhu: {
        year: pillars.year.ganZhi,
        month: pillars.month.ganZhi,
        day: dayGz,
        hour: hourGz,
      },
      kongWang: kong,
      maZhi: ma,
      method,
      calendarSource,
      panType: 'yin',
      homeType: 'shi',
      note:
        method === 'zhirun'
          ? `置闰分支尚未独立实现，当前与拆补同路径。${sourceNote}`
          : `拆补简化三元（节后 5 日一元）。${sourceNote}`,
    },
    diPan: Object.fromEntries(
      Object.entries(di).map(([k, v]) => [String(k), v])
    ),
    gongWei,
    byPalace,
  };
}

export { GRID_LAYOUT };

export function assertQimenSmoke(): { ok: boolean; summary: string } {
  const c = chartYinpanQimen({
    year: 2024,
    month: 6,
    day: 1,
    hour: 9,
    minute: 0,
  });
  const ok =
    !!c.meta.juShu &&
    c.gongWei.length === 9 &&
    !!c.meta.zhiFu &&
    !!c.meta.zhiShi;
  return {
    ok,
    summary: `${c.meta.dunLabel}${c.meta.juShu}局 ${c.meta.yuanLabel} 符${c.meta.zhiFu} 使${c.meta.zhiShi} 旬${c.meta.xunShou}`,
  };
}
