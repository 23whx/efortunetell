/** 阴盘奇门 · 易世家规格常量 */

export const SAN_QI_LIU_YI = ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙'] as const;

export const JIU_XING: Record<number, string> = {
  1: '天蓬',
  2: '天芮',
  3: '天冲',
  4: '天辅',
  5: '天禽',
  6: '天心',
  7: '天柱',
  8: '天任',
  9: '天英',
};

export const BA_MEN: Record<number, string | null> = {
  1: '休',
  2: '死',
  3: '伤',
  4: '杜',
  5: null,
  6: '开',
  7: '惊',
  8: '生',
  9: '景',
};

export const BA_SHEN = ['值符', '腾蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天'] as const;

export const XUN_SHOU_YI: Record<string, string> = {
  甲子: '戊',
  甲戌: '己',
  甲申: '庚',
  甲午: '辛',
  甲辰: '壬',
  甲寅: '癸',
};

export const PALACE_RING_YANG = [1, 8, 3, 4, 9, 2, 7, 6];
export const PALACE_RING_YIN = [1, 6, 7, 2, 9, 4, 3, 8];

export const YANG_DUN_JU: Record<string, [number, number, number]> = {
  冬至: [1, 7, 4],
  小寒: [2, 8, 5],
  大寒: [3, 9, 6],
  立春: [8, 5, 2],
  雨水: [9, 6, 3],
  惊蛰: [1, 7, 4],
  春分: [3, 9, 6],
  清明: [4, 1, 7],
  谷雨: [5, 2, 8],
  立夏: [4, 1, 7],
  小满: [5, 2, 8],
  芒种: [6, 3, 9],
};

export const YIN_DUN_JU: Record<string, [number, number, number]> = {
  夏至: [9, 3, 6],
  小暑: [8, 2, 5],
  大暑: [7, 1, 4],
  立秋: [2, 5, 8],
  处暑: [1, 4, 7],
  白露: [9, 3, 6],
  秋分: [7, 1, 4],
  寒露: [6, 9, 3],
  霜降: [5, 8, 2],
  立冬: [6, 9, 3],
  小雪: [5, 8, 2],
  大雪: [4, 7, 1],
};

/** 24 节气顺序（从冬至起，便于阴阳遁） */
export const SOLAR_TERMS_ORDER = [
  '冬至',
  '小寒',
  '大寒',
  '立春',
  '雨水',
  '惊蛰',
  '春分',
  '清明',
  '谷雨',
  '立夏',
  '小满',
  '芒种',
  '夏至',
  '小暑',
  '大暑',
  '立秋',
  '处暑',
  '白露',
  '秋分',
  '寒露',
  '霜降',
  '立冬',
  '小雪',
  '大雪',
] as const;

export const PALACE_POS: Record<number, string> = {
  1: 'N',
  2: 'SW',
  3: 'E',
  4: 'SE',
  5: 'C',
  6: 'NW',
  7: 'W',
  8: 'NE',
  9: 'S',
};

export const PALACE_BAGUA: Record<number, string> = {
  1: '坎',
  2: '坤',
  3: '震',
  4: '巽',
  5: '中',
  6: '乾',
  7: '兑',
  8: '艮',
  9: '离',
};

/** 地支 → 宫（空亡/马星落宫） */
export const ZHI_PALACE: Record<string, number> = {
  子: 1,
  丑: 8,
  寅: 8,
  卯: 3,
  辰: 4,
  巳: 4,
  午: 9,
  未: 2,
  申: 2,
  酉: 7,
  戌: 6,
  亥: 6,
};

/** 九宫 UI 布局（屏幕视角）4 9 2 / 3 5 7 / 8 1 6 */
export const GRID_LAYOUT: number[][] = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6],
];
