/**
 * 格式化日期显示
 * @param dateString 日期字符串
 * @param locale 区域设置，默认为 'en-US'
 * @returns 格式化后的日期字符串
 */
export function formatDate(dateString: string, locale: string = 'en-US'): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) return '';
  
  const finalLocale = locale === 'zh' ? 'zh-CN' : locale === 'ja' ? 'ja-JP' : locale === 'ko' ? 'ko-KR' : locale === 'ar' ? 'ar-SA' : 'en-US';

  return date.toLocaleDateString(finalLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * 格式化相对时间（例如：3天前、1小时前等）
 * @param dateString 日期字符串
 * @param t 翻译函数
 * @returns 相对时间字符串
 */
export function formatRelativeTime(dateString: string, t: (key: string, params?: any) => string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  if (isNaN(date.getTime())) return '';
  
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSeconds < 60) {
    return t('date.justNow');
  } else if (diffMinutes < 60) {
    return t('date.minutesAgo').replace('{n}', diffMinutes.toString());
  } else if (diffHours < 24) {
    return t('date.hoursAgo').replace('{n}', diffHours.toString());
  } else if (diffDays < 30) {
    return t('date.daysAgo').replace('{n}', diffDays.toString());
  } else {
    // 这里需要传递一个默认的 locale 或语言，或者由调用方处理
    return formatDate(dateString);
  }
} 
