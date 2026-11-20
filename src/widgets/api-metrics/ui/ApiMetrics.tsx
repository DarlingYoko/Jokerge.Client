'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { InfoIcon, Loader2Icon } from 'lucide-react';

import { EndpointsTable } from './EndpointsTable';
import { MetricsCharts } from './MetricsCharts';
import { MetricsSummaryCards } from './MetricsSummaryCards';
import { TopEndpoints } from './TopEndpoints';

import { useApiMetrics } from '@/shared/hooks/useMetrics';
import { describeCoverage } from '@/shared/lib/metrics/format';
import {
  isMetricsPeriod,
  METRICS_PERIOD_LABELS,
  METRICS_PERIOD_MINUTES,
  METRICS_PERIODS,
  MetricsPeriod,
} from '@/shared/lib/metrics/period';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';

export const ApiMetrics = () => {
  const [period, setPeriod] = useState<MetricsPeriod>(MetricsPeriod.Hour);
  const { data: report, dataUpdatedAt, isFetching, isError } = useApiMetrics(period);

  const coverage =
    report && describeCoverage(report.summary.coveredMinutes, METRICS_PERIOD_MINUTES[period]);

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={period} onValueChange={(value) => isMetricsPeriod(value) && setPeriod(value)}>
          <TabsList className="grid w-fit grid-cols-3">
            {METRICS_PERIODS.map((value) => (
              <TabsTrigger key={value} value={value}>
                {METRICS_PERIOD_LABELS[value]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          {isFetching && <Loader2Icon className="h-3.5 w-3.5 animate-spin" />}
          {dataUpdatedAt > 0 && `Обновлено в ${format(dataUpdatedAt, 'HH:mm:ss')} · каждые 30 с`}
        </p>
      </div>

      {isError && !report && (
        <Alert variant="destructive">
          <AlertDescription>Не удалось загрузить метрики API.</AlertDescription>
        </Alert>
      )}
      {coverage && (
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>{coverage}</AlertDescription>
        </Alert>
      )}

      <MetricsSummaryCards report={report} />
      <MetricsCharts series={report?.series} stepMinutes={report?.stepMinutes} />
      <TopEndpoints endpoints={report?.endpoints} />
      <EndpointsTable endpoints={report?.endpoints} />
    </div>
  );
};
