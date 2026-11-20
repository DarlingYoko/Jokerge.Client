'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { BaseSentryStats } from '@/shared/api/contracts/sentry/schemas';
import { formatBucketLabel } from '@/shared/lib/sentry/format';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/shared/ui/chart';
import { Skeleton } from '@/shared/ui/skeleton';

const chartConfig = {
  launcher: { label: 'Лаунчер', color: 'hsl(var(--chart-1))' },
  backend: { label: 'Бэкенд (панель)', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig;

export const ErrorsChart = ({ stats }: { stats: BaseSentryStats[] | undefined }) => {
  const total = useMemo(
    () => ({
      launcher: stats?.reduce((sum, day) => sum + day.launcher, 0) ?? 0,
      backend: stats?.reduce((sum, day) => sum + day.backend, 0) ?? 0,
    }),
    [stats],
  );

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5">
          <CardTitle>Ошибки по дням</CardTitle>
          <CardDescription>Сколько отчётов об ошибках пришло за последние 90 дней</CardDescription>
        </div>
        <div className="flex">
          {(Object.keys(chartConfig) as (keyof typeof chartConfig)[]).map((key) => (
            <div
              key={key}
              className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 even:border-l sm:border-l sm:border-t-0 sm:px-8"
            >
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <span
                  className="h-2 w-2 rounded-sm"
                  style={{ backgroundColor: chartConfig[key].color }}
                />
                {chartConfig[key].label}
              </span>
              <span className="text-lg font-bold leading-none tabular-nums sm:text-3xl">
                {total[key].toLocaleString('ru-RU')}
              </span>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:p-6">
        {!stats ? (
          <Skeleton className="h-[250px] w-full" />
        ) : total.launcher + total.backend === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            За 90 дней ошибок не было
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
            <BarChart data={stats} margin={{ left: 0, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value: string) => formatBucketLabel(value, 'day')}
              />
              <YAxis
                width={40}
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tickMargin={4}
              />
              <ChartTooltip
                cursor={{ fillOpacity: 0.3 }}
                content={
                  <ChartTooltipContent
                    className="w-[190px]"
                    labelFormatter={(_, payload) => {
                      const date = payload?.[0]?.payload?.date as string | undefined;
                      return date ? formatBucketLabel(date, 'day') : '';
                    }}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="launcher" stackId="errors" fill="var(--color-launcher)" />
              <Bar
                dataKey="backend"
                stackId="errors"
                fill="var(--color-backend)"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};
