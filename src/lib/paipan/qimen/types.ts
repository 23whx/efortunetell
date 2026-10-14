import type { ZiMode } from '@/lib/paipan/bazi';

export type DunType = 'yang' | 'yin';
export type YuanType = 'shang' | 'zhong' | 'xia';
/** yinpan：阴盘定局（年支+农历月日+时支）；chaibu：拆补法（节气 + 符头三元） */
export type QimenMethod = 'yinpan' | 'chaibu';
/**
 * 历法源：
 * - lunar（默认）：四柱/节气均用 lunar-javascript（与黄历一致，推荐）
 * - yishijia：定局表/九宫布局按易世家规格；四柱同样走 lunar（旧 JD 日柱锚点已废弃）
 */
export type QimenCalendarSource = 'lunar' | 'yishijia';

export interface QimenInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute?: number;
  ziMode?: ZiMode;
  useTrueSolarTime?: boolean;
  longitude?: number;
  /** 默认 yinpan */
  method?: QimenMethod;
  /** 默认 lunar；yishijia 仅影响 meta 标注（定局表本即易世家） */
  calendarSource?: QimenCalendarSource;
}

export interface GongWei {
  palace: number;
  position: string;
  bagua: string;
  diPanGan: string | null;
  tianPanGan: string | null;
  star: string | null;
  men: string | null;
  shen: string | null;
  anGan: string | null;
  /** 中五宫地盘干（随天禽寄坤、随天芮落宫） */
  qinGan: string | null;
  maXing: boolean;
  kongWang: boolean;
  /** 四害：天盘干入墓（值符神不入墓，除非该干为日干） */
  ruMu: boolean;
  /** 四害：六仪击刑（天盘干） */
  jiXing: boolean;
  /** 四害：门迫（门克宫） */
  menPo: boolean;
}

export interface QimenChart {
  meta: {
    product: string;
    inputCivil: string;
    usedDatetime: string;
    dun: DunType;
    dunLabel: string;
    jieQi: string;
    jieStart: string;
    jieEnd: string;
    /** 仅拆补法有三元 */
    yuan: YuanType | null;
    yuanLabel: string;
    juShu: number;
    xunShou: string;
    xunShouYi: string;
    zhiFu: string;
    zhiShi: string;
    siZhu: {
      year: string;
      month: string;
      day: string;
      hour: string;
    };
    kongWang: [string, string];
    maZhi: string;
    /** 时干自坐墓（戊戌/丙戌/癸未/丁丑/己丑时） */
    shiGanZuoMu: boolean;
    method: QimenMethod;
    calendarSource: QimenCalendarSource;
    panType: 'yin';
    homeType: 'shi';
    note: string;
  };
  diPan: Record<string, string>;
  gongWei: GongWei[];
  /** 九宫按宫号 1..9 */
  byPalace: Record<number, GongWei>;
}
