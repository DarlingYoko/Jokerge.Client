import { ResponseBaseEntity } from '@/shared/api/schemas';
import { MetricsReport } from '@/shared/api/contracts/metrics/schemas';
import { MetricsPeriod } from '@/shared/lib/metrics/period';

export type TGetMetricsRequest = { period: MetricsPeriod };
export type TGetMetricsResponse = ResponseBaseEntity & { data: MetricsReport };
