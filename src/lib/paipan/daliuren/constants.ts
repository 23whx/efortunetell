/** 大六壬（热卜金口诀算法）常量 — UI 产品名仍称大六壬 */

export const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
export const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

export const JIA_ZI: string[] = (() => {
  const out: string[] = [];
  for (let i = 0; i < 60; i++) out.push(TIAN_GAN[i % 10] + DI_ZHI[i % 12]);
  return out;
})();

export const YUE_JIANG_NAME: Record<string, string> = {
  亥: '登明',
  戌: '河魁',
  酉: '从魁',
  申: '传送',
  未: '小吉',
  午: '胜光',
  巳: '太乙',
  辰: '天罡',
  卯: '太冲',
  寅: '功曹',
  丑: '大吉',
  子: '神后',
};

/** 中气 → 月将支 */
export const ZHONGQI_TO_YJ: Record<string, string> = {
  雨水: '亥',
  春分: '戌',
  谷雨: '酉',
  小满: '申',
  夏至: '未',
  大暑: '午',
  处暑: '巳',
  秋分: '辰',
  霜降: '卯',
  小雪: '寅',
  冬至: '丑',
  大寒: '子',
};

export const WU_SHU: Record<string, string> = {
  甲: '甲',
  己: '甲',
  乙: '丙',
  庚: '丙',
  丙: '戊',
  辛: '戊',
  丁: '庚',
  壬: '庚',
  戊: '壬',
  癸: '壬',
};

/** (昼贵落宫, 夜贵落宫, 昼顺?, 夜顺?) */
export const GUI_REN_RULE: Record<
  string,
  [string, string, boolean, boolean]
> = {
  甲: ['丑', '未', true, false],
  戊: ['丑', '未', true, false],
  庚: ['丑', '未', true, false],
  乙: ['子', '申', true, false],
  己: ['子', '申', true, false],
  丙: ['亥', '酉', true, false],
  丁: ['亥', '酉', true, false],
  壬: ['巳', '卯', false, true],
  癸: ['巳', '卯', false, true],
  辛: ['午', '寅', false, true],
};

export const GUI_SHEN_NAMES = [
  '天乙',
  '腾蛇',
  '朱雀',
  '六合',
  '勾陈',
  '青龙',
  '天空',
  '白虎',
  '太常',
  '玄武',
  '太阴',
  '天后',
] as const;

export const GUI_SHEN_BENWEI: Record<string, string> = {
  天乙: '丑',
  腾蛇: '巳',
  朱雀: '午',
  六合: '卯',
  勾陈: '辰',
  青龙: '寅',
  天空: '戌',
  白虎: '申',
  太常: '未',
  玄武: '子',
  太阴: '酉',
  天后: '亥',
};

export const WX_GAN: Record<string, string> = {
  甲: '木',
  乙: '木',
  丙: '火',
  丁: '火',
  戊: '土',
  己: '土',
  庚: '金',
  辛: '金',
  壬: '水',
  癸: '水',
};

export const WX_ZHI: Record<string, string> = {
  子: '水',
  丑: '土',
  寅: '木',
  卯: '木',
  辰: '土',
  巳: '火',
  午: '火',
  未: '土',
  申: '金',
  酉: '金',
  戌: '土',
  亥: '水',
};

export const WX_SHENG: Record<string, string> = {
  木: '火',
  火: '土',
  土: '金',
  金: '水',
  水: '木',
};

export const WX_KE: Record<string, string> = {
  木: '土',
  土: '水',
  水: '火',
  火: '金',
  金: '木',
};

/** 月支 → 当令五行（旺） */
export const YUE_WANG_WX: Record<string, string> = {
  寅: '木',
  卯: '木',
  辰: '土',
  巳: '火',
  午: '火',
  未: '土',
  申: '金',
  酉: '金',
  戌: '土',
  亥: '水',
  子: '水',
  丑: '土',
};

export const LIU_HE_YUEJIANG: Record<string, string> = {
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

export const XUN_KONG: Record<string, [string, string]> = {
  甲子: ['戌', '亥'],
  甲戌: ['申', '酉'],
  甲申: ['午', '未'],
  甲午: ['辰', '巳'],
  甲辰: ['寅', '卯'],
  甲寅: ['子', '丑'],
};
