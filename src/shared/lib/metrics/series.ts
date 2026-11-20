import { format } from 'date-fns';

import { MetricsPoint } from '@/shared/api/contracts/metrics/schemas';

/** What the charts plot; null = the API was down, recharts leaves a gap. */
export type MetricsChartRow = {
  time: string;
  rpm: number | null;
  p50: number | null;
  p95: number | null;
  clientErrors: number | null;
  serverErrors: number | null;
  /** 4xx + 5xx share of the point's requests, 0..100. */
  errorPercent: number | null;
  launchers: number | null;
  cpu: number | null;
  memoryMb: number | null;
};

const round1 = (value: number): number => Math.round(value * 10) / 10;

export const toChartRows = (series: MetricsPoint[]): MetricsChartRow[] =>
  series.map((point) => {
    const errors = (point.clientErrors ?? 0) + (point.serverErrors ?? 0);

    return {
      time: point.timeUtc,
      rpm: point.requestsPerMinute,
      p50: point.p50Ms,
      p95: point.p95Ms,
      clientErrors: point.clientErrors,
      serverErrors: point.serverErrors,
      errorPercent:
        point.requests === null
          ? null
          : point.requests === 0
            ? 0
            : round1((errors / point.requests) * 100),
      launchers: point.launchersOnline,
      cpu: point.cpuPercent,
      memoryMb: point.memoryBytes === null ? null : round1(point.memoryBytes / 1024 / 1024),
    };
  });

export const hasAnyValue = (rows: MetricsChartRow[], key: keyof MetricsChartRow): boolean =>
  rows.some((row) => row[key] !== null);

/** Axis/tooltip label in the viewer's local time. */
export const formatChartTime = (iso: string): string => format(new Date(iso), 'HH:mm');
