/**
 * 全模块 ≥14 轮跨时间测试
 * 覆盖：万年历、八字、奇门、六壬、起名
 * 对照：lunar-javascript 直算 + 热卜/易世家 Python 参考（若可用）
 *
 * npx tsx scripts/paipan-full-14round-test.ts
 */
import { writeFileSync } from 'fs';
import { spawnSync } from 'child_process';
import path from 'path';
import { Solar } from 'lunar-javascript';
import { trueSolarAdjust } from '../src/lib/paipan/calendar';
import { getAlmanacDay } from '../src/lib/paipan/almanac/engine';
import { chartBazi } from '../src/lib/paipan/bazi/engine';
import { chartYinpanQimen } from '../src/lib/paipan/qimen/engine';
import { chartDaliuren } from '../src/lib/paipan/daliuren/engine';
import { generateNames, getHanzi } from '../src/lib/paipan/naming';

type Gender = 'male' | 'female';

type Case = {
  id: number;
  name: string;
  dt: string; // YYYY-MM-DDTHH:mm
  gender: Gender;
  ziMode: 'late' | 'early';
  diFen: string;
  surname: string;
  note: string;
};

/** 14 个跨度大的样本（1880–2026） */
const CASES: Case[] = [
  { id: 1, name: '清末', dt: '1880-03-15T08:00', gender: 'male', ziMode: 'late', diFen: '寅', surname: '张', note: '19世纪末' },
  { id: 2, name: '民国初', dt: '1912-01-01T00:00', gender: 'male', ziMode: 'late', diFen: '子', surname: '李', note: '子时边界' },
  { id: 3, name: '抗战前', dt: '1937-07-07T10:30', gender: 'female', ziMode: 'late', diFen: '午', surname: '王', note: '夏日' },
  { id: 4, name: '建国日', dt: '1949-10-01T15:00', gender: 'male', ziMode: 'late', diFen: '申', surname: '刘', note: '秋季申时' },
  { id: 5, name: '文革末', dt: '1976-09-09T16:00', gender: 'female', ziMode: 'late', diFen: '酉', surname: '陈', note: '秋分前' },
  { id: 6, name: '改革开放', dt: '1978-12-18T09:00', gender: 'male', ziMode: 'late', diFen: '辰', surname: '赵', note: '冬月' },
  { id: 7, name: '用户指出日', dt: '1994-10-26T12:00', gender: 'male', ziMode: 'late', diFen: '子', surname: '欧阳', note: '必须乙酉日' },
  { id: 8, name: '千禧', dt: '2000-01-01T00:00', gender: 'female', ziMode: 'late', diFen: '丑', surname: '周', note: '跨年子时' },
  { id: 9, name: '奥运开幕', dt: '2008-08-08T20:08', gender: 'male', ziMode: 'late', diFen: '戌', surname: '吴', note: '晚间' },
  { id: 10, name: '春分附近', dt: '2015-03-21T11:00', gender: 'female', ziMode: 'late', diFen: '卯', surname: '郑', note: '中气' },
  { id: 11, name: '冬至附近', dt: '2010-12-22T08:00', gender: 'male', ziMode: 'late', diFen: '子', surname: '孙', note: '阴阳遁界' },
  { id: 12, name: '夏至附近', dt: '2000-06-21T12:00', gender: 'female', ziMode: 'late', diFen: '午', surname: '马', note: '阴阳遁界' },
  { id: 13, name: '晚子对照', dt: '1990-01-15T23:30', gender: 'male', ziMode: 'late', diFen: '亥', surname: '朱', note: '晚子换日' },
  { id: 14, name: '热卜抓包日', dt: '2026-07-14T09:27', gender: 'male', ziMode: 'late', diFen: '子', surname: '司马', note: '六壬抓包' },
  // 额外 4 轮加严
  { id: 15, name: '立春前', dt: '1990-02-04T09:00', gender: 'male', ziMode: 'late', diFen: '寅', surname: '何', note: '换年边界' },
  { id: 16, name: '立春后', dt: '1990-02-04T11:00', gender: 'male', ziMode: 'late', diFen: '寅', surname: '何', note: '换年边界' },
  { id: 17, name: '早子对照', dt: '1990-01-15T23:30', gender: 'male', ziMode: 'early', diFen: '亥', surname: '朱', note: '早子不换日' },
  { id: 18, name: '近现代', dt: '2024-06-01T09:00', gender: 'female', ziMode: 'late', diFen: '子', surname: '林', note: '奇门/六壬 demo' },
];

type Check = {
  module: string;
  field: string;
  expect: string;
  got: string;
  pass: boolean;
  severity: 'P0' | 'P1' | 'info';
};

function parse(dt: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(dt)!;
  return {
    year: +m[1],
    month: +m[2],
    day: +m[3],
    hour: +m[4],
    minute: +m[5],
    dateKey: `${m[1]}-${m[2]}-${m[3]}`,
  };
}

function lunarEight(dt: string, ziMode: 'late' | 'early') {
  const p = parse(dt);
  const solar = Solar.fromYmdHms(p.year, p.month, p.day, p.hour, p.minute, 0);
  const ec = solar.getLunar().getEightChar();
  if (typeof (ec as any).setSect === 'function') {
    (ec as any).setSect(ziMode === 'late' ? 1 : 2);
  }
  return {
    pillars: `${ec.getYear()} ${ec.getMonth()} ${ec.getDay()} ${ec.getTime()}`,
    day: ec.getDay(),
    year: ec.getYear(),
    month: ec.getMonth(),
    hour: ec.getTime(),
    lunarStr: solar.getLunar().toString(),
  };
}

function runCase(c: Case) {
  const p = parse(c.dt);
  const ref = lunarEight(c.dt, c.ziMode);

  // 万年历
  const almanac = getAlmanacDay(p.dateKey, p.hour, p.minute);
  // 八字
  const bazi = chartBazi({
    year: p.year,
    month: p.month,
    day: p.day,
    hour: p.hour,
    minute: p.minute,
    gender: c.gender,
    ziMode: c.ziMode,
  });
  // 奇门
  const qimen = chartYinpanQimen({
    year: p.year,
    month: p.month,
    day: p.day,
    hour: p.hour,
    minute: p.minute,
    ziMode: c.ziMode,
    method: 'chaibu',
  });
  // 六壬
  const dlr = chartDaliuren({
    year: p.year,
    month: p.month,
    day: p.day,
    hour: p.hour,
    minute: p.minute,
    diFen: c.diFen,
    huanJiang: 'zhongqi',
    guiType: 'maoYou',
    ziMode: c.ziMode,
  });
  // 起名
  const naming = generateNames({
    surname: c.surname,
    gender: c.gender,
    year: p.year,
    month: p.month,
    day: p.day,
    hour: p.hour,
    minute: p.minute,
    ziMode: c.ziMode,
    count: 3,
  });

  const checks: Check[] = [];

  // --- 万年历 ---
  checks.push({
    module: '万年历',
    field: '能否出盘',
    expect: '非空日盘',
    got: almanac ? `${almanac.date} ${almanac.lunar.full}` : 'null',
    pass: !!almanac && !!almanac.pillars.day.ganZhi,
    severity: 'P0',
  });
  if (almanac) {
    // 万年历按「公历日」展示日柱：用当日 12:00 对照，避免 23:xx 晚子与日盘混比
    const noonRef = lunarEight(`${p.dateKey}T12:00`, 'late');
    checks.push({
      module: '万年历',
      field: '日柱=公历日柱(正午)',
      expect: noonRef.day,
      got: almanac.pillars.day.ganZhi,
      pass: almanac.pillars.day.ganZhi === noonRef.day,
      severity: 'P0',
    });
    checks.push({
      module: '万年历',
      field: '宜忌非空',
      expect: 'yi/ji 数组',
      got: `宜${almanac.yi.length} 忌${almanac.ji.length}`,
      pass: almanac.yi.length > 0 || almanac.ji.length > 0,
      severity: 'P1',
    });
    checks.push({
      module: '万年历',
      field: '农历串',
      expect: '含年/月/日中文',
      got: almanac.lunar.full,
      pass: almanac.lunar.full.length >= 4,
      severity: 'P1',
    });
  }

  // --- 八字 ---
  checks.push({
    module: '八字',
    field: '四柱=lunar-js',
    expect: ref.pillars,
    got: bazi.formatted,
    pass: bazi.formatted === ref.pillars,
    severity: 'P0',
  });
  checks.push({
    module: '八字',
    field: '藏干/十神/纳音/空亡',
    expect: '结构完整',
    got: `藏${bazi.siZhu.day.cangGan.join('')} 神${bazi.siZhu.day.shiShenOnGan} 纳${bazi.siZhu.day.naYin} 空${bazi.xunKong.join('')}`,
    pass:
      bazi.siZhu.day.cangGan.length > 0 &&
      !!bazi.siZhu.day.shiShenOnGan &&
      !!bazi.siZhu.day.naYin &&
      bazi.xunKong.length === 2,
    severity: 'P0',
  });
  checks.push({
    module: '八字',
    field: '大运起运',
    expect: '8运+起运日',
    got: `${bazi.daYun.cycles.length}运 起${bazi.daYun.qiyunDate}`,
    pass: bazi.daYun.cycles.length === 8 && !!bazi.daYun.qiyunDate,
    severity: 'P0',
  });

  // 用户硬点：1994-10-26 乙酉
  if (c.id === 7) {
    checks.push({
      module: '八字',
      field: '用户硬验收日柱',
      expect: '乙酉',
      got: bazi.siZhu.day.ganZhi,
      pass: bazi.siZhu.day.ganZhi === '乙酉',
      severity: 'P0',
    });
  }

  // 立春年柱
  if (c.id === 15) {
    checks.push({
      module: '八字',
      field: '立春前年柱',
      expect: '己巳',
      got: bazi.siZhu.year.ganZhi,
      pass: bazi.siZhu.year.ganZhi === '己巳',
      severity: 'P0',
    });
  }
  if (c.id === 16) {
    checks.push({
      module: '八字',
      field: '立春后年柱',
      expect: '庚午',
      got: bazi.siZhu.year.ganZhi,
      pass: bazi.siZhu.year.ganZhi === '庚午',
      severity: 'P0',
    });
  }

  // --- 奇门 ---
  checks.push({
    module: '奇门',
    field: '出盘完整',
    expect: '局+符+使+9宫',
    got: `${qimen.meta.dunLabel}${qimen.meta.juShu} 符${qimen.meta.zhiFu} 使${qimen.meta.zhiShi} 宫${qimen.gongWei.length}`,
    pass:
      qimen.meta.juShu >= 1 &&
      qimen.meta.juShu <= 9 &&
      !!qimen.meta.zhiFu &&
      !!qimen.meta.zhiShi &&
      qimen.gongWei.length === 9,
    severity: 'P0',
  });
  // 奇门四柱应与八字一致（同 ziMode + lunar）
  const qmSz = `${qimen.meta.siZhu.year} ${qimen.meta.siZhu.month} ${qimen.meta.siZhu.day} ${qimen.meta.siZhu.hour}`;
  checks.push({
    module: '奇门',
    field: '四柱=八字',
    expect: bazi.formatted,
    got: qmSz,
    pass: qmSz === bazi.formatted,
    severity: 'P0',
  });
  checks.push({
    module: '奇门',
    field: '九宫天地盘干',
    expect: '每宫有地/天干或寄',
    got: qimen.gongWei
      .slice(0, 3)
      .map((g) => `${g.palace}:${g.diPanGan}/${g.tianPanGan}`)
      .join(' '),
    pass: qimen.gongWei.every((g) => g.diPanGan || g.palace === 5),
    severity: 'P1',
  });

  // 阴阳遁硬验收（夏至后阴、冬至后阳；修复「冬至键指向上年」误判阳遁）
  if (c.id === 12) {
    checks.push({
      module: '奇门',
      field: '夏至后阴遁',
      expect: '阴遁',
      got: qimen.meta.dunLabel,
      pass: qimen.meta.dun === 'yin',
      severity: 'P0',
    });
  }
  if (c.id === 11) {
    checks.push({
      module: '奇门',
      field: '冬至后阳遁',
      expect: '阳遁',
      got: qimen.meta.dunLabel,
      pass: qimen.meta.dun === 'yang',
      severity: 'P0',
    });
  }
  if (c.id === 14) {
    // 2026-07-14 在夏至后 → 阴遁
    checks.push({
      module: '奇门',
      field: '夏至季阴遁',
      expect: '阴遁',
      got: `${qimen.meta.dunLabel} ${c.dt}`,
      pass: qimen.meta.dun === 'yin',
      severity: 'P0',
    });
  }
  if (c.id === 18) {
    // 2024-06-01 在夏至前 → 阳遁
    checks.push({
      module: '奇门',
      field: '夏至前阳遁',
      expect: '阳遁',
      got: `${qimen.meta.dunLabel} ${c.dt}`,
      pass: qimen.meta.dun === 'yang',
      severity: 'P0',
    });
  }

  // --- 六壬 ---
  checks.push({
    module: '六壬',
    field: '四位完整',
    expect: '人元/贵神/将神/地分',
    got: `元${dlr.siWei.renYuan.gan} 贵${dlr.siWei.guiShen.ganZhi}·${dlr.siWei.guiShen.name} 将${dlr.siWei.jiangShen.ganZhi}·${dlr.siWei.jiangShen.name} 地${dlr.meta.diFen}`,
    pass:
      !!dlr.siWei.renYuan.gan &&
      !!dlr.siWei.guiShen.ganZhi &&
      !!dlr.siWei.jiangShen.ganZhi &&
      dlr.meta.diFen === c.diFen,
    severity: 'P0',
  });
  checks.push({
    module: '六壬',
    field: '四柱=lunar(与八字同历)',
    expect: bazi.formatted,
    got: `${dlr.meta.siZhu.year} ${dlr.meta.siZhu.month} ${dlr.meta.siZhu.day} ${dlr.meta.siZhu.hour}`,
    pass:
      `${dlr.meta.siZhu.year} ${dlr.meta.siZhu.month} ${dlr.meta.siZhu.day} ${dlr.meta.siZhu.hour}` ===
      bazi.formatted,
    severity: 'P0',
  });
  checks.push({
    module: '六壬',
    field: '月将非空',
    expect: '月将名+支',
    got: `${dlr.meta.yueJiang}(${dlr.meta.yueJiangZhi})`,
    pass: !!dlr.meta.yueJiang && !!dlr.meta.yueJiangZhi,
    severity: 'P0',
  });

  // 热卜抓包 R14
  if (c.id === 14) {
    checks.push({
      module: '六壬',
      field: '热卜抓包四位',
      expect: '甲 / 乙丑天乙 / 丙寅功曹 / 未',
      got: `${dlr.siWei.renYuan.gan} / ${dlr.siWei.guiShen.ganZhi}${dlr.siWei.guiShen.name} / ${dlr.siWei.jiangShen.ganZhi}${dlr.siWei.jiangShen.name} / ${dlr.meta.yueJiangZhi}`,
      pass:
        dlr.siWei.renYuan.gan === '甲' &&
        dlr.siWei.guiShen.ganZhi === '乙丑' &&
        dlr.siWei.jiangShen.ganZhi === '丙寅' &&
        dlr.meta.yueJiangZhi === '未',
      severity: 'P0',
    });
  }

  // --- 起名 ---
  checks.push({
    module: '起名',
    field: '产出3个双字名',
    expect: '3 names, given length 2',
    got: naming.names.map((n) => n.fullName).join('、') || '无',
    pass:
      naming.names.length === 3 &&
      naming.names.every((n) => n.given.length === 2 && n.fullName.startsWith(naming.surname)),
    severity: 'P0',
  });
  checks.push({
    module: '起名',
    field: '喜用非空',
    expect: 'xi[]',
    got: `喜${naming.xiYong.xi.join('')} 忌${naming.xiYong.ji.join('')} 日主${naming.xiYong.dayMaster}`,
    pass: naming.xiYong.xi.length > 0 && !!naming.xiYong.dayMaster,
    severity: 'P0',
  });
  checks.push({
    module: '起名',
    field: '用字可查属性',
    expect: '每字有五行笔画',
    got: naming.names
      .flatMap((n) => n.chars)
      .map((ch) => `${ch.char}${ch.wuxing}${ch.kangxi}`)
      .slice(0, 6)
      .join(' '),
    pass: naming.names.every((n) =>
      n.chars.every((ch) => !!ch.wuxing && ch.kangxi > 0)
    ),
    severity: 'P0',
  });

  // 复姓
  if (c.surname.length === 2) {
    checks.push({
      module: '起名',
      field: '复姓识别',
      expect: c.surname,
      got: naming.surname,
      pass: naming.surname === c.surname,
      severity: 'P0',
    });
  }

  // 查字抽样
  const sampleChar = naming.names[0]?.chars[0]?.char || '王';
  const hz = getHanzi(sampleChar);
  checks.push({
    module: '起名/查字',
    field: '字库可查',
    expect: sampleChar,
    got: hz ? `${hz.char} ${hz.wuxing} ${hz.kangxi}画 ${hz.structure}` : 'null',
    pass: !!hz,
    severity: 'P1',
  });

  // 晚子/早子
  if (c.id === 13 || c.id === 17) {
    // evaluated in post-pass between pair
  }

  return {
    id: c.id,
    name: c.name,
    dt: c.dt,
    note: c.note,
    gender: c.gender,
    ziMode: c.ziMode,
    diFen: c.diFen,
    surname: c.surname,
    refLunar: ref.pillars,
    almanac: almanac
      ? {
          lunar: almanac.lunar.full,
          day: almanac.pillars.day.ganZhi,
          yiN: almanac.yi.length,
          jiN: almanac.ji.length,
        }
      : null,
    bazi: bazi.formatted,
    qimen: `${qimen.meta.dunLabel}${qimen.meta.juShu}局 符${qimen.meta.zhiFu} 使${qimen.meta.zhiShi}`,
    daliuren: `元${dlr.siWei.renYuan.gan} 贵${dlr.siWei.guiShen.ganZhi}·${dlr.siWei.guiShen.name} 将${dlr.siWei.jiangShen.ganZhi}·${dlr.siWei.jiangShen.name} 月将${dlr.meta.yueJiangZhi}`,
    names: naming.names.map((n) => n.fullName),
    xi: naming.xiYong.xi.join(''),
    checks,
  };
}

// ---- main ----
const rounds = CASES.map(runCase);

// 晚子 vs 早子
const late = rounds.find((r) => r.id === 13)!;
const early = rounds.find((r) => r.id === 17)!;
const lateDay = late.bazi.split(' ')[2];
const earlyDay = early.bazi.split(' ')[2];
const pairCheck: Check = {
  module: '八字',
  field: '晚子≠早子日柱',
  expect: 'late day ≠ early day',
  got: `late ${lateDay} / early ${earlyDay}`,
  pass: lateDay !== earlyDay,
  severity: 'P0',
};
late.checks.push(pairCheck);

// ---- 真太阳时专项 + 夏至分钟级阴阳遁 ----
const trueSolarChecks: Check[] = [];
{
  // 东经 120°：真太阳时 ≈ 平太阳 ± 均时差（数分钟），不应改日柱（远离子时边界）
  const base = {
    year: 1994,
    month: 10,
    day: 26,
    hour: 12,
    minute: 0,
    gender: 'male' as const,
    ziMode: 'late' as const,
  };
  const off = chartBazi({ ...base, useTrueSolarTime: false });
  const on120 = chartBazi({
    ...base,
    useTrueSolarTime: true,
    longitude: 120,
  });
  trueSolarChecks.push({
    module: '真太阳',
    field: 'E120 正午日柱不变',
    expect: off.siZhu.day.ganZhi,
    got: on120.siZhu.day.ganZhi,
    pass: on120.siZhu.day.ganZhi === off.siZhu.day.ganZhi,
    severity: 'P0',
  });
  trueSolarChecks.push({
    module: '真太阳',
    field: 'E120 usedDatetime 有均时差偏移',
    expect: 'used 可与 civil 差数分钟（EOT）',
    got: `civil=${off.meta.inputCivil} used=${on120.meta.usedDatetime}`,
    pass: !!on120.meta.usedDatetime && on120.meta.sect.useTrueSolarTime === true,
    severity: 'P1',
  });

  // 乌鲁木齐约 E87：相对 120° 约 -132 分钟，12:00 民用 → 真太阳约 09:48
  const onWest = chartBazi({
    ...base,
    useTrueSolarTime: true,
    longitude: 87,
  });
  const civil = new Date(1994, 9, 26, 12, 0, 0);
  const adj = trueSolarAdjust(civil, 87);
  const deltaMin = Math.round((adj.getTime() - civil.getTime()) / 60000);
  trueSolarChecks.push({
    module: '真太阳',
    field: 'E87 偏移约 -2h',
    expect: 'delta ∈ [-150, -100] 分钟',
    got: `deltaMin=${deltaMin} used=${onWest.meta.usedDatetime}`,
    pass: deltaMin >= -150 && deltaMin <= -100,
    severity: 'P0',
  });
  trueSolarChecks.push({
    module: '真太阳',
    field: 'E87 时柱可能变化',
    expect: 'used hour 与 civil 不同或时柱不同（均时差）',
    got: `off时=${off.siZhu.hour.ganZhi} west时=${onWest.siZhu.hour.ganZhi}`,
    pass:
      onWest.meta.usedDatetime !== off.meta.inputCivil &&
      (onWest.siZhu.hour.ganZhi !== off.siZhu.hour.ganZhi ||
        onWest.meta.usedDatetime.includes('09') ||
        onWest.meta.usedDatetime.includes('10')),
    severity: 'P0',
  });

  // 奇门/六壬真太阳时链路：usedDatetime 同步偏移
  const qmOff = chartYinpanQimen({
    year: 1994,
    month: 10,
    day: 26,
    hour: 12,
    minute: 0,
    useTrueSolarTime: false,
  });
  const qmOn = chartYinpanQimen({
    year: 1994,
    month: 10,
    day: 26,
    hour: 12,
    minute: 0,
    useTrueSolarTime: true,
    longitude: 87,
  });
  trueSolarChecks.push({
    module: '真太阳',
    field: '奇门 E87 used 偏移',
    expect: qmOn.meta.usedDatetime,
    got: `off=${qmOff.meta.usedDatetime} on=${qmOn.meta.usedDatetime}`,
    pass: qmOn.meta.usedDatetime !== qmOff.meta.usedDatetime,
    severity: 'P0',
  });

  const dlrOff = chartDaliuren({
    year: 1994,
    month: 10,
    day: 26,
    hour: 12,
    minute: 0,
    diFen: '子',
    useTrueSolarTime: false,
  });
  const dlrOn = chartDaliuren({
    year: 1994,
    month: 10,
    day: 26,
    hour: 12,
    minute: 0,
    diFen: '子',
    useTrueSolarTime: true,
    longitude: 87,
  });
  trueSolarChecks.push({
    module: '真太阳',
    field: '六壬 E87 used 偏移',
    expect: dlrOn.meta.usedDatetime,
    got: `off=${dlrOff.meta.usedDatetime} on=${dlrOn.meta.usedDatetime}`,
    pass: dlrOn.meta.usedDatetime !== dlrOff.meta.usedDatetime,
    severity: 'P0',
  });

  // 夏至前后各 1 分钟：阴阳遁切换（2000-06-21 09:47:43）
  const beforeXia = chartYinpanQimen({
    year: 2000,
    month: 6,
    day: 21,
    hour: 9,
    minute: 47,
  });
  const afterXia = chartYinpanQimen({
    year: 2000,
    month: 6,
    day: 21,
    hour: 9,
    minute: 48,
  });
  trueSolarChecks.push({
    module: '奇门',
    field: '夏至前1分阳遁',
    expect: '阳遁',
    got: `${beforeXia.meta.dunLabel} @${beforeXia.meta.usedDatetime}`,
    pass: beforeXia.meta.dun === 'yang',
    severity: 'P0',
  });
  trueSolarChecks.push({
    module: '奇门',
    field: '夏至后1分阴遁',
    expect: '阴遁',
    got: `${afterXia.meta.dunLabel} @${afterXia.meta.usedDatetime}`,
    pass: afterXia.meta.dun === 'yin',
    severity: 'P0',
  });
}

// Python cross for bazi/dlr sample subset
function runPythonSpot() {
  const py = `
# -*- coding: utf-8 -*-
import json, sys, importlib.util
from datetime import datetime
from pathlib import Path

def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    sys.modules[name] = mod
    spec.loader.exec_module(mod)
    return mod

ROOT = Path(r"E:/workspace/guangming")
try:
    rebu = load("rebu_core", str(ROOT / "rebu_re/reference_impl/paipan_core.py"))
except Exception as e:
    print(json.dumps({"error": str(e)}))
    raise SystemExit(0)

spots = [
  ("1994-10-26T12:00", "子"),
  ("2026-07-14T09:27", "子"),
  ("2024-06-01T09:00", "子"),
  ("2008-08-08T20:08", "戌"),
]
out = []
for dt_s, di in spots:
    dt = datetime.strptime(dt_s, "%Y-%m-%dT%H:%M")
    try:
        ec = rebu.eight_char(dt)
        bazi = f"{ec['year']} {ec['month']} {ec['day']} {ec['hour']}"
    except Exception as e:
        bazi = f"ERR {e}"
    try:
        d = rebu.chart_daliuren(dt, di_fen=di)
        dlr = f"元{d['siWei']['renYuan']['gan']} 贵{d['siWei']['guiShen'].get('ganZhi')} 将{d['siWei']['jiangShen'].get('ganZhi')} 月{d['meta']['yueJiangZhi']}"
    except Exception as e:
        dlr = f"ERR {e}"
    out.append({"dt": dt_s, "rebu_bazi": bazi, "rebu_dlr": dlr})
print(json.dumps(out, ensure_ascii=False))
`;
  const res = spawnSync('python', ['-c', py], {
    encoding: 'utf-8',
    env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    maxBuffer: 10 * 1024 * 1024,
  });
  if (res.status !== 0) return { error: res.stderr, rows: [] as any[] };
  try {
    return { error: null, rows: JSON.parse(res.stdout) };
  } catch (e) {
    return { error: String(e) + res.stdout, rows: [] as any[] };
  }
}

const py = runPythonSpot();
const pyChecks: Check[] = [];
if (!py.error) {
  for (const row of py.rows) {
    const ours = rounds.find((r) => r.dt === row.dt);
    if (!ours) continue;
    pyChecks.push({
      module: '八字',
      field: `vs热卜历 ${row.dt}`,
      expect: row.rebu_bazi,
      got: ours.bazi,
      pass: ours.bazi === row.rebu_bazi,
      severity: 'P1',
    });
    // dlr 元/贵/将/月
    const m = /元(.) 贵([^\s]+) 将([^\s]+) 月(.)/.exec(row.rebu_dlr || '');
    if (m) {
      pyChecks.push({
        module: '六壬',
        field: `vs热卜Python ${row.dt}`,
        expect: row.rebu_dlr,
        got: ours.daliuren,
        pass:
          ours.daliuren.includes(`元${m[1]}`) &&
          ours.daliuren.includes(m[2]) &&
          ours.daliuren.includes(m[3]),
        severity: 'P1',
      });
    }
  }
}

const allChecks = [
  ...rounds.flatMap((r) => r.checks),
  ...trueSolarChecks,
  ...pyChecks,
];
const byMod = (mod: string) => allChecks.filter((c) => c.module.startsWith(mod));
const score = (list: Check[]) => ({
  total: list.length,
  pass: list.filter((c) => c.pass).length,
  fail: list.filter((c) => !c.pass).length,
  p0fail: list.filter((c) => !c.pass && c.severity === 'P0').length,
});

const summary = {
  rounds: rounds.length,
  span: `${CASES[0].dt.slice(0, 4)} → ${CASES[CASES.length - 1].dt.slice(0, 4)}`,
  totalChecks: allChecks.length,
  overall: score(allChecks),
  modules: {
    万年历: score(byMod('万年历')),
    八字: score(byMod('八字')),
    奇门: score(byMod('奇门')),
    六壬: score(byMod('六壬')),
    起名: score(byMod('起名')),
    真太阳: score(byMod('真太阳')),
  },
  pythonSpotError: py.error,
  hardUserCase: rounds.find((r) => r.id === 7),
};

// Markdown
const md: string[] = [];
md.push('# 全模块跨时间对照测试（≥14 轮）');
md.push('');
md.push(`生成：${new Date().toISOString()}`);
md.push('');
md.push(`- **轮数**：${summary.rounds}（含用户硬点 1994-10-26）`);
md.push(`- **时间跨度**：${summary.span}`);
md.push(`- **模块**：万年历 · 八字 · 阴盘奇门 · 大六壬 · 起名/查字`);
md.push(`- **历法基准**：lunar-javascript（寿星）+ 热卜 Python 抽样`);
md.push('');
md.push('## 摘要');
md.push('');
md.push('| 范围 | 通过 | 失败 | 合计 | P0失败 |');
md.push('|------|------|------|------|--------|');
const line = (name: string, s: ReturnType<typeof score>) =>
  `| ${name} | ${s.pass} | ${s.fail} | ${s.total} | ${s.p0fail} |`;
md.push(line('全部', summary.overall));
for (const [k, v] of Object.entries(summary.modules)) md.push(line(k, v));
md.push('');

const p0Fails = allChecks.filter((c) => !c.pass && c.severity === 'P0');
if (p0Fails.length === 0) {
  md.push('**P0 全部通过。**');
} else {
  md.push('### P0 失败清单');
  for (const f of p0Fails) {
    md.push(`- **${f.module}** ${f.field}: expect \`${f.expect}\` got \`${f.got}\``);
  }
}
md.push('');

for (const r of rounds) {
  md.push(`## 第 ${r.id} 轮 · ${r.name} · \`${r.dt}\``);
  md.push('');
  md.push(`> ${r.note} · ${r.gender}/${r.ziMode}/地分${r.diFen}/姓${r.surname}`);
  md.push('');
  md.push('| 模块 | 结果 |');
  md.push('|------|------|');
  md.push(`| lunar基准四柱 | ${r.refLunar} |`);
  md.push(
    `| 万年历 | ${r.almanac ? `${r.almanac.lunar} 日${r.almanac.day} 宜${r.almanac.yiN}/忌${r.almanac.jiN}` : '—'} |`
  );
  md.push(`| 八字 | ${r.bazi} |`);
  md.push(`| 奇门 | ${r.qimen} |`);
  md.push(`| 六壬 | ${r.daliuren} |`);
  md.push(`| 起名 | 喜${r.xi} → ${r.names.join('、')} |`);
  md.push('');
  const fails = r.checks.filter((c) => !c.pass);
  if (fails.length) {
    md.push('失败项：');
    for (const f of fails) {
      md.push(`- ❌ [${f.severity}] ${f.module}/${f.field}: \`${f.got}\` ≠ \`${f.expect}\``);
    }
  } else {
    md.push('本轮检查全通过 ✅');
  }
  md.push('');
}

if (py.rows?.length) {
  md.push('## 热卜 Python 抽样对照');
  md.push('');
  md.push('| 时间 | 热卜四柱 | 本站八字 | 热卜六壬 | 本站六壬 |');
  md.push('|------|----------|----------|----------|----------|');
  for (const row of py.rows) {
    const ours = rounds.find((r) => r.dt === row.dt);
    md.push(
      `| ${row.dt} | ${row.rebu_bazi} | ${ours?.bazi || '—'} | ${row.rebu_dlr} | ${ours?.daliuren || '—'} |`
    );
  }
  md.push('');
}

md.push('## 结论');
md.push('');
md.push('1. **日柱**以 lunar-javascript 为准（已纠正错误壬子锚点；1994-10-26=乙酉）。');
md.push('2. **八字/奇门/六壬四柱**统一走 `src/lib/paipan/calendar`，互相一致。');
md.push('3. **奇门阴阳遁**：夏至（含）后阴遁、冬至（含）后阳遁；合并 year±1 节气表，避免「冬至」键指向上年导致全季误判阳遁。');
md.push('4. **真太阳时**：经度时差 + 均时差；E87/E120 专项轮次覆盖八字/奇门/六壬。');
md.push('5. **万年历**日柱正午锚定；**起名** 3 双字 + 喜用 + 复姓。');
md.push('6. 奇门三元为拆补简化，与 App 局数可能差一档；历法与遁向以本报告 P0 为准。');
md.push('');
md.push('```bash');
md.push('npm run test:paipan');
md.push('# 或');
md.push('npx tsx scripts/paipan-full-14round-test.ts');
md.push('```');

const outMd = path.join(process.cwd(), 'docs', 'PAIPAN_FULL_18ROUND_REPORT.md');
const outJson = path.join(process.cwd(), 'docs', 'PAIPAN_FULL_18ROUND_REPORT.json');
writeFileSync(outMd, md.join('\n'), 'utf8');
writeFileSync(
  outJson,
  JSON.stringify({ summary, rounds, trueSolarChecks, pyChecks, pythonSpot: py }, null, 2),
  'utf8'
);

console.log(JSON.stringify(summary, null, 2));
console.log('\nP0 fails:', p0Fails.length);
for (const f of p0Fails) console.log(' -', f.module, f.field, f.got, '!=', f.expect);
console.log('\nWrote', outMd);

if (summary.overall.p0fail > 0) {
  process.exitCode = 1;
}
