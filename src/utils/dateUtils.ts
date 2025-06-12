import { format, parseISO, differenceInDays } from 'date-fns';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

// 支持的时区列表
export const TIMEZONES = [
  { id: 'Asia/Shanghai', name: '中国时间 (UTC+8)', offset: '+08:00' },
  { id: 'America/New_York', name: '美东时间 (UTC-5/UTC-4)', offset: '-05:00/-04:00' },
  { id: 'America/Los_Angeles', name: '美西时间 (UTC-8/UTC-7)', offset: '-08:00/-07:00' },
  { id: 'Europe/London', name: '伦敦时间 (UTC+0/UTC+1)', offset: '+00:00/+01:00' },
  { id: 'Asia/Tokyo', name: '日本时间 (UTC+9)', offset: '+09:00' },
  { id: 'Asia/Singapore', name: '新加坡时间 (UTC+8)', offset: '+08:00' },
  { id: 'Asia/Dubai', name: '迪拜时间 (UTC+4)', offset: '+04:00' },
];

// 默认时区
export const DEFAULT_TIMEZONE = 'Asia/Shanghai';

export const CHINA_TZ = 'Asia/Shanghai';

/**
 * 转换日期到指定时区
 * @param date 日期字符串或Date对象
 * @param timezone 目标时区
 * @returns 转换后的Date对象
 */
export function convertToTimezone(date: string | Date, timezone: string = DEFAULT_TIMEZONE): Date {
  if (!date) return new Date();
  
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return toZonedTime(parsedDate, timezone);
}

/**
 * 从时区时间转换为UTC时间（手动实现，替代不存在的zonedTimeToUtc）
 * @param date 日期字符串或Date对象
 * @param timezone 源时区
 * @returns UTC时间的Date对象
 */
export function convertToUTC(date: string | Date, timezone: string = DEFAULT_TIMEZONE): Date {
  if (!date) return new Date();
  
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  
  // 获取时区偏移量（以毫秒为单位）
  const tzDate = toZonedTime(parsedDate, timezone);
  const tzOffset = tzDate.getTimezoneOffset() * 60000;
  
  // 创建一个UTC日期
  const utcDate = new Date(tzDate.getTime() - tzOffset);
  return utcDate;
}

/**
 * 获取指定时区的日期部分 (YYYY-MM-DD)
 * @param date 日期字符串或Date对象
 * @param timezone 目标时区
 * @returns 格式化的日期字符串
 */
export function getDateInTimezone(date: string | Date, timezone: string = DEFAULT_TIMEZONE): string {
  if (!date) return '';
  return formatInTimeZone(date, timezone, 'yyyy-MM-dd');
}

/**
 * 获取指定时区的时间部分 (HH:mm)
 * @param date 日期字符串或Date对象
 * @param timezone 目标时区
 * @returns 格式化的时间字符串
 */
export function getTimeInTimezone(date: string | Date, timezone: string = DEFAULT_TIMEZONE): string {
  if (!date) return '';
  return formatInTimeZone(date, timezone, 'HH:mm');
}

/**
 * 格式化完整日期，带时区信息
 * @param date 日期字符串或Date对象
 * @param timezone 目标时区
 * @returns 格式化的日期时间字符串
 */
export function formatDateWithTimezone(date: string | Date, timezone: string = DEFAULT_TIMEZONE): string {
  if (!date) return '';
  
  try {
    return `${formatInTimeZone(date, timezone, 'yyyy-MM-dd HH:mm')} (${getTimezoneLabel(timezone)})`;
  } catch (e) {
    console.error('日期格式化错误:', e);
    return typeof date === 'string' ? date : date.toString();
  }
}

/**
 * 标准化日期字符串为ISO格式 (YYYY-MM-DD)
 * @param dateString 日期字符串
 * @returns ISO格式的日期字符串
 */
export function standardizeDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch (e) {
    console.error('日期格式化错误:', e);
    return dateString;
  }
}

/**
 * 解析并标准化日期时间字符串
 * @param dateTimeString 日期时间字符串
 * @param sourceTimezone 源时区
 * @param targetTimezone 目标时区
 * @returns 标准化的ISO格式字符串
 */
export function parseAndStandardizeDateTime(
  dateTimeString: string, 
  sourceTimezone: string = DEFAULT_TIMEZONE,
  targetTimezone: string = 'UTC'
): string {
  if (!dateTimeString) return '';
  
  try {
    // 先解析为源时区的时间
    const zonedDate = toZonedTime(new Date(dateTimeString), sourceTimezone);
    
    // 如果目标是UTC，使用手动方法转换到UTC
    if (targetTimezone === 'UTC') {
      const utcDate = convertToUTC(zonedDate, sourceTimezone);
      return utcDate.toISOString();
    } else {
      // 如果目标是其他时区，转换为该时区
      const targetDate = toZonedTime(zonedDate, targetTimezone);
      return targetDate.toISOString();
    }
  } catch (e) {
    console.error('日期解析错误:', e);
    return dateTimeString;
  }
}

/**
 * 获取时区显示标签
 * @param timezone 时区ID
 * @returns 时区显示标签
 */
export function getTimezoneLabel(timezone: string): string {
  const tz = TIMEZONES.find(t => t.id === timezone);
  return tz ? tz.name.split(' ')[0] : timezone;
}

/**
 * 获取时区完整信息
 * @param timezone 时区ID
 * @returns 时区完整信息对象
 */
export function getTimezoneInfo(timezone: string): { id: string; name: string; offset: string } | undefined {
  return TIMEZONES.find(t => t.id === timezone);
}

/**
 * 计算相对时间（几天后）
 * @param dateString 目标日期字符串
 * @param timezone 时区
 * @returns 格式化的相对时间字符串
 */
export function getRelativeTime(dateString: string, timezone: string = DEFAULT_TIMEZONE): string {
  if (!dateString) return '';
  
  try {
    const now = new Date();
    const targetDate = new Date(dateString);
    
    // 计算毫秒差
    const diff = targetDate.getTime() - now.getTime();
    
    // 转换为天、小时、分钟
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days < 0 || (days === 0 && hours < 0)) {
      return '已过期';
    }
    
    if (days > 0) {
      return `${days}天 ${hours}小时 ${minutes}分钟`;
    } else {
      return `${hours}小时 ${minutes}分钟`;
    }
  } catch (e) {
    console.error('计算相对时间错误:', e);
    return '时间计算错误';
  }
}

/**
 * 计算两个日期之间的日期差异
 * @param date1 第一个日期
 * @param date2 第二个日期
 * @returns 天数差异
 */
export function dateDifference(date1: string | Date, date2: string | Date): number {
  try {
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
    return differenceInDays(d1, d2);
  } catch (e) {
    console.error('计算日期差异错误:', e);
    return 0;
  }
}

// 将UTC日期字符串转为中国时区的"yyyy-MM-dd"字符串
export function toChinaDateString(utcDateString: string): string {
  const utcDate = typeof utcDateString === 'string' ? parseISO(utcDateString) : utcDateString;
  const chinaDate = toZonedTime(utcDate, CHINA_TZ);
  return format(chinaDate, 'yyyy-MM-dd');
}

export function toChinaDayString(date: Date): string {
  return formatInTimeZone(date, 'Asia/Shanghai', 'yyyy-MM-dd');
} 