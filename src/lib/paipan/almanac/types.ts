/** Almanac (万年历 / 老黄历) day snapshot — frontend-only engine */

export interface GanZhiPillar {
  ganZhi: string;
  gan: string;
  zhi: string;
  naYin: string;
}

export interface AlmanacDay {
  /** YYYY-MM-DD */
  date: string;
  year: number;
  month: number;
  day: number;
  /** 0=Sun .. 6=Sat */
  week: number;
  weekName: string;
  weekNameZh: string;
  constellation: string;

  lunar: {
    yearCn: string;
    monthCn: string;
    dayCn: string;
    full: string;
    isLeap: boolean;
    month: number;
    day: number;
    yearShengXiao: string;
    dayShengXiao: string;
    yueXiang: string;
  };

  pillars: {
    year: GanZhiPillar;
    month: GanZhiPillar;
    day: GanZhiPillar;
    /** noon hour if no specific time */
    time?: GanZhiPillar & { hourLabel?: string };
  };

  solarTerms: {
    current: string | null;
    prevJie: string | null;
    nextJie: string | null;
    prevQi: string | null;
    nextQi: string | null;
    /** nearby term moments in this year for display */
    nearby: Array<{ name: string; datetime: string }>;
  };

  yi: string[];
  ji: string[];
  chong: string;
  chongShengXiao: string;
  sha: string;
  jianChu: string;
  xiu: string;
  xiuLuck: string;
  xiuSong: string;
  pengZuGan: string;
  pengZuZhi: string;
  tianShen: string;
  tianShenType: string;
  jiShen: string[];
  xiongSha: string[];
  festivals: string[];
  otherFestivals: string[];

  positions: {
    xi: string;
    fu: string;
    cai: string;
    yangGui: string;
    yinGui: string;
    taiSui: string;
    taiShen: string;
  };

  /** 12 shichen snapshot for the day (using each hour midpoint) */
  hours: Array<{
    zhi: string;
    label: string;
    ganZhi: string;
    yi: string[];
    ji: string[];
  }>;
}

export interface AlmanacMonthCell {
  date: string;
  day: number;
  lunarDayCn: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  yiTop: string | null;
  term: string | null;
  festival: string | null;
}
