export { formatBytes } from '@/shared/lib/sentry/format';

const DASH = '—';

const number = (value: number, fractionDigits: number): string =>
  value.toLocaleString('ru-RU', { maximumFractionDigits: fractionDigits });

export const formatMs = (ms: number | null | undefined): string => {
  if (ms === null || ms === undefined) return DASH;
  if (ms === 0) return '0 мс';
  if (ms < 1) return '<1 мс';
  if (ms < 1000) return `${Math.round(ms)} мс`;
  return `${number(ms / 1000, ms < 10_000 ? 2 : 1)} с`;
};

/** A 0..1 rate as percent. */
export const formatPercent = (rate: number | null | undefined): string => {
  if (rate === null || rate === undefined) return DASH;
  if (rate === 0) return '0%';
  if (rate < 0.001) return '<0,1%';
  return `${number(rate * 100, 1)}%`;
};

export const formatRpm = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return DASH;
  if (value === 0) return '0';
  if (value < 0.1) return '<0,1';
  return number(value, 1);
};

/** CPU is already a 0..100 share of all cores. */
export const formatCpu = (percent: number | null | undefined): string =>
  percent === null || percent === undefined ? DASH : `${number(percent, 1)}%`;

const formatMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} мин`;
  return rest === 0 ? `${hours} ч` : `${hours} ч ${rest} мин`;
};

export const formatUptime = (seconds: number): string => {
  if (seconds < 60) return '<1 мин';

  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return hours === 0 ? `${days} д` : `${days} д ${hours} ч`;
  return formatMinutes(hours * 60 + minutes);
};

/**
 * Null when the API ran the whole period. The current minute gets its first sample a few seconds
 * in, so one missing minute is not worth a warning.
 */
export const describeCoverage = (coveredMinutes: number, periodMinutes: number): string | null => {
  if (coveredMinutes >= periodMinutes - 1) return null;
  if (coveredMinutes === 0) return 'Пока нет данных за этот период';
  return `Данные за ${formatMinutes(coveredMinutes)} из ${formatMinutes(periodMinutes)} — API запущен недавно или был недоступен`;
};
