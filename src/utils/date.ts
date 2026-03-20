/**
 * 日期格式化工具
 */

/**
 * 格式化日期
 * @param dateString 日期字符串或 Date 对象
 * @param format 格式化模板，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export function formatDate(dateString: string | Date, format = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!dateString) return '-';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) {
    return '-';
  }

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  return format
    .replace('YYYY', year.toString())
    .replace('MM', month.toString().padStart(2, '0'))
    .replace('DD', day.toString().padStart(2, '0'))
    .replace('HH', hours.toString().padStart(2, '0'))
    .replace('mm', minutes.toString().padStart(2, '0'))
    .replace('ss', seconds.toString().padStart(2, '0'));
}

/**
 * 计算相对时间（如 "3分钟前"）
 * @param dateString 日期字符串或 Date 对象
 * @returns 相对时间字符串
 */
export function formatRelativeTime(dateString: string | Date): string {
  if (!dateString) return '-';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) {
    return '-';
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) {
    return `${diffSec}秒前`;
  }

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `${diffMin}分钟前`;
  }

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) {
    return `${diffHour}小时前`;
  }

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) {
    return `${diffDay}天前`;
  }

  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) {
    return `${diffMonth}个月前`;
  }

  const diffYear = Math.floor(diffMonth / 12);
  return `${diffYear}年前`;
}

/**
 * 格式化为友好时间（如 "昨天 14:30"）
 * @param dateString 日期字符串或 Date 对象
 * @returns 友好时间字符串
 */
export function formatFriendlyTime(dateString: string | Date): string {
  if (!dateString) return '-';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) {
    return '-';
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date >= today) {
    return formatDate(date, 'HH:mm');
  }

  if (date >= yesterday) {
    return `昨天 ${formatDate(date, 'HH:mm')}`;
  }

  // 如果是今年
  if (date.getFullYear() === now.getFullYear()) {
    return formatDate(date, 'MM-DD HH:mm');
  }

  // 其他情况
  return formatDate(date, 'YYYY-MM-DD HH:mm');
}