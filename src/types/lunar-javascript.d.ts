declare module 'lunar-javascript' {
  export class Solar {
    static fromYmd(y: number, m: number, d: number): Solar;
    static fromYmdHms(
      y: number,
      m: number,
      d: number,
      hour: number,
      minute: number,
      second: number
    ): Solar;
    getLunar(): Lunar;
    getWeek(): number;
    getWeekInChinese(): string;
    getXingZuo(): string;
    toFullString(): string;
    toYmd(): string;
    toYmdHms(): string;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    getMinute(): number;
    getSecond(): number;
  }

  export class Lunar {
    toString(): string;
    getYearInChinese(): string;
    getMonthInChinese(): string;
    getDayInChinese(): string;
    getMonth(): number;
    getDay(): number;
    getYearShengXiao(): string;
    getDayShengXiao(): string;
    getYueXiang(): string;
    getYearInGanZhi(): string;
    getMonthInGanZhi(): string;
    getDayInGanZhi(): string;
    getTimeInGanZhi(): string;
    getYearInGanZhiExact?(): string;
    getMonthInGanZhiExact?(): string;
    getDayInGanZhiExact?(): string;
    getYearNaYin(): string;
    getMonthNaYin(): string;
    getDayNaYin(): string;
    getTimeNaYin?(): string;
    getDayYi(): string[];
    getDayJi(): string[];
    getTimeYi(): string[];
    getTimeJi(): string[];
    getDayChongDesc(): string;
    getDayChongShengXiao(): string;
    getDaySha(): string;
    getZhiXing(): string;
    getXiu(): string;
    getXiuLuck(): string;
    getXiuSong?(): string;
    getPengZuGan(): string;
    getPengZuZhi(): string;
    getDayTianShen(): string;
    getDayTianShenType(): string;
    getDayJiShen(): string[];
    getDayXiongSha(): string[];
    getFestivals(): string[];
    getOtherFestivals(): string[];
    getJieQi(): string;
    getPrevJie(): { getName?: () => string; toString?: () => string } | string;
    getNextJie(): { getName?: () => string; toString?: () => string } | string;
    getPrevQi(): { getName?: () => string; toString?: () => string } | string;
    getNextQi(): { getName?: () => string; toString?: () => string } | string;
    getJieQiTable(): Record<string, Solar>;
    getPrevJieQi?(wholeDay?: boolean): {
      getName?: () => string;
      getSolar?: () => Solar;
      toString?: () => string;
    };
    getNextJieQi?(wholeDay?: boolean): {
      getName?: () => string;
      getSolar?: () => Solar;
      toString?: () => string;
    };
    getEightChar(): {
      toString(): string;
      getYear(): string;
      getMonth(): string;
      getDay(): string;
      getTime(): string;
    };
    getDayPositionXi(): string;
    getDayPositionFu(): string;
    getDayPositionCai(): string;
    getDayPositionYangGui(): string;
    getDayPositionYinGui(): string;
    getDayPositionTaiSui(): string;
    getDayPositionTai(): string;
    getDayPositionXiDesc?(): string;
    getDayPositionFuDesc?(): string;
    getDayPositionCaiDesc?(): string;
    getDayPositionYangGuiDesc?(): string;
    getDayPositionYinGuiDesc?(): string;
    getDayPositionTaiSuiDesc?(): string;
    getEightChar(): { toString(): string };
  }
}
