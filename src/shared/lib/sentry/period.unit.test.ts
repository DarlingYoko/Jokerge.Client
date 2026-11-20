import { describe, expect, it } from 'vitest';

import { resolveSentryPeriod, SentryPeriod } from './period';

const now = new Date('2026-11-20T12:00:00.000Z');

describe('resolveSentryPeriod', () => {
  it('rolling presets end now and are sent as UTC instants', () => {
    expect(resolveSentryPeriod(SentryPeriod.Hour, undefined, now)).toEqual({
      dateFrom: '2026-11-20T11:00:00.000Z',
      dateTo: '2026-11-20T12:00:00.000Z',
    });
    expect(resolveSentryPeriod(SentryPeriod.Week, undefined, now)?.dateFrom).toBe(
      '2026-11-13T12:00:00.000Z',
    );
  });

  it('all time has no start', () => {
    expect(resolveSentryPeriod(SentryPeriod.All, undefined, now)).toEqual({
      dateFrom: null,
      dateTo: '2026-11-20T12:00:00.000Z',
    });
  });

  it('custom range covers whole local days, including the last one', () => {
    const from = new Date(2026, 10, 10, 15, 30);
    const to = new Date(2026, 10, 12, 9, 0);

    const range = resolveSentryPeriod(SentryPeriod.Custom, { from, to }, now)!;

    expect(new Date(range.dateFrom!).getTime()).toBe(new Date(2026, 10, 10).getTime());
    expect(new Date(range.dateTo).getTime()).toBe(new Date(2026, 10, 13).getTime() - 1);
  });

  it('custom range with a single picked day covers that day', () => {
    const day = new Date(2026, 10, 10);

    const range = resolveSentryPeriod(SentryPeriod.Custom, { from: day }, now)!;

    expect(new Date(range.dateTo).getTime() - new Date(range.dateFrom!).getTime()).toBe(
      24 * 60 * 60 * 1000 - 1,
    );
  });

  it('custom range without a picked day is not ready', () => {
    expect(resolveSentryPeriod(SentryPeriod.Custom, undefined, now)).toBeNull();
    expect(resolveSentryPeriod(SentryPeriod.Custom, { from: undefined }, now)).toBeNull();
  });
});
