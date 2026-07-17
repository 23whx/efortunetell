export type Gender = 'male' | 'female';
export type ZiMode = 'late' | 'early';
export type DayunDirection = 'forward' | 'backward';

export interface BaZiInput {
  /** Local civil datetime parts (Asia/Shanghai assumed unless noted) */
  year: number;
  month: number;
  day: number;
  hour: number;
  minute?: number;
  gender: Gender;
  /** 晚子时 late（默认）/ 早子时 early */
  ziMode?: ZiMode;
  useTrueSolarTime?: boolean;
  longitude?: number;
  latitude?: number;
  /** 问真 pdy 起运算法；默认 false=三天折一年 */
  pdy?: boolean;
}

export interface PillarView {
  gan: string;
  zhi: string;
  ganZhi: string;
  cangGan: string[];
  shiShenOnGan: string;
  shiShenOnCangGan: string[];
  naYin: string;
  wuxingGan: string;
  wuxingZhi: string;
}

export interface TermPoint {
  name: string;
  time: string; // YYYY-MM-DD HH:mm
}

export interface SiLingInfo {
  gan: string;
  shiShen: string;
  /** 节后第几天（1-based） */
  dayInJie: number;
  segmentLabel: string;
  table: Array<{ gan: string; days: number }>;
}

export interface DaYunCycle {
  index: number;
  ganZhi: string;
  gan: string;
  zhi: string;
  naYin: string;
  shiShenOnGan: string;
  cangGan: string[];
  startAge: number;
  endAge: number;
  startDate: string;
  endDate: string;
  jiaoYunDate: string;
}

export interface BaZiChart {
  meta: {
    product: string;
    inputCivil: string;
    usedDatetime: string;
    timezone: string;
    sect: {
      ziMode: ZiMode;
      useTrueSolarTime: boolean;
      pdy: boolean;
      yearBoundary: 'lichun';
      monthBoundary: 'jie';
    };
    gender: Gender;
    longitude: number | null;
    latitude: number | null;
    prevJie: TermPoint;
    nextJie: TermPoint;
    liChun: TermPoint | null;
    birthSolarTerms: {
      prev: TermPoint;
      next: TermPoint;
      /** 出生时是否恰在节气时刻 */
      onTerm: string | null;
    };
    engineNote: string;
  };
  siZhu: {
    year: PillarView;
    month: PillarView;
    day: PillarView;
    hour: PillarView;
  };
  formatted: string;
  xunKong: [string, string];
  xunShou: string;
  zodiac: string;
  siLing: SiLingInfo;
  daYun: {
    direction: DayunDirection;
    directionLabel: string;
    startAgeYears: number;
    startAgeText: string;
    qiyunDate: string;
    qiyunDesc: string;
    deltaDaysToJie: number;
    cycles: DaYunCycle[];
  };
}
