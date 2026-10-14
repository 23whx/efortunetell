/**
 * 阴盘奇门（时家 · 拆补默认）
 * 对齐《易世家》规格，参看《热卜》字段。
 * 四柱/节气/阴阳遁：统一走 @/lib/paipan/calendar（lunar-javascript）
 */
import { Solar } from 'lunar-javascript';
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

const JIA_ZI_60 = (() => {
  const G = '甲乙丙丁戊己庚辛壬癸';
  const Z = '子丑寅卯辰巳午未申酉戌亥';
  const a: string[] = [];
  for (let i = 0; i < 60; i++) a.push(G[i % 10] + Z[i % 12]);
  return a;
})();

/**
 * 拆补法三元：看日柱的符头（之前最近的甲/己日）地支
 * 子午卯酉 → 上元，寅申巳亥 → 中元，辰戌丑未 → 下元
 */
function yuanByFuTou(dayGz: string): YuanType {
  const idx = JIA_ZI_60.indexOf(dayGz);
  const fuTou = JIA_ZI_60[idx - (idx % 5)];
  const zhi = fuTou[1];
  if ('子午卯酉'.includes(zhi)) return 'shang';
  if ('寅申巳亥'.includes(zhi)) return 'zhong';
  return 'xia';
}

const ZHI_ORDER = '子丑寅卯辰巳午未申酉戌亥';

/**
 * 阴盘定局：(农历年支序数 + 农历月 + 农历日 + 时支序数) ÷ 9 取余，余 0 作 9 局
 * 地支序数子 1 … 亥 12；闰月按本月数
 */
function yinpanJu(dt: Date, hourZhi: string, ziMode: ZiMode): number {
  // 23 点换日时，夜子时按次日的农历日起局，与日柱一致
  const base = ziMode === 'late' && dt.getHours() === 23 ? new Date(dt.getTime() + 3600 * 1000) : dt;
  const lunar = Solar.fromYmdHms(base.getFullYear(), base.getMonth() + 1, base.getDate(), 12, 0, 0).getLunar() as unknown as {
    getYearZhi: () => string;
    getMonth: () => number;
    getDay: () => number;
  };
  const sum =
    ZHI_ORDER.indexOf(lunar.getYearZhi()) + 1 +
    Math.abs(lunar.getMonth()) +
    lunar.getDay() +
    ZHI_ORDER.indexOf(hourZhi) + 1;
  return sum % 9 === 0 ? 9 : sum % 9;
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

/** 地盘三奇六仪：戊落局数宫，按洛书数序 1→9（阳顺）或 9→1（阴逆）排布，中五宫寄坤二 */
function placeDiPan(dun: DunType, ju: number): Record<number, string> {
  const pos: Record<number, string> = {};
  for (let i = 0; i < SAN_QI_LIU_YI.length; i++) {
    const palace = dun === 'yang' ? ((ju - 1 + i) % 9) + 1 : ((((ju - 1 - i) % 9) + 9) % 9) + 1;
    pos[palace] = SAN_QI_LIU_YI[i];
  }
  return pos;
}

function invertMap(m: Record<number, string>): Record<string, number> {
  const inv: Record<string, number> = {};
  for (const [p, g] of Object.entries(m)) {
    inv[g] = Number(p);
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

/**
 * 四害
 */

/** 入墓：天盘干墓宫（阴盘口径：甲墓坤、乙墓乾坤、丙戊墓乾、丁己庚墓艮、辛壬墓巽、癸墓坤） */
const RU_MU_PALACES: Record<string, number[]> = {
  甲: [2],
  乙: [6, 2],
  丙: [6],
  戊: [6],
  丁: [8],
  己: [8],
  庚: [8],
  辛: [4],
  壬: [4],
  癸: [2],
};

/** 六仪击刑：仪落宫 */
const JI_XING_PALACE: Record<string, number> = {
  戊: 3, // 甲子戊 子刑卯 → 震三
  己: 2, // 甲戌己 戌刑未 → 坤二
  庚: 8, // 甲申庚 申刑寅 → 艮八
  辛: 9, // 甲午辛 午自刑 → 离九
  壬: 4, // 甲辰壬 辰自刑 → 巽四
  癸: 4, // 甲寅癸 寅刑巳 → 巽四
};

/** 门迫：门克宫（休水/生死土/伤杜木/景火/惊开金；宫五行 1水 2土 3木 4木 6金 7金 8土 9火） */
const MEN_PO_PALACES: Record<string, number[]> = {
  休: [9],
  生: [1],
  死: [1],
  伤: [2, 8],
  杜: [2, 8],
  惊: [3, 4],
  开: [3, 4],
  景: [6, 7],
};

/** 时干自坐墓的时柱 */
const SHI_GAN_ZUO_MU = new Set(['戊戌', '丙戌', '癸未', '丁丑', '己丑']);

export function chartYinpanQimen(input: QimenInput): QimenChart {
  const minute = input.minute ?? 0;
  const ziMode: ZiMode = input.ziMode ?? 'late';
  const method: QimenMethod = input.method ?? 'yinpan';
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
  const yuan: YuanType | null = method === 'chaibu' ? yuanByFuTou(dayGz) : null;
  const ju = yuan ? juShu(dun, jieName, yuan).ju : yinpanJu(used, hourZhi, ziMode);

  const di = placeDiPan(dun, ju);
  const ganToPalace = invertMap(di);

  const xs = xunShouOfHour(hourGz);
  const yi = XUN_SHOU_YI[xs] || '戊';
  // 旬首（六仪）所在地盘宫；落中五则寄坤二
  const originRaw = ganToPalace[yi];
  const origin = originRaw === 5 ? 2 : originRaw;
  // 时干所在地盘宫（甲时用旬首仪 → 伏吟）；中五寄坤二
  const hourYi = hourGan === '甲' ? yi : hourGan;
  const targetRaw = ganToPalace[hourYi] ?? originRaw;
  const target = targetRaw === 5 ? 2 : targetRaw;

  const zhiFuStar = JIU_XING[originRaw];
  const zhiShiName = BA_MEN[origin] || '死';

  // 九星与天盘干：整体沿外八宫旋转，使值符星落到时干宫；天禽与中五干随天芮（坤二）
  const r = [...PALACE_RING_YANG];
  const shift = (r.indexOf(target) - r.indexOf(origin) + 8) % 8;
  const tian: Record<number, string> = {};
  const stars: Record<number, string> = {};
  for (const p of r) {
    const src = r[(r.indexOf(p) - shift + 8) % 8];
    stars[p] = JIU_XING[src];
    tian[p] = di[src] || '';
  }
  const qinPalace = r[(r.indexOf(2) + shift) % 8];
  stars[5] = '天禽';

  // 值使门：从旬首宫起，按时辰数（旬首时为 0）沿洛书数序走（阳 1→9、阴 9→1），落五寄坤；其余门顺时针依次排
  const steps = JIA_ZI_60.indexOf(hourGz) % 10;
  const startNum = originRaw;
  const walked = dun === 'yang' ? ((startNum - 1 + steps) % 9) + 1 : ((((startNum - 1 - steps) % 9) + 9) % 9) + 1;
  const shiPalace = walked === 5 ? 2 : walked;
  const menShift = (r.indexOf(shiPalace) - r.indexOf(origin) + 8) % 8;
  const mens: Record<number, string | null> = { 5: null };
  for (const p of r) mens[p] = BA_MEN[r[(r.indexOf(p) - menShift + 8) % 8]];

  // 八神：值符落时干宫，阳遁顺时针、阴遁逆时针
  const shens: Record<number, string> = {};
  for (const p of r) {
    const offset = (r.indexOf(p) - r.indexOf(target) + 8) % 8;
    shens[p] = BA_SHEN[dun === 'yang' ? offset : (8 - offset) % 8];
  }

  const ma = yiMaZhi(hourZhi);
  const maPalace = ZHI_PALACE[ma];
  const kong = xunKongOf(hourGz);
  const kongPalaces = new Set(kong.map((z) => ZHI_PALACE[z]).filter(Boolean));

  const dayGan = pillars.day.gan;
  const gongWei: GongWei[] = [];
  const byPalace: Record<number, GongWei> = {};
  for (let p = 1; p <= 9; p++) {
    const tianGan = tian[p] || null;
    const men = mens[p] ?? null;
    const shen = p === 5 ? null : shens[p] ?? null;

    // 入墓：值符落宫甲为神，神不入墓；但该干为日干时仍论入墓
    let ruMu = Boolean(tianGan && RU_MU_PALACES[tianGan]?.includes(p));
    if (ruMu && shen === '值符' && tianGan !== dayGan) {
      ruMu = false;
    }
    const jiXing = Boolean(tianGan && JI_XING_PALACE[tianGan] === p);
    const menPo = Boolean(men && MEN_PO_PALACES[men]?.includes(p));

    const cell: GongWei = {
      palace: p,
      position: PALACE_POS[p],
      bagua: PALACE_BAGUA[p],
      diPanGan: di[p] ?? null,
      tianPanGan: tianGan,
      star: stars[p] ?? JIU_XING[p],
      men,
      shen,
      anGan: null,
      // 天禽星与中五宫地盘干寄坤，随天芮落宫
      qinGan: p === qinPalace ? di[5] || null : null,
      maXing: p === maPalace,
      kongWang: kongPalaces.has(p),
      ruMu,
      jiXing,
      menPo,
    };
    gongWei.push(cell);
    byPalace[p] = cell;
  }

  const sourceNote = '节气时刻取自寿星天文历，冬至后阳遁、夏至后阴遁。';

  return {
    meta: {
      product: '时家阴盘奇门',
      inputCivil: formatLocal(civil),
      usedDatetime: formatLocal(used),
      dun,
      dunLabel: dun === 'yang' ? '阳遁' : '阴遁',
      jieQi: jieName,
      jieStart: formatLocal(jieStart),
      jieEnd: formatLocal(jieEnd),
      yuan,
      yuanLabel: yuan ? YUAN_LABEL[yuan] : '',
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
      shiGanZuoMu: SHI_GAN_ZUO_MU.has(hourGz),
      method,
      calendarSource,
      panType: 'yin',
      homeType: 'shi',
      note:
        method === 'chaibu'
          ? `拆补法：节气定局，日柱符头定三元。${sourceNote}`
          : `阴盘定局：(农历年支数 + 农历月 + 农历日 + 时支数) ÷ 9 取余。${sourceNote}`,
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
