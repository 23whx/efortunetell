/**
 * 大六壬排盘（算法来源：热卜「金口诀」参考实现）
 * 产品 UI 统一称「大六壬」，不展示金口诀字样。
 * 四柱：统一走 @/lib/paipan/calendar（lunar-javascript）
 */
import { Solar } from 'lunar-javascript';
import {
  formatLocal,
  fourPillarsFromLunar,
  trueSolarAdjust,
  type ZiMode,
} from '@/lib/paipan/calendar';
import {
  DI_ZHI,
  GUI_REN_RULE,
  GUI_SHEN_BENWEI,
  GUI_SHEN_NAMES,
  JIA_ZI,
  LIU_HE_YUEJIANG,
  TIAN_GAN,
  WU_SHU,
  WX_GAN,
  WX_KE,
  WX_SHENG,
  WX_ZHI,
  XUN_KONG,
  YUE_JIANG_NAME,
  YUE_WANG_WX,
  ZHONGQI_TO_YJ,
} from './constants';
import type {
  DaliurenChart,
  DaliurenInput,
  GuiType,
  HuanJiang,
  SeatKey,
  WeiSlot,
} from './types';

function ganIndex(g: string): number {
  return TIAN_GAN.indexOf(g as (typeof TIAN_GAN)[number]);
}

function zhiIndex(z: string): number {
  return DI_ZHI.indexOf(z as (typeof DI_ZHI)[number]);
}

function gzIndex(gz: string): number {
  return JIA_ZI.indexOf(gz);
}

function xunShouOf(gz: string): string {
  const idx = gzIndex(gz);
  if (idx < 0) return '甲子';
  return JIA_ZI[idx - (idx % 10)];
}

function xunKongOf(gz: string): [string, string] {
  return XUN_KONG[xunShouOf(gz)] || ['', ''];
}

function wuShuGan(dayGan: string, zhi: string): string {
  const base = WU_SHU[dayGan] || '甲';
  return TIAN_GAN[(ganIndex(base) + zhiIndex(zhi)) % 10];
}

function wxKe(a: string, b: string): boolean {
  return WX_KE[a] === b;
}

function wxSheng(a: string, b: string): boolean {
  return WX_SHENG[a] === b;
}

function eightChar(
  dt: Date,
  ziMode: ZiMode = 'late'
): {
  year: string;
  month: string;
  day: string;
  hour: string;
  dayGan: string;
  dayZhi: string;
  hourZhi: string;
  monthZhi: string;
} {
  const p = fourPillarsFromLunar(dt, ziMode);
  return {
    year: p.year.ganZhi,
    month: p.month.ganZhi,
    day: p.day.ganZhi,
    hour: p.hour.ganZhi,
    dayGan: p.day.gan,
    dayZhi: p.day.zhi,
    hourZhi: p.hour.zhi,
    monthZhi: p.month.zhi,
  };
}

function jieQiAround(dt: Date): {
  prevName: string;
  prevTime: string;
  nextName: string;
  nextTime: string;
} {
  try {
    const solar = Solar.fromYmdHms(
      dt.getFullYear(),
      dt.getMonth() + 1,
      dt.getDate(),
      dt.getHours(),
      dt.getMinutes(),
      0
    );
    const lunar = solar.getLunar();
    const prev = lunar.getPrevJieQi?.(true) ?? lunar.getPrevJie?.();
    const next = lunar.getNextJieQi?.(true) ?? lunar.getNextJie?.();
    const p = prev as {
      getName?: () => string;
      getSolar?: () => { toYmdHms?: () => string };
    } | string | null | undefined;
    const n = next as {
      getName?: () => string;
      getSolar?: () => { toYmdHms?: () => string };
    } | string | null | undefined;
    const pName =
      p && typeof p === 'object' && typeof p.getName === 'function'
        ? p.getName()
        : String(p || '');
    const nName =
      n && typeof n === 'object' && typeof n.getName === 'function'
        ? n.getName()
        : String(n || '');
    const pSol =
      p && typeof p === 'object' && typeof p.getSolar === 'function'
        ? p.getSolar()
        : null;
    const nSol =
      n && typeof n === 'object' && typeof n.getSolar === 'function'
        ? n.getSolar()
        : null;
    return {
      prevName: pName,
      prevTime: pSol?.toYmdHms?.() || '',
      nextName: nName,
      nextTime: nSol?.toYmdHms?.() || '',
    };
  } catch {
    return { prevName: '', prevTime: '', nextName: '', nextTime: '' };
  }
}

/** 中气换将 */
function yueJiangZhongqi(dt: Date): { zhi: string; name: string } {
  try {
    let cur = Solar.fromYmdHms(
      dt.getFullYear(),
      dt.getMonth() + 1,
      dt.getDate(),
      dt.getHours(),
      dt.getMinutes(),
      0
    );
    for (let i = 0; i < 24; i++) {
      const lunar = cur.getLunar();
      const jq = lunar.getPrevJieQi?.(true);
      if (!jq || typeof jq.getName !== 'function') break;
      const name = jq.getName();
      if (name in ZHONGQI_TO_YJ) {
        const zhi = ZHONGQI_TO_YJ[name];
        return { zhi, name: YUE_JIANG_NAME[zhi] };
      }
      const sol = jq.getSolar?.();
      if (!sol) break;
      // step back 1 minute before this term
      const back = new Date(
        sol.getYear(),
        sol.getMonth() - 1,
        sol.getDay(),
        sol.getHour(),
        sol.getMinute() - 1,
        0
      );
      cur = Solar.fromYmdHms(
        back.getFullYear(),
        back.getMonth() + 1,
        back.getDate(),
        back.getHours(),
        back.getMinutes(),
        0
      );
    }
  } catch {
    /* fallthrough */
  }
  const zhi =
    (
      {
        1: '丑',
        2: '子',
        3: '亥',
        4: '戌',
        5: '酉',
        6: '申',
        7: '未',
        8: '午',
        9: '巳',
        10: '辰',
        11: '卯',
        12: '寅',
      } as Record<number, string>
    )[dt.getMonth() + 1] || '未';
  return { zhi, name: YUE_JIANG_NAME[zhi] };
}

function jiangShenZhi(yueJiang: string, hourZhi: string, diFen: string): string {
  return DI_ZHI[
    (zhiIndex(yueJiang) + zhiIndex(diFen) - zhiIndex(hourZhi) + 12) % 12
  ];
}

function isDaytime(dt: Date, guiType: GuiType, hourZhi: string): boolean {
  if (guiType === 'day') return true;
  if (guiType === 'night') return false;
  // maoYou 卯酉区分
  return ['卯', '辰', '巳', '午', '未', '申'].includes(hourZhi);
}

function guiShenAt(
  dayGan: string,
  hourZhi: string,
  diFen: string,
  dt: Date,
  guiType: GuiType
): { ganZhi: string; name: string } {
  const rule = GUI_REN_RULE[dayGan] || GUI_REN_RULE['甲'];
  const [dayH, nightH, dayFwd, nightFwd] = rule;
  const day = isDaytime(dt, guiType, hourZhi);
  const home = day ? dayH : nightH;
  const forward = day ? dayFwd : nightFwd;
  const delta = forward
    ? (zhiIndex(diFen) - zhiIndex(home) + 12) % 12
    : (zhiIndex(home) - zhiIndex(diFen) + 12) % 12;
  const name = GUI_SHEN_NAMES[delta];
  const branch = GUI_SHEN_BENWEI[name];
  const gan = wuShuGan(dayGan, branch);
  return { ganZhi: gan + branch, name };
}

function siDaKongWang(dayGz: string): string {
  const xs = xunShouOf(dayGz);
  if (xs === '甲子' || xs === '甲午') return '亥子壬癸';
  if (xs === '甲寅' || xs === '甲申') return '申酉庚辛';
  return '';
}

function computeDong(
  renGan: string,
  guiGz: string,
  jiangGz: string,
  diFen: string
): { bySeat: Record<SeatKey, string[]>; flags: Record<string, boolean> } {
  const ganWx = WX_GAN[renGan];
  const shenWx = WX_ZHI[guiGz[1]];
  const jiangWx = WX_ZHI[jiangGz[1]];
  const fangWx = WX_ZHI[diFen];

  const qiDong = wxKe(ganWx, fangWx); // 干克方 妻动
  const guanDong = wxKe(shenWx, ganWx); // 神克干 官动
  const zeiDong = wxKe(shenWx, jiangWx); // 神克将 贼动
  const caiDong = wxKe(jiangWx, shenWx); // 将克神 财动
  const guiDong = wxKe(fangWx, ganWx); // 方克干 鬼动
  const ziSunDong = wxSheng(ganWx, fangWx); // 干生方 子孙
  const fuMuDong = wxSheng(fangWx, ganWx); // 方生干 父母
  const xiongDiDong = ganWx === fangWx; // 兄弟

  const bySeat: Record<SeatKey, string[]> = {
    renYuan: [],
    guiShen: [],
    jiangShen: [],
    diFen: [],
  };
  if (qiDong) {
    bySeat.renYuan.push('妻动');
    bySeat.diFen.push('妻动');
  }
  if (guanDong) bySeat.guiShen.push('官动');
  if (zeiDong) bySeat.guiShen.push('贼动');
  if (caiDong) bySeat.jiangShen.push('财动');
  if (guiDong) {
    bySeat.diFen.push('鬼动');
    bySeat.renYuan.push('鬼动');
  }
  if (ziSunDong) {
    bySeat.renYuan.push('子孙动');
    bySeat.diFen.push('子孙动');
  }
  if (fuMuDong) {
    bySeat.diFen.push('父母动');
    bySeat.renYuan.push('父母动');
  }
  if (xiongDiDong) {
    bySeat.renYuan.push('兄弟动');
    bySeat.diFen.push('兄弟动');
  }

  return {
    bySeat,
    flags: {
      妻动: qiDong,
      官动: guanDong,
      贼动: zeiDong,
      财动: caiDong,
      鬼动: guiDong,
      子孙动: ziSunDong,
      父母动: fuMuDong,
      兄弟动: xiongDiDong,
    },
  };
}

/** 旺相休囚死 */
function wangShuaiOf(wx: string, monthZhi: string): string {
  const wang = YUE_WANG_WX[monthZhi] || '土';
  const xiang = WX_SHENG[wang]; // 我生者相
  const si = Object.keys(WX_SHENG).find((k) => WX_SHENG[k] === wang) || ''; // 生我者休? 实际：生旺者为相，旺生者为休
  // 标准：当令旺；我生相；生我休；克我囚；我克死
  if (wx === wang) return '旺';
  if (wx === xiang) return '相';
  // 生旺者 = 休
  const shengWang = Object.entries(WX_SHENG).find(([, v]) => v === wang)?.[0];
  if (wx === shengWang) return '休';
  // 当令者旺，旺所生者相，生旺者休，克旺者囚，旺所克者死
  if (WX_KE[wx] === wang) return '囚';
  if (WX_KE[wang] === wx) return '死';
  // 简化兜底
  if (wx === si) return '休';
  return '囚';
}

function pickYongSeat(
  renGan: string,
  guiGz: string,
  jiangGz: string,
  diFen: string
): SeatKey {
  // 简化：阳多取贵神，阴多取将神；参考实现 pick_yong_seat
  const yangCount =
    (ganIndex(renGan) % 2 === 0 ? 1 : 0) +
    (zhiIndex(guiGz[1]) % 2 === 0 ? 1 : 0) +
    (zhiIndex(jiangGz[1]) % 2 === 0 ? 1 : 0) +
    (zhiIndex(diFen) % 2 === 0 ? 1 : 0);
  return yangCount >= 2 ? 'guiShen' : 'jiangShen';
}

function kongFlags(
  renGan: string,
  guiGz: string,
  jiangGz: string,
  diFen: string,
  dayGz: string,
  siDa: string,
  yong: SeatKey
): Record<SeatKey, string[]> {
  const riKong = xunKongOf(dayGz);
  const out: Record<SeatKey, string[]> = {
    renYuan: [],
    guiShen: [],
    jiangShen: [],
    diFen: [],
  };
  const markZhi = (seat: SeatKey, zhi: string | null, gan: string | null) => {
    if (zhi && riKong.includes(zhi)) out[seat].push('空');
    if (siDa) {
      if (zhi && siDa.includes(zhi)) out[seat].push('四空');
      if (gan && siDa.includes(gan)) out[seat].push('四空');
    }
  };
  markZhi('renYuan', null, renGan);
  if (siDa && siDa.includes(renGan)) out.renYuan.push('四空');
  markZhi('guiShen', guiGz[1], guiGz[0]);
  markZhi('jiangShen', jiangGz[1], jiangGz[0]);
  markZhi('diFen', diFen, null);
  out[yong].push('用');
  // unique
  for (const k of Object.keys(out) as SeatKey[]) {
    out[k] = [...new Set(out[k])];
  }
  return out;
}

function relationsSummary(
  guiGz: string,
  jiangGz: string,
  diFen: string
): string[] {
  const rel: string[] = [];
  const chong: Record<string, string> = {
    子: '午',
    午: '子',
    丑: '未',
    未: '丑',
    寅: '申',
    申: '寅',
    卯: '酉',
    酉: '卯',
    辰: '戌',
    戌: '辰',
    巳: '亥',
    亥: '巳',
  };
  const liuhe: Record<string, string> = {
    子: '丑',
    丑: '子',
    寅: '亥',
    亥: '寅',
    卯: '戌',
    戌: '卯',
    辰: '酉',
    酉: '辰',
    巳: '申',
    申: '巳',
    午: '未',
    未: '午',
  };
  const pairs: Array<[string, string, string]> = [
    ['贵神', guiGz[1], '将神'],
    ['贵神', guiGz[1], '地分'],
    ['将神', jiangGz[1], '地分'],
  ];
  const zmap: Record<string, string> = {
    将神: jiangGz[1],
    地分: diFen,
    贵神: guiGz[1],
  };
  for (const [a, az, b] of pairs) {
    const bz = zmap[b];
    if (chong[az] === bz) rel.push(`${a}冲${b}`);
    if (liuhe[az] === bz) rel.push(`${a}合${b}`);
  }
  return rel;
}

const SEAT_LABEL: Record<SeatKey, string> = {
  renYuan: '人元',
  guiShen: '贵神',
  jiangShen: '将神',
  diFen: '地分',
};

const GUI_TYPE_LABEL: Record<GuiType, string> = {
  maoYou: '卯酉区分',
  day: '白天',
  night: '夜晚',
};

export function chartDaliuren(input: DaliurenInput): DaliurenChart {
  let diFen = input.diFen || '子';
  if (input.diFenNumber != null) {
    const n = input.diFenNumber;
    if (n < 1 || n > 12) throw new Error('diFenNumber 1-12');
    diFen = DI_ZHI[n - 1];
  }
  if (!DI_ZHI.includes(diFen as (typeof DI_ZHI)[number])) {
    throw new Error(`invalid diFen: ${diFen}`);
  }

  const minute = input.minute ?? 0;
  const huanJiang: HuanJiang = input.huanJiang ?? 'zhongqi';
  const guiType: GuiType = input.guiType ?? 'maoYou';

  const civil = new Date(
    input.year,
    input.month - 1,
    input.day,
    input.hour,
    minute,
    0
  );
  let used = civil;
  if (input.useTrueSolarTime && typeof input.longitude === 'number') {
    used = trueSolarAdjust(civil, input.longitude);
  }

  const ziMode = input.ziMode ?? 'late';
  const ec = eightChar(used, ziMode);
  const dayGan = ec.dayGan;
  const dayZhi = ec.dayZhi;
  const hourZhi = ec.hourZhi;
  const dayGz = ec.day;
  const hourGz = ec.hour;

  let yjZhi: string;
  let yjName: string;
  let huanLabel: string;
  if (huanJiang === 'zhongqi') {
    const yj = yueJiangZhongqi(used);
    yjZhi = yj.zhi;
    yjName = yj.name;
    huanLabel = '中气';
  } else {
    yjZhi = LIU_HE_YUEJIANG[ec.monthZhi] || '未';
    yjName = YUE_JIANG_NAME[yjZhi];
    huanLabel = '交节';
  }

  // 将神
  const jz = jiangShenZhi(yjZhi, hourZhi, diFen);
  const jg = wuShuGan(dayGan, jz);
  const jiangGz = jg + jz;
  const jiangName = YUE_JIANG_NAME[jz];

  // 贵神
  const gui = guiShenAt(dayGan, hourZhi, diFen, used, guiType);
  const guiGz = gui.ganZhi;
  const guiName = gui.name;

  // 人元
  const ren = wuShuGan(dayGan, diFen);

  const riKong = xunKongOf(dayGz);
  const siDa = siDaKongWang(dayGz);
  const around = jieQiAround(used);

  const dong = computeDong(ren, guiGz, jiangGz, diFen);
  const yong = pickYongSeat(ren, guiGz, jiangGz, diFen);
  const flags = kongFlags(ren, guiGz, jiangGz, diFen, dayGz, siDa, yong);

  const renWx = WX_GAN[ren];
  const guiWx = WX_ZHI[guiGz[1]];
  const jiangWx = WX_ZHI[jz];
  const diWx = WX_ZHI[diFen];

  const slot = (
    key: SeatKey,
    partial: Partial<WeiSlot> & { wx: string }
  ): WeiSlot => ({
    label: SEAT_LABEL[key],
    gan: partial.gan ?? null,
    zhi: partial.zhi ?? null,
    ganZhi: partial.ganZhi ?? null,
    name: partial.name ?? null,
    wx: partial.wx,
    wangShuai: wangShuaiOf(partial.wx, ec.monthZhi),
    dong: dong.bySeat[key],
    flags: flags[key],
    shenSha: [],
  });

  return {
    meta: {
      projectLabel: '大六壬',
      inputCivil: formatLocal(civil),
      usedDatetime: formatLocal(used),
      siZhu: {
        year: ec.year,
        month: ec.month,
        day: dayGz,
        hour: hourGz,
      },
      yueJiang: yjName,
      yueJiangZhi: yjZhi,
      huanJiang: huanLabel,
      jieQiRange: `${around.prevName} ~ ${around.nextName}`,
      diFen,
      riKong: riKong.join(''),
      siDaKongWang: siDa,
      koujue: '甲戊庚牛羊',
      guiType: GUI_TYPE_LABEL[guiType],
      yongSeat: yong,
      yongSeatLabel: SEAT_LABEL[yong],
      note: '月将按所选方式换将，四位自上而下为人元、贵神、将神、地分。',
    },
    siWei: {
      renYuan: slot('renYuan', { gan: ren, wx: renWx }),
      guiShen: slot('guiShen', {
        gan: guiGz[0],
        zhi: guiGz[1],
        ganZhi: guiGz,
        name: guiName,
        wx: guiWx,
      }),
      jiangShen: slot('jiangShen', {
        gan: jg,
        zhi: jz,
        ganZhi: jiangGz,
        name: jiangName,
        wx: jiangWx,
      }),
      diFen: slot('diFen', { zhi: diFen, wx: diWx }),
    },
    dongFlags: dong.flags,
    relations: relationsSummary(guiGz, jiangGz, diFen),
  };
}

export function assertDaliurenSmoke(): { ok: boolean; summary: string } {
  const c = chartDaliuren({
    year: 2024,
    month: 6,
    day: 1,
    hour: 9,
    minute: 0,
    diFen: '子',
  });
  const ok =
    c.siWei.renYuan.gan === '戊' &&
    c.meta.yueJiangZhi === '申' &&
    !!c.siWei.guiShen.ganZhi &&
    !!c.siWei.jiangShen.ganZhi;
  return {
    ok,
    summary: `月将${c.meta.yueJiang}${c.meta.yueJiangZhi} 人元${c.siWei.renYuan.gan} 贵${c.siWei.guiShen.ganZhi}${c.siWei.guiShen.name} 将${c.siWei.jiangShen.ganZhi}${c.siWei.jiangShen.name} 地${c.meta.diFen}`,
  };
}
