'use client';

import { Area, Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from 'recharts';

import { formatChartTime, hasAnyValue, MetricsChartRow } from '@/shared/lib/metrics/series';
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

type SeriesKey = Exclude<keyof MetricsChartRow, 'time'>;

export type MetricsChartSeries = {
  key: SeriesKey;
  label: string;
  color: string;
  kind: 'area' | 'line' | 'bar';
  /** Bars with the same id are stacked. */
  stackId?: string;
  /** 'stepAfter' for counts that change in jumps (launchers online). */
  curve?: 'monotone' | 'stepAfter';
};

type MetricsChartProps = {
  title: string;
  description: string;
  rows: MetricsChartRow[] | undefined;
  series: MetricsChartSeries[];
  formatValue: (value: number) => string;
  emptyText?: string;
  allowDecimals?: boolean;
};

const HEIGHT = 'h-[220px]';

export const MetricsChart = ({
  title,
  description,
  rows,
  series,
  formatValue,
  emptyText = 'За этот период данных нет',
  allowDecimals = true,
}: MetricsChartProps) => {
  const config = Object.fromEntries(
    series.map((s) => [s.key, { label: s.label, color: s.color }]),
  ) satisfies ChartConfig;
  const empty = rows !== undefined && !series.some((s) => hasAnyValue(rows, s.key));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        {!rows ? (
          <Skeleton className={`${HEIGHT} w-full`} />
        ) : empty ? (
          <div
            className={`flex ${HEIGHT} items-center justify-center text-sm text-muted-foreground`}
          >
            {emptyText}
          </div>
        ) : (
          <ChartContainer config={config} className={`aspect-auto ${HEIGHT} w-full`}>
            <ComposedChart data={rows} margin={{ left: 0, right: 12, top: 4 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={40}
                tickFormatter={formatChartTime}
              />
              <YAxis
                width={56}
                allowDecimals={allowDecimals}
                tickLine={false}
                axisLine={false}
                tickMargin={4}
                tickFormatter={(value: number) => formatValue(value)}
              />
              <ChartTooltip
                cursor={{ fillOpacity: 0.3 }}
                content={
                  <ChartTooltipContent
                    className="w-[200px]"
                    labelFormatter={(_, payload) => {
                      const time = payload?.[0]?.payload?.time as string | undefined;
                      return time ? formatChartTime(time) : '';
                    }}
                    formatter={(value, name, item) => (
                      <div className="flex w-full items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-muted-foreground">
                          {config[name as SeriesKey]?.label ?? name}
                        </span>
                        <span className="ml-auto font-mono font-medium tabular-nums text-foreground">
                          {typeof value === 'number' ? formatValue(value) : '—'}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              {series.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
              {series.map((s) => {
                const color = `var(--color-${s.key})`;
                switch (s.kind) {
                  case 'bar':
                    return (
                      <Bar
                        key={s.key}
                        dataKey={s.key}
                        stackId={s.stackId}
                        fill={color}
                        isAnimationActive={false}
                      />
                    );
                  case 'line':
                    return (
                      <Line
                        key={s.key}
                        dataKey={s.key}
                        type={s.curve ?? 'monotone'}
                        stroke={color}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    );
                  case 'area':
                    return (
                      <Area
                        key={s.key}
                        dataKey={s.key}
                        type={s.curve ?? 'monotone'}
                        stroke={color}
                        fill={color}
                        fillOpacity={0.2}
                        strokeWidth={2}
                        isAnimationActive={false}
                      />
                    );
                }
              })}
            </ComposedChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};
