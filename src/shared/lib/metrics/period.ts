export enum MetricsPeriod {
  Hour = '1h',
  SixHours = '6h',
  Day = '24h',
}

export const METRICS_PERIODS: MetricsPeriod[] = [
  MetricsPeriod.Hour,
  MetricsPeriod.SixHours,
  MetricsPeriod.Day,
];

export const METRICS_PERIOD_LABELS: Record<MetricsPeriod, string> = {
  [MetricsPeriod.Hour]: '1 час',
  [MetricsPeriod.SixHours]: '6 часов',
  [MetricsPeriod.Day]: '24 часа',
};

export const METRICS_PERIOD_MINUTES: Record<MetricsPeriod, number> = {
  [MetricsPeriod.Hour]: 60,
  [MetricsPeriod.SixHours]: 360,
  [MetricsPeriod.Day]: 1440,
};

/** The API samples every 15 s and the minute buckets fill continuously; 30 s keeps the page live enough. */
export const METRICS_REFRESH_MS = 30_000;

export const isMetricsPeriod = (value: string): value is MetricsPeriod =>
  (METRICS_PERIODS as string[]).includes(value);
