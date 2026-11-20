import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { METRICS_REFRESH_MS, MetricsPeriod } from '@/shared/lib/metrics/period';
import { metricsService } from '@/shared/services/MetricsService';

export const metricsKeys = {
  all: ['metrics'] as const,
  report: (period: MetricsPeriod) => [...metricsKeys.all, 'report', period] as const,
};

/** Refreshes every 30 s; switching the period keeps the old charts until the new ones arrive. */
export const useApiMetrics = (period: MetricsPeriod) => {
  return useQuery({
    queryKey: metricsKeys.report(period),
    queryFn: () => metricsService.getReport({ period }),
    select: (data) => data.data,
    placeholderData: keepPreviousData,
    refetchInterval: METRICS_REFRESH_MS,
  });
};
