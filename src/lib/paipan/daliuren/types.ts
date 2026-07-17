export type HuanJiang = 'zhongqi' | 'jiaojie';
export type GuiType = 'maoYou' | 'day' | 'night';
export type SeatKey = 'renYuan' | 'guiShen' | 'jiangShen' | 'diFen';

export interface DaliurenInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute?: number;
  /** 地分十二支 */
  diFen?: string;
  /** 1–12 → 子…亥 */
  diFenNumber?: number;
  huanJiang?: HuanJiang;
  /** 贵神类型：卯酉区分 / 昼 / 夜 */
  guiType?: GuiType;
  /** 晚子/早子，与八字一致 */
  ziMode?: 'late' | 'early';
  useTrueSolarTime?: boolean;
  longitude?: number;
}

export interface WeiSlot {
  label: string;
  gan: string | null;
  zhi: string | null;
  ganZhi: string | null;
  name: string | null;
  wx: string;
  wangShuai: string;
  dong: string[];
  flags: string[];
  shenSha: string[];
}

export interface DaliurenChart {
  meta: {
    projectLabel: string;
    inputCivil: string;
    usedDatetime: string;
    siZhu: {
      year: string;
      month: string;
      day: string;
      hour: string;
    };
    yueJiang: string;
    yueJiangZhi: string;
    huanJiang: string;
    jieQiRange: string;
    diFen: string;
    riKong: string;
    siDaKongWang: string;
    koujue: string;
    guiType: string;
    yongSeat: SeatKey;
    yongSeatLabel: string;
    note: string;
  };
  siWei: {
    renYuan: WeiSlot;
    guiShen: WeiSlot;
    jiangShen: WeiSlot;
    diFen: WeiSlot;
  };
  dongFlags: Record<string, boolean>;
  relations: string[];
}
