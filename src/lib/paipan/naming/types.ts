export type Wuxing = '金' | '木' | '水' | '火' | '土';
export type Gender = 'male' | 'female';

export interface HanziRecord {
  char: string;
  wuxing: Wuxing | string;
  kangxi: number;
  modern: number;
  radical: string;
  radicalKangxi: string;
  structure: string;
}

export interface XiYongResult {
  dayMaster: string;
  dayMasterWx: Wuxing;
  /** 喜用（优先取用） */
  xi: Wuxing[];
  /** 忌 */
  ji: Wuxing[];
  /** 五行统计（干支简单计分） */
  counts: Record<Wuxing, number>;
  method: 'simplified-v1';
  note: string;
}

export interface GeneratedName {
  fullName: string;
  surname: string;
  given: string;
  chars: HanziRecord[];
  score: number;
  reason: string;
}

export interface NameGenerateInput {
  surname: string;
  gender: Gender;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute?: number;
  ziMode?: 'late' | 'early';
  count?: number;
}
