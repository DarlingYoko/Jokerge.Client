'use client';

import { useMemo } from 'react';

import { MetricsChart } from './MetricsChart';

import { MetricsPoint } from '@/shared/api/contracts/metrics/schemas';
import { formatCpu, formatMs, formatRpm } from '@/shared/lib/metrics/format';
import { toChartRows } from '@/shared/lib/metrics/series';

const integer = (value: number) => Math.round(value).toLocaleString('ru-RU');
const megabytes = (value: number) => `${Math.round(value).toLocaleString('ru-RU')} МБ`;

export const MetricsCharts = ({
  series,
  stepMinutes,
}: {
  series: MetricsPoint[] | undefined;
  stepMinutes: number | undefined;
}) => {
  const rows = useMemo(() => (series ? toChartRows(series) : undefined), [series]);
  const per = stepMinutes && stepMinutes > 1 ? `за ${stepMinutes} мин` : 'за минуту';

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <MetricsChart
        title="Нагрузка"
        description="Запросов в минуту, в среднем по точке"
        rows={rows}
        series={[{ key: 'rpm', label: 'Запросов/мин', color: 'hsl(var(--chart-1))', kind: 'area' }]}
        formatValue={formatRpm}
      />
      <MetricsChart
        title="Время ответа"
        description="Медиана (p50) и 95-й перцентиль всех запросов"
        rows={rows}
        series={[
          { key: 'p50', label: 'p50', color: 'hsl(var(--chart-2))', kind: 'line' },
          { key: 'p95', label: 'p95', color: 'hsl(var(--chart-1))', kind: 'line' },
        ]}
        formatValue={formatMs}
      />
      <MetricsChart
        title="Ошибки"
        description={`Ответы 4xx и 5xx ${per}`}
        rows={rows}
        series={[
          {
            key: 'clientErrors',
            label: '4xx (клиент)',
            color: 'hsl(var(--chart-4))',
            kind: 'bar',
            stackId: 'errors',
          },
          {
            key: 'serverErrors',
            label: '5xx (сервер)',
            color: 'hsl(var(--chart-5))',
            kind: 'bar',
            stackId: 'errors',
          },
        ]}
        formatValue={integer}
        allowDecimals={false}
      />
      <MetricsChart
        title="Лаунчеры онлайн"
        description="Подключения к LauncherHub, максимум по точке"
        rows={rows}
        series={[
          {
            key: 'launchers',
            label: 'Лаунчеров',
            color: 'hsl(var(--chart-2))',
            kind: 'area',
            curve: 'stepAfter',
          },
        ]}
        formatValue={integer}
        allowDecimals={false}
      />
      <MetricsChart
        title="CPU процесса"
        description="Доля всех ядер, среднее по точке"
        rows={rows}
        series={[{ key: 'cpu', label: 'CPU', color: 'hsl(var(--chart-3))', kind: 'area' }]}
        formatValue={formatCpu}
      />
      <MetricsChart
        title="Память процесса"
        description="Рабочий набор (RSS), максимум по точке"
        rows={rows}
        series={[{ key: 'memoryMb', label: 'Память', color: 'hsl(var(--chart-4))', kind: 'area' }]}
        formatValue={megabytes}
      />
    </div>
  );
};
