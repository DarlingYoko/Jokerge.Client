/** Ping (ms) boundaries: below `good` is green, below `fair` is yellow, the rest is red. */
export const PING_THRESHOLDS = { good: 80, fair: 150 } as const;

export type PingLevel = 'good' | 'fair' | 'poor' | 'unknown';

const isMeasured = (value: number | null): value is number =>
  value !== null && Number.isFinite(value) && value >= 0;

export const getPingLevel = (isOnline: boolean, ping: number | null): PingLevel => {
  if (!isOnline || !isMeasured(ping)) return 'unknown';
  if (ping < PING_THRESHOLDS.good) return 'good';
  if (ping < PING_THRESHOLDS.fair) return 'fair';
  return 'poor';
};

const pingColorClasses: Record<PingLevel, string> = {
  good: 'text-green-600 dark:text-green-400',
  fair: 'text-yellow-600 dark:text-yellow-400',
  poor: 'text-red-600 dark:text-red-400',
  unknown: 'text-gray-500 dark:text-gray-400',
};

export const getPingColorClass = (level: PingLevel): string => pingColorClasses[level];

export const formatPing = (isOnline: boolean, ping: number | null): string =>
  isOnline && isMeasured(ping) ? `${Math.round(ping)} мс` : '—';

/** `host:port` as a player would type it; IPv6 hosts are bracketed, a missing port is omitted. */
export const formatServerAddress = (address: string, port: number): string => {
  const trimmed = address.trim();
  const host = trimmed.includes(':') && !trimmed.startsWith('[') ? `[${trimmed}]` : trimmed;

  return Number.isFinite(port) && port > 0 ? `${host}:${port}` : host;
};

/** Occupied slots in percent, 0 when the capacity is unknown, clamped to 0..100. */
export const getOnlinePercent = (online: number | null, maxOnline: number | null): number => {
  if (!isMeasured(online) || !isMeasured(maxOnline) || maxOnline === 0) return 0;

  return Math.min(100, Math.max(0, (online * 100) / maxOnline));
};
