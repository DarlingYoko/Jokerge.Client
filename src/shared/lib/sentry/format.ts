import { format, formatDistanceToNowStrict, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

export type SentryGranularity = 'hour' | 'day' | 'week';

export const shortExceptionName = (type: string): string => type.split('.').pop() || type;

/**
 * Chart labels are viewer wall-clock time without a zone. `new Date('2026-11-20')` would read
 * that as UTC midnight and show the previous day west of Greenwich; parseISO reads it as local.
 */
export const parseViewerDate = (value: string): Date => parseISO(value);

export const formatBucketLabel = (start: string, granularity: SentryGranularity): string => {
  const date = parseViewerDate(start);
  switch (granularity) {
    case 'hour':
      return format(date, 'd MMM, HH:mm', { locale: ru });
    case 'week':
      return `неделя с ${format(date, 'd MMM', { locale: ru })}`;
    default:
      return format(date, 'd MMM', { locale: ru });
  }
};

export const formatDateTime = (iso: string): string =>
  format(new Date(iso), 'd MMM yyyy, HH:mm', { locale: ru });

export const formatRelative = (iso: string): string =>
  formatDistanceToNowStrict(new Date(iso), { addSuffix: true, locale: ru });

/** "+50% (вчера: 10)" instead of "На +100% больше обычного" with no idea what "обычного" is. */
export const describeChange = (
  current: number,
  previous: number,
  previousLabel: string,
): string => {
  if (previous === 0) return current === 0 ? `${previousLabel} тоже 0` : `${previousLabel}: 0`;

  const percent = Math.round(((current - previous) / previous) * 100);
  const sign = percent > 0 ? '+' : percent < 0 ? '−' : '±';
  return `${sign}${Math.abs(percent)}% (${previousLabel}: ${previous})`;
};

export const formatBytes = (bytes: number): string => {
  const units = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${Number(value.toFixed(1))} ${units[unit]}`;
};

export const pluralRu = (count: number, one: string, few: string, many: string): string => {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
};
