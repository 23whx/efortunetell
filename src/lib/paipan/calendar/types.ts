/** 共用历法类型：四柱/真太阳/节气 */

export type ZiMode = 'late' | 'early';

export interface GanZhiParts {
  gan: string;
  zhi: string;
  ganZhi: string;
}

export interface FourPillars {
  year: GanZhiParts;
  month: GanZhiParts;
  day: GanZhiParts;
  hour: GanZhiParts;
  formatted: string;
}

export interface JieQiPoint {
  name: string;
  time: Date;
}

export interface CivilParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second?: number;
}
