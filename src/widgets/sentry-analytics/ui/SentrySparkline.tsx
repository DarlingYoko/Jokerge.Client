'use client';

import { Bar, BarChart } from 'recharts';

import { SentryBucket } from '@/shared/api/contracts/sentry/schemas';
import { formatBucketLabel, SentryGranularity } from '@/shared/lib/sentry/format';
import { cn } from '@/shared/lib/utils';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/ui/chart';

const config = {
  count: { label: 'Событий', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig;

type SentrySparklineProps = {
  buckets: SentryBucket[];
  granularity: SentryGranularity;
  className?: string;
};

export const SentrySparkline = ({ buckets, granularity, className }: SentrySparklineProps) => (
  <ChartContainer config={config} className={cn('aspect-auto h-10 w-36', className)}>
    <BarChart data={buckets} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
      <ChartTooltip
        cursor={false}
        content={
          <ChartTooltipContent
            hideIndicator
            labelFormatter={(_, payload) => {
              const start = payload?.[0]?.payload?.start as string | undefined;
              return start ? formatBucketLabel(start, granularity) : '';
            }}
          />
        }
      />
      <Bar dataKey="count" fill="var(--color-count)" radius={1} isAnimationActive={false} />
    </BarChart>
  </ChartContainer>
);
