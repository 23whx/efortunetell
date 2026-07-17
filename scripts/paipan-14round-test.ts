/**
 * 14 轮排盘对照：本站引擎 vs 文档黄金 / 热卜抓包 / Python 参考实现
 * 运行: npx tsx scripts/paipan-14round-test.ts
 */
import { writeFileSync } from 'fs';
import { spawnSync } from 'child_process';
import path from 'path';
import { chartBazi } from '../src/lib/paipan/bazi/engine';
import { chartYinpanQimen } from '../src/lib/paipan/qimen/engine';
import { chartDaliuren } from '../src/lib/paipan/daliuren/engine';

type Case = {
  id: number;
  name: string;
  dt: string;
  gender: 'male' | 'female';
  ziMode: 'late' | 'early';
  diFen: string;
  notes: string;
};

const CASES: Case[] = [
  { id: 1, name: 'BAZI-01 黄金', dt: '1990-01-15T10:30', gender: 'male', ziMode: 'late', diFen: '子', notes: '问真/易世家 BAZI-01' },
  { id: 2, name: '晚子 23:30', dt: '1990-01-15T23:30', gender: 'male', ziMode: 'late', diFen: '丑', notes: '晚子换日' },
  { id: 3, name: '早子 23:30', dt: '1990-01-15T23:30', gender: 'male', ziMode: 'early', diFen: '丑', notes: '早子不换日' },
  { id: 4, name: '立春前', dt: '1990-02-04T09:00', gender: 'male', ziMode: 'late', diFen: '寅', notes: '年柱上一年' },
  { id: 5, name: '立春后', dt: '1990-02-04T11:00', gender: 'male', ziMode: 'late', diFen: '寅', notes: '年柱新年' },
  { id: 6, name: '夏至段', dt: '2000-06-21T12:00', gender: 'female', ziMode: 'late', diFen: '午', notes: '奇门遁边界' },
  { id: 7, name: '冬至段', dt: '2010-12-22T08:00', gender: 'male', ziMode: 'late', diFen: '子', notes: '阳遁段' },
  { id: 8, name: '奇门六壬 demo', dt: '2024-06-01T09:00', gender: 'male', ziMode: 'late', diFen: '子', notes: '参考实现主样例' },
  { id: 9, name: '热卜奇门抓包', dt: '2026-07-14T09:24', gender: 'male', ziMode: 'late', diFen: '子', notes: 'App 阴遁2局' },
  { id: 10, name: '热卜六壬抓包', dt: '2026-07-14T09:27', gender: 'male', ziMode: 'late', diFen: '子', notes: '金口诀四位' },
  { id: 11, name: '甲子年后', dt: '1984-02-05T10:00', gender: 'male', ziMode: 'late', diFen: '辰', notes: '1984立春后' },
  { id: 12, name: '奥运晚', dt: '2008-08-08T20:08', gender: 'female', ziMode: 'late', diFen: '申', notes: '戌时附近' },
  { id: 13, name: '春分附近', dt: '2015-03-21T11:00', gender: 'male', ziMode: 'late', diFen: '卯', notes: '中气边界' },
  { id: 14, name: '深夜晚子女', dt: '1992-11-11T23:45', gender: 'female', ziMode: 'late', diFen: '亥', notes: '晚子+女命' },
];

function parse(dt: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(dt)!;
  return { year: +m[1], month: +m[2], day: +m[3], hour: +m[4], minute: +m[5] };
}

function runOurs(c: Case) {
  const p = parse(c.dt);
  const bazi = chartBazi({ ...p, gender: c.gender, ziMode: c.ziMode });
  const qimen = chartYinpanQimen({ ...p, ziMode: c.ziMode, method: 'chaibu' });
  const dlr = chartDaliuren({
    ...p,
    diFen: c.diFen,
    huanJiang: 'zhongqi',
    guiType: 'maoYou',
  });
  return {
    id: c.id,
    name: c.name,
    dt: c.dt,
    gender: c.gender,
    ziMode: c.ziMode,
    diFen: c.diFen,
    notes: c.notes,
    bazi: {
      pillars: bazi.formatted,
      year: bazi.siZhu.year.ganZhi,
      month: bazi.siZhu.month.ganZhi,
      day: bazi.siZhu.day.ganZhi,
      hour: bazi.siZhu.hour.ganZhi,
      xunKong: bazi.xunKong.join(''),
      dayunDir: bazi.daYun.directionLabel,
      qiyun: bazi.daYun.qiyunDate,
      siLing: bazi.siLing.gan + bazi.siLing.shiShen,
      prevJie: bazi.meta.prevJie.name,
    },
    qimen: {
      dun: qimen.meta.dun,
      dunLabel: qimen.meta.dunLabel,
      ju: qimen.meta.juShu,
      yuan: qimen.meta.yuanLabel,
      jie: qimen.meta.jieQi,
      xun: qimen.meta.xunShou + qimen.meta.xunShouYi,
      zhiFu: qimen.meta.zhiFu,
      zhiShi: qimen.meta.zhiShi,
      siZhu: `${qimen.meta.siZhu.year} ${qimen.meta.siZhu.month} ${qimen.meta.siZhu.day} ${qimen.meta.siZhu.hour}`,
    },
    daliuren: {
      siZhu: `${dlr.meta.siZhu.year} ${dlr.meta.siZhu.month} ${dlr.meta.siZhu.day} ${dlr.meta.siZhu.hour}`,
      yueJiang: dlr.meta.yueJiang,
      yueJiangZhi: dlr.meta.yueJiangZhi,
      renYuan: dlr.siWei.renYuan.gan,
      guiShen: `${dlr.siWei.guiShen.ganZhi}·${dlr.siWei.guiShen.name}`,
      jiangShen: `${dlr.siWei.jiangShen.ganZhi}·${dlr.siWei.jiangShen.name}`,
      riKong: dlr.meta.riKong,
      siDa: dlr.meta.siDaKongWang,
      diFen: dlr.meta.diFen,
    },
  };
}

type Check = {
  field: string;
  expect: string;
  got: string;
  pass: boolean;
  ref: string;
  severity: 'P0' | 'P1' | 'info';
};

function evaluate(r: ReturnType<typeof runOurs>): Check[] {
  const checks: Check[] = [];

  // Round 1: 通行历（lunar）
  if (r.id === 1) {
    checks.push({
      field: '八字四柱',
      expect: '己巳 丁丑 庚辰 辛巳',
      got: r.bazi.pillars,
      pass: r.bazi.pillars === '己巳 丁丑 庚辰 辛巳',
      ref: 'lunar-javascript / 热卜历法（纠正错误壬子锚点）',
      severity: 'P0',
    });
  }

  // Round 2/3 late vs early day pillar different
  if (r.id === 2 || r.id === 3) {
    // filled after both run in main
  }

  // Round 4/5 year pillar change across lichun
  if (r.id === 4) {
    checks.push({
      field: '立春前年柱',
      expect: '己巳 (1989 立春体系)',
      got: r.bazi.year,
      pass: r.bazi.year === '己巳',
      ref: '易世家/问真 立春换年',
      severity: 'P0',
    });
  }
  if (r.id === 5) {
    checks.push({
      field: '立春后年柱',
      expect: '庚午',
      got: r.bazi.year,
      pass: r.bazi.year === '庚午',
      ref: '易世家/问真 立春换年',
      severity: 'P0',
    });
  }

  // Round 8 reference python
  if (r.id === 8) {
    checks.push({
      field: '奇门 阳遁8局符使',
      expect: '阳遁8 天冲 伤',
      got: `${r.qimen.dunLabel}${r.qimen.ju} ${r.qimen.zhiFu} ${r.qimen.zhiShi}`,
      pass:
        r.qimen.dun === 'yang' &&
        r.qimen.ju === 8 &&
        r.qimen.zhiFu === '天冲' &&
        r.qimen.zhiShi.includes('伤'),
      ref: '易世家 reference_impl chart_yinpan_qimen',
      severity: 'P0',
    });
    checks.push({
      field: '六壬 元/贵/将/月将',
      expect: '戊 / 癸巳腾蛇 / 辛卯太冲 / 申',
      got: `${r.daliuren.renYuan} / ${r.daliuren.guiShen} / ${r.daliuren.jiangShen} / ${r.daliuren.yueJiangZhi}`,
      pass:
        r.daliuren.renYuan === '戊' &&
        r.daliuren.guiShen.startsWith('癸巳') &&
        r.daliuren.jiangShen.startsWith('辛卯') &&
        r.daliuren.yueJiangZhi === '申',
      ref: '热卜 reference_impl chart_daliuren',
      severity: 'P0',
    });
  }

  // Round 9 热卜 App qimen
  if (r.id === 9) {
    const appSiZhu = '丙午 乙未 己丑 己巳';
    checks.push({
      field: '奇门四柱 vs 热卜App',
      expect: appSiZhu,
      got: r.qimen.siZhu,
      pass: r.qimen.siZhu === appSiZhu,
      ref: '热卜 UI 抓包 sample',
      severity: 'P0',
    });
    checks.push({
      field: '奇门局/符/使 vs 热卜App',
      expect: '阴遁2 天芮 死',
      got: `${r.qimen.dunLabel}${r.qimen.ju} ${r.qimen.zhiFu} ${r.qimen.zhiShi}`,
      pass:
        r.qimen.dun === 'yin' &&
        r.qimen.ju === 2 &&
        r.qimen.zhiFu === '天芮' &&
        r.qimen.zhiShi.includes('死'),
      ref: '热卜 UI 抓包 sample',
      severity: 'P0',
    });
  }

  // Round 10 热卜 App dlr
  if (r.id === 10) {
    checks.push({
      field: '六壬四柱 vs 热卜App',
      expect: '丙午 乙未 己丑 己巳',
      got: r.daliuren.siZhu,
      pass: r.daliuren.siZhu === '丙午 乙未 己丑 己巳',
      ref: '热卜金口诀抓包',
      severity: 'P0',
    });
    checks.push({
      field: '六壬四位 vs 热卜App',
      expect: '甲 / 乙丑天乙 / 丙寅功曹 / 月将未',
      got: `${r.daliuren.renYuan} / ${r.daliuren.guiShen} / ${r.daliuren.jiangShen} / ${r.daliuren.yueJiangZhi}`,
      pass:
        r.daliuren.renYuan === '甲' &&
        r.daliuren.guiShen.startsWith('乙丑') &&
        r.daliuren.jiangShen.startsWith('丙寅') &&
        r.daliuren.yueJiangZhi === '未',
      ref: '热卜金口诀抓包',
      severity: 'P0',
    });
  }

  // Internal: bazi day/hour vs qimen siZhu (same engine path)
  const baziDay = r.bazi.day;
  const baziHour = r.bazi.hour;
  const qmParts = r.qimen.siZhu.split(' ');
  checks.push({
    field: '八字日时 = 奇门日时',
    expect: `${baziDay} ${baziHour}`,
    got: `${qmParts[2]} ${qmParts[3]}`,
    pass: baziDay === qmParts[2] && baziHour === qmParts[3],
    ref: '本站内聚（同子时规则）',
    severity: 'P0',
  });

  // daliuren uses lunar-js eightchar - may differ from yishijia day pillar
  const dlrParts = r.daliuren.siZhu.split(' ');
  checks.push({
    field: '八字日柱 vs 六壬日柱(历法源)',
    expect: `八字 ${baziDay}（易世家锚点）`,
    got: `六壬 ${dlrParts[2]}（lunar-js/热卜历）`,
    pass: baziDay === dlrParts[2],
    ref: '说明：六壬对齐热卜历法，八字对齐易世家日柱锚点，允许不同',
    severity: 'info',
  });

  return checks;
}

function runPythonRefs(_cases: Case[]) {
  const res = spawnSync('python', ['scripts/paipan-14round-python.py'], {
    encoding: 'utf-8',
    maxBuffer: 20 * 1024 * 1024,
    cwd: 'E:/workspace/efortunetell',
    env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
  });
  if (res.status !== 0) {
    return { error: res.stderr || res.stdout, rows: [] as any[] };
  }
  try {
    return { error: null, rows: JSON.parse(res.stdout) };
  } catch (e) {
    return { error: String(e) + '\n' + res.stdout, rows: [] as any[] };
  }
}

// ---- main ----
const ours = CASES.map(runOurs);

// late/early pair check
const late = ours.find((x) => x.id === 2)!;
const early = ours.find((x) => x.id === 3)!;
const lateEarlyChecks: Check[] = [
  {
    field: '晚子 vs 早子 日柱不同',
    expect: 'late day ≠ early day',
    got: `late ${late.bazi.day} / early ${early.bazi.day}`,
    pass: late.bazi.day !== early.bazi.day,
    ref: '易世家 ziMode',
    severity: 'P0',
  },
];

const py = runPythonRefs(CASES);

const rounds = ours.map((r) => {
  const checks = evaluate(r);
  if (r.id === 2) checks.push(...lateEarlyChecks);

  const pref = py.rows.find((x: any) => x.id === r.id);
  const cross: Check[] = [];
  if (pref && !py.error) {
    cross.push({
      field: '八字 vs 易世家Python',
      expect: pref.yishijia_bazi,
      got: r.bazi.pillars,
      pass: pref.yishijia_bazi === r.bazi.pillars,
      ref: 'apk_re/reference_impl',
      severity: 'P1',
    });
    cross.push({
      field: '八字 vs 问真Python',
      expect: pref.wenzhen_bazi,
      got: r.bazi.pillars,
      pass: pref.wenzhen_bazi === r.bazi.pillars,
      ref: 'pcbz_iwzwh_re/reference_impl',
      severity: 'P1',
    });
    // qimen vs yishijia py
    const ourQ = `${r.qimen.dun}${r.qimen.ju}`;
    const ysQ = String(pref.yishijia_qimen);
    cross.push({
      field: '奇门 vs 易世家Python局',
      expect: ysQ,
      got: `${r.qimen.dunLabel}${r.qimen.ju} 符${r.qimen.zhiFu} 使${r.qimen.zhiShi}`,
      pass: ysQ.includes(String(r.qimen.ju)) && ysQ.includes(r.qimen.dun),
      ref: 'apk_re/reference_impl',
      severity: 'P1',
    });
    cross.push({
      field: '六壬 vs 热卜Python',
      expect: pref.rebu_daliuren,
      got: `元${r.daliuren.renYuan} 贵${r.daliuren.guiShen} 将${r.daliuren.jiangShen} 月将${r.daliuren.yueJiangZhi}`,
      pass: String(pref.rebu_daliuren).includes(r.daliuren.renYuan || '') &&
        String(pref.rebu_daliuren).includes((r.daliuren.guiShen || '').split('·')[0]),
      ref: 'rebu_re/reference_impl',
      severity: 'P1',
    });
  }

  return {
    ...r,
    checks: [...checks, ...cross],
    pythonRef: pref || null,
  };
});

const all = rounds.flatMap((r) => r.checks);
const p0 = all.filter((c) => c.severity === 'P0');
const p1 = all.filter((c) => c.severity === 'P1');
const info = all.filter((c) => c.severity === 'info');

const summary = {
  rounds: 14,
  totalChecks: all.length,
  p0: { total: p0.length, pass: p0.filter((c) => c.pass).length, fail: p0.filter((c) => !c.pass).length },
  p1: { total: p1.length, pass: p1.filter((c) => c.pass).length, fail: p1.filter((c) => !c.pass).length },
  info: { total: info.length, match: info.filter((c) => c.pass).length, diverge: info.filter((c) => !c.pass).length },
  pythonError: py.error,
};

// Markdown report
const md: string[] = [];
md.push('# 排盘 14 轮对照测试报告');
md.push('');
md.push(`生成时间：${new Date().toISOString()}`);
md.push('');
md.push('## 摘要');
md.push('');
md.push('| 级别 | 通过 | 失败 | 合计 |');
md.push('|------|------|------|------|');
md.push(`| P0 硬验收（黄金/抓包/规则） | ${summary.p0.pass} | ${summary.p0.fail} | ${summary.p0.total} |`);
md.push(`| P1 参考实现交叉 | ${summary.p1.pass} | ${summary.p1.fail} | ${summary.p1.total} |`);
md.push(`| info 历法源差异说明 | 一致 ${summary.info.match} | 分歧 ${summary.info.diverge} | ${summary.info.total} |`);
md.push('');
md.push('### 参考对象');
md.push('');
md.push('- **易世家**：`guangming/apk_re` 规格 + Python reference_impl + 日柱锚点 BAZI-01');
md.push('- **问真八字**：`guangming/pcbz_iwzwh_re` Python reference_impl');
md.push('- **热卜**：`guangming/rebu_re` 抓包 JSON + Python reference_impl（奇门/金口诀）');
md.push('- **本站**：`src/lib/paipan/{bazi,qimen,daliuren}`');
md.push('');
md.push('> 注：未实时调用三家线上 API（反爬/登录态）；对照以资料包黄金用例、App 抓包与本地可运行参考实现为准。');
md.push('');

for (const r of rounds) {
  md.push(`## 第 ${r.id} 轮 · ${r.name}`);
  md.push('');
  md.push(`- **时间**：\`${r.dt}\` · 性别 ${r.gender} · 子时 ${r.ziMode} · 地分 ${r.diFen}`);
  md.push(`- **说明**：${r.notes}`);
  md.push('');
  md.push('| 模块 | 本站结果 |');
  md.push('|------|----------|');
  md.push(`| 八字 | ${r.bazi.pillars} · 空亡${r.bazi.xunKong} · 大运${r.bazi.dayunDir} · 司令${r.bazi.siLing} · 节${r.bazi.prevJie} |`);
  md.push(`| 奇门 | ${r.qimen.dunLabel}${r.qimen.ju}局 ${r.qimen.yuan} · ${r.qimen.jie} · 旬${r.qimen.xun} · 符${r.qimen.zhiFu} · 使${r.qimen.zhiShi} · 柱 ${r.qimen.siZhu} |`);
  md.push(`| 六壬 | 柱 ${r.daliuren.siZhu} · 月将${r.daliuren.yueJiang}(${r.daliuren.yueJiangZhi}) · 元${r.daliuren.renYuan} · 贵${r.daliuren.guiShen} · 将${r.daliuren.jiangShen} · 空${r.daliuren.riKong} |`);
  md.push('');
  if (r.pythonRef) {
    md.push('**Python 参考**：');
    md.push(`- 易世家八字：\`${r.pythonRef.yishijia_bazi}\``);
    md.push(`- 问真八字：\`${r.pythonRef.wenzhen_bazi}\``);
    md.push(`- 易世家奇门：\`${r.pythonRef.yishijia_qimen}\``);
    md.push(`- 热卜奇门：\`${r.pythonRef.rebu_qimen}\` 柱 \`${r.pythonRef.rebu_qimen_sizhu}\``);
    md.push(`- 热卜六壬：\`${r.pythonRef.rebu_daliuren}\` 柱 \`${r.pythonRef.rebu_daliuren_sizhu}\``);
    md.push('');
  }
  md.push('| 检查项 | 期望 | 本站 | 结果 | 参考 |');
  md.push('|--------|------|------|------|------|');
  for (const c of r.checks) {
    md.push(
      `| ${c.field} | ${c.expect.replace(/\|/g, '/')} | ${c.got.replace(/\|/g, '/')} | ${c.pass ? '✅' : '❌'} ${c.severity} | ${c.ref} |`
    );
  }
  md.push('');
}

md.push('## 结论与后续');
md.push('');
const p0Fail = p0.filter((c) => !c.pass);
if (p0Fail.length === 0) {
  md.push('- **P0 硬验收全部通过**（含 BAZI-01、立春换年、晚早子差分、2024-06-01 参考实现、内聚日时柱）。');
} else {
  md.push('- **P0 失败项**：');
  for (const f of p0Fail) {
    md.push(`  - ${f.field}: expect \`${f.expect}\` got \`${f.got}\` (${f.ref})`);
  }
}
md.push('- 热卜 App 抓包轮次（9/10）：若失败，多因 **节气库时刻/三元简化** 或 **App 服务端与本地规格差**；以抓包为金标准时需继续微调定局与四柱历法源。');
md.push('- 八字与六壬日柱可能故意不同源：八字=易世家甲戌锚点，六壬=lunar-js/热卜。');
md.push('');

const reportPath = path.join(process.cwd(), 'docs', 'PAIPAN_14ROUND_REPORT.md');
const jsonPath = path.join(process.cwd(), 'docs', 'PAIPAN_14ROUND_REPORT.json');
writeFileSync(reportPath, md.join('\n'), 'utf8');
writeFileSync(jsonPath, JSON.stringify({ summary, rounds }, null, 2), 'utf8');

console.log(JSON.stringify(summary, null, 2));
console.log('\nWrote', reportPath);
console.log('Wrote', jsonPath);
if (py.error) console.error('Python ref error:', py.error.slice(0, 500));
