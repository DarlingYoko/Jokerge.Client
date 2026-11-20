/** Totals for the whole period. Null rates/percentiles mean the API saw no requests. */
export type MetricsSummary = {
  requests: number;
  /** Minutes of the period the API was running (and so collecting). */
  coveredMinutes: number;
  requestsPerMinute: number | null;
  p50Ms: number | null;
  p95Ms: number | null;
  clientErrors: number;
  serverErrors: number;
  /** 0..1 */
  clientErrorRate: number | null;
  /** 0..1 */
  serverErrorRate: number | null;
  peakLaunchersOnline: number | null;
};

/** One chart point; every value is null when the API was not running then. */
export type MetricsPoint = {
  /** ISO UTC start of the point. */
  timeUtc: string;
  requests: number | null;
  requestsPerMinute: number | null;
  p50Ms: number | null;
  p95Ms: number | null;
  clientErrors: number | null;
  serverErrors: number | null;
  launchersOnline: number | null;
  cpuPercent: number | null;
  memoryBytes: number | null;
};

export type MetricsEndpoint = {
  /** "GET /api/v1/profiles/{profileName}", or "(нет маршрута)" for 404s without a route. */
  route: string;
  requests: number;
  requestsPerMinute: number | null;
  p50Ms: number | null;
  p95Ms: number | null;
  maxMs: number;
  clientErrors: number;
  serverErrors: number;
};

export type MetricsDatabase = {
  name: string;
  fileName: string;
  /** File plus its -wal journal; null when the file is missing. */
  bytes: number | null;
};

export type MetricsLive = {
  startedAtUtc: string;
  uptimeSeconds: number;
  workingSetBytes: number;
  gcHeapBytes: number;
  memoryLimitBytes: number;
  /** Share of all cores, last 15 s sample. */
  cpuPercent: number | null;
  processorCount: number;
  launchersOnline: number;
  databases: MetricsDatabase[];
};

export type MetricsReport = {
  period: string;
  fromUtc: string;
  toUtc: string;
  stepMinutes: number;
  summary: MetricsSummary;
  series: MetricsPoint[];
  /** Busiest routes first, at most 100. */
  endpoints: MetricsEndpoint[];
  live: MetricsLive;
};
