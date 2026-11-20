import { endOfDay, startOfDay, subDays, subHours } from 'date-fns';

export enum SentryPeriod {
  Hour = '1h',
  Day = '24h',
  Week = '7d',
  Month = '30d',
  Quarter = '90d',
  All = 'all',
  Custom = 'custom',
}

export const SENTRY_PERIOD_LABELS: Record<SentryPeriod, string> = {
  [SentryPeriod.Hour]: 'Час',
  [SentryPeriod.Day]: '24 часа',
  [SentryPeriod.Week]: '7 дней',
  [SentryPeriod.Month]: '30 дней',
  [SentryPeriod.Quarter]: '90 дней',
  [SentryPeriod.All]: 'Всё время',
  [SentryPeriod.Custom]: 'Период',
};

export type SentryCustomRange = { from?: Date; to?: Date };

/** Request window as UTC instants; `dateFrom: null` means all time. */
export type SentryRange = { dateFrom: string | null; dateTo: string };

/**
 * Rolling windows ending now. Calendar windows ("this month") looked empty on the 1st and the
 * old code sent browser-local times without a zone, so the server read them in its own zone.
 */
export const resolveSentryPeriod = (
  period: SentryPeriod,
  custom: SentryCustomRange | undefined,
  now: Date,
): SentryRange | null => {
  const range = (from: Date | null, to: Date = now): SentryRange => ({
    dateFrom: from ? from.toISOString() : null,
    dateTo: to.toISOString(),
  });

  switch (period) {
    case SentryPeriod.Hour:
      return range(subHours(now, 1));
    case SentryPeriod.Day:
      return range(subHours(now, 24));
    case SentryPeriod.Week:
      return range(subDays(now, 7));
    case SentryPeriod.Month:
      return range(subDays(now, 30));
    case SentryPeriod.Quarter:
      return range(subDays(now, 90));
    case SentryPeriod.All:
      return range(null);
    case SentryPeriod.Custom: {
      if (!custom?.from) return null;
      return range(startOfDay(custom.from), endOfDay(custom.to ?? custom.from));
    }
  }
};

/** Minutes east of UTC, the way the API expects (Moscow is 180). */
export const getViewerTzOffset = (date: Date = new Date()): number => -date.getTimezoneOffset();
