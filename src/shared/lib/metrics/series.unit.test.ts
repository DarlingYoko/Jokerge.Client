import { describe, expect, it } from 'vitest';

import { hasAnyValue, toChartRows } from './series';

import { MetricsPoint } from '@/shared/api/contracts/metrics/schemas';

const point = (timeUtc: string, patch: Partial<MetricsPoint> = {}): MetricsPoint => ({
  timeUtc,
  requests: null,
  requestsPerMinute: null,
  p50Ms: null,
  p95Ms: null,
  clientErrors: null,
  serverErrors: null,
  launchersOnline: null,
  cpuPercent: null,
  memoryBytes: null,
  ...patch,
});

describe('toChartRows', () => {
  it('keeps gaps where the API was down', () => {
    const [row] = toChartRows([point('2026-11-20T12:00:00Z')]);

    expect(row.rpm).toBeNull();
    expect(row.errorPercent).toBeNull();
    expect(row.memoryMb).toBeNull();
  });

  it('turns counts into chart units', () => {
    const [row] = toChartRows([
      point('2026-11-20T12:00:00Z', {
        requests: 200,
        requestsPerMinute: 200,
        clientErrors: 6,
        serverErrors: 2,
        memoryBytes: 256 * 1024 * 1024,
        cpuPercent: 7.5,
        launchersOnline: 3,
      }),
    ]);

    expect(row).toMatchObject({
      time: '2026-11-20T12:00:00Z',
      rpm: 200,
      clientErrors: 6,
      serverErrors: 2,
      errorPercent: 4,
      memoryMb: 256,
      cpu: 7.5,
      launchers: 3,
    });
  });

  it('an idle minute has a 0% error rate, not a gap', () => {
    const [row] = toChartRows([
      point('2026-11-20T12:00:00Z', { requests: 0, requestsPerMinute: 0 }),
    ]);

    expect(row.errorPercent).toBe(0);
  });
});

describe('hasAnyValue', () => {
  it('tells an empty chart from a chart of zeros', () => {
    const rows = toChartRows([point('2026-11-20T12:00:00Z'), point('2026-11-20T12:01:00Z')]);
    expect(hasAnyValue(rows, 'rpm')).toBe(false);

    const withZero = toChartRows([point('2026-11-20T12:00:00Z', { requestsPerMinute: 0 })]);
    expect(hasAnyValue(withZero, 'rpm')).toBe(true);
  });
});
