import { format, parseISO, differenceInDays } from 'date-fns';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

// 支持的时区列表
export const TIMEZONES = [
  // 亚洲时区
  { id: 'Asia/Shanghai', name: '中国时间 (UTC+8)', offset: '+08:00' },
  { id: 'Asia/Tokyo', name: '日本时间 (UTC+9)', offset: '+09:00' },
  { id: 'Asia/Seoul', name: '韩国时间 (UTC+9)', offset: '+09:00' },
  { id: 'Asia/Singapore', name: '新加坡时间 (UTC+8)', offset: '+08:00' },
  { id: 'Asia/Hong_Kong', name: '香港时间 (UTC+8)', offset: '+08:00' },
  { id: 'Asia/Taipei', name: '台北时间 (UTC+8)', offset: '+08:00' },
  { id: 'Asia/Bangkok', name: '曼谷时间 (UTC+7)', offset: '+07:00' },
  { id: 'Asia/Jakarta', name: '雅加达时间 (UTC+7)', offset: '+07:00' },
  { id: 'Asia/Manila', name: '马尼拉时间 (UTC+8)', offset: '+08:00' },
  { id: 'Asia/Kuala_Lumpur', name: '吉隆坡时间 (UTC+8)', offset: '+08:00' },
  { id: 'Asia/Ho_Chi_Minh', name: '胡志明市时间 (UTC+7)', offset: '+07:00' },
  { id: 'Asia/Mumbai', name: '印度时间 (UTC+5:30)', offset: '+05:30' },
  { id: 'Asia/Dubai', name: '迪拜时间 (UTC+4)', offset: '+04:00' },
  { id: 'Asia/Riyadh', name: '沙特时间 (UTC+3)', offset: '+03:00' },
  { id: 'Asia/Tehran', name: '德黑兰时间 (UTC+3:30)', offset: '+03:30' },
  { id: 'Asia/Kolkata', name: '加尔各答时间 (UTC+5:30)', offset: '+05:30' },
  { id: 'Asia/Karachi', name: '卡拉奇时间 (UTC+5)', offset: '+05:00' },
  { id: 'Asia/Dhaka', name: '达卡时间 (UTC+6)', offset: '+06:00' },
  { id: 'Asia/Almaty', name: '阿拉木图时间 (UTC+6)', offset: '+06:00' },
  { id: 'Asia/Tashkent', name: '塔什干时间 (UTC+5)', offset: '+05:00' },
  { id: 'Asia/Yekaterinburg', name: '叶卡捷琳堡时间 (UTC+5)', offset: '+05:00' },
  { id: 'Asia/Omsk', name: '鄂木斯克时间 (UTC+6)', offset: '+06:00' },
  { id: 'Asia/Krasnoyarsk', name: '克拉斯诺亚尔斯克时间 (UTC+7)', offset: '+07:00' },
  { id: 'Asia/Irkutsk', name: '伊尔库茨克时间 (UTC+8)', offset: '+08:00' },
  { id: 'Asia/Yakutsk', name: '雅库茨克时间 (UTC+9)', offset: '+09:00' },
  { id: 'Asia/Vladivostok', name: '海参崴时间 (UTC+10)', offset: '+10:00' },

  // 欧洲时区
  { id: 'Europe/London', name: '伦敦时间 (UTC+0/UTC+1)', offset: '+00:00/+01:00' },
  { id: 'Europe/Dublin', name: '都柏林时间 (UTC+0/UTC+1)', offset: '+00:00/+01:00' },
  { id: 'Europe/Paris', name: '巴黎时间 (UTC+1/UTC+2)', offset: '+01:00/+02:00' },
  { id: 'Europe/Berlin', name: '柏林时间 (UTC+1/UTC+2)', offset: '+01:00/+02:00' },
  { id: 'Europe/Rome', name: '罗马时间 (UTC+1/UTC+2)', offset: '+01:00/+02:00' },
  { id: 'Europe/Madrid', name: '马德里时间 (UTC+1/UTC+2)', offset: '+01:00/+02:00' },
  { id: 'Europe/Amsterdam', name: '阿姆斯特丹时间 (UTC+1/UTC+2)', offset: '+01:00/+02:00' },
  { id: 'Europe/Brussels', name: '布鲁塞尔时间 (UTC+1/UTC+2)', offset: '+01:00/+02:00' },
  { id: 'Europe/Vienna', name: '维也纳时间 (UTC+1/UTC+2)', offset: '+01:00/+02:00' },
  { id: 'Europe/Zurich', name: '苏黎世时间 (UTC+1/UTC+2)', offset: '+01:00/+02:00' },
  { id: 'Europe/Stockholm', name: '斯德哥尔摩时间 (UTC+1/UTC+2)', offset: '+01:00/+02:00' },
  { id: 'Europe/Copenhagen', name: '哥本哈根时间 (UTC+1/UTC+2)', offset: '+01:00/+02:00' },
  { id: 'Europe/Helsinki', name: '赫尔辛基时间 (UTC+2/UTC+3)', offset: '+02:00/+03:00' },
  { id: 'Europe/Warsaw', name: '华沙时间 (UTC+1/UTC+2)', offset: '+01:00/+02:00' },
  { id: 'Europe/Prague', name: '布拉格时间 (UTC+1/UTC+2)', offset: '+01:00/+02:00' },
  { id: 'Europe/Budapest', name: '布达佩斯时间 (UTC+1/UTC+2)', offset: '+01:00/+02:00' },
  { id: 'Europe/Athens', name: '雅典时间 (UTC+2/UTC+3)', offset: '+02:00/+03:00' },
  { id: 'Europe/Istanbul', name: '伊斯坦布尔时间 (UTC+3)', offset: '+03:00' },
  { id: 'Europe/Moscow', name: '莫斯科时间 (UTC+3)', offset: '+03:00' },
  { id: 'Europe/Kiev', name: '基辅时间 (UTC+2/UTC+3)', offset: '+02:00/+03:00' },
  { id: 'Europe/Bucharest', name: '布加勒斯特时间 (UTC+2/UTC+3)', offset: '+02:00/+03:00' },

  // 北美时区
  { id: 'America/New_York', name: '美东时间 (UTC-5/UTC-4)', offset: '-05:00/-04:00' },
  { id: 'America/Chicago', name: '美中时间 (UTC-6/UTC-5)', offset: '-06:00/-05:00' },
  { id: 'America/Denver', name: '美山时间 (UTC-7/UTC-6)', offset: '-07:00/-06:00' },
  { id: 'America/Los_Angeles', name: '美西时间 (UTC-8/UTC-7)', offset: '-08:00/-07:00' },
  { id: 'America/Anchorage', name: '阿拉斯加时间 (UTC-9/UTC-8)', offset: '-09:00/-08:00' },
  { id: 'Pacific/Honolulu', name: '夏威夷时间 (UTC-10)', offset: '-10:00' },
  { id: 'America/Toronto', name: '多伦多时间 (UTC-5/UTC-4)', offset: '-05:00/-04:00' },
  { id: 'America/Vancouver', name: '温哥华时间 (UTC-8/UTC-7)', offset: '-08:00/-07:00' },
  { id: 'America/Montreal', name: '蒙特利尔时间 (UTC-5/UTC-4)', offset: '-05:00/-04:00' },
  { id: 'America/Mexico_City', name: '墨西哥城时间 (UTC-6/UTC-5)', offset: '-06:00/-05:00' },

  // 南美时区
  { id: 'America/Sao_Paulo', name: '圣保罗时间 (UTC-3/UTC-2)', offset: '-03:00/-02:00' },
  { id: 'America/Argentina/Buenos_Aires', name: '布宜诺斯艾利斯时间 (UTC-3)', offset: '-03:00' },
  { id: 'America/Lima', name: '利马时间 (UTC-5)', offset: '-05:00' },
  { id: 'America/Bogota', name: '波哥大时间 (UTC-5)', offset: '-05:00' },
  { id: 'America/Caracas', name: '加拉加斯时间 (UTC-4)', offset: '-04:00' },
  { id: 'America/Santiago', name: '圣地亚哥时间 (UTC-4/UTC-3)', offset: '-04:00/-03:00' },

  // 非洲时区
  { id: 'Africa/Cairo', name: '开罗时间 (UTC+2)', offset: '+02:00' },
  { id: 'Africa/Lagos', name: '拉各斯时间 (UTC+1)', offset: '+01:00' },
  { id: 'Africa/Nairobi', name: '内罗毕时间 (UTC+3)', offset: '+03:00' },
  { id: 'Africa/Johannesburg', name: '约翰内斯堡时间 (UTC+2)', offset: '+02:00' },
  { id: 'Africa/Casablanca', name: '卡萨布兰卡时间 (UTC+1/UTC+0)', offset: '+01:00/+00:00' },
  { id: 'Africa/Algiers', name: '阿尔及尔时间 (UTC+1)', offset: '+01:00' },

  // 大洋洲时区
  { id: 'Australia/Sydney', name: '悉尼时间 (UTC+10/UTC+11)', offset: '+10:00/+11:00' },
  { id: 'Australia/Melbourne', name: '墨尔本时间 (UTC+10/UTC+11)', offset: '+10:00/+11:00' },
  { id: 'Australia/Brisbane', name: '布里斯班时间 (UTC+10)', offset: '+10:00' },
  { id: 'Australia/Perth', name: '珀斯时间 (UTC+8)', offset: '+08:00' },
  { id: 'Australia/Adelaide', name: '阿德莱德时间 (UTC+9:30/UTC+10:30)', offset: '+09:30/+10:30' },
  { id: 'Pacific/Auckland', name: '奥克兰时间 (UTC+12/UTC+13)', offset: '+12:00/+13:00' },
  { id: 'Pacific/Fiji', name: '斐济时间 (UTC+12/UTC+13)', offset: '+12:00/+13:00' },
  { id: 'Pacific/Guam', name: '关岛时间 (UTC+10)', offset: '+10:00' },

  // 特殊时区
  { id: 'UTC', name: '协调世界时 (UTC+0)', offset: '+00:00' },
  { id: 'GMT', name: '格林威治时间 (GMT)', offset: '+00:00' },
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
export const getRelativeTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    // 计算时间差
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays < 0 || (diffDays === 0 && diffHours < 0)) {
      return '已过期';
    }
    
    if (diffDays > 0) {
      return `${diffDays}天 ${diffHours}小时 ${diffMinutes}分钟`;
    } else {
      return `${diffHours}小时 ${diffMinutes}分钟`;
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

export const formatDateForDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}; 