'use client';

import { ReactNode } from 'react';

import { RouteLabel } from './RouteLabel';

import { MetricsEndpoint } from '@/shared/api/contracts/metrics/schemas';
import { endpointErrorRate, topFailing, topSlow } from '@/shared/lib/metrics/endpoints';
import { formatMs, formatPercent } from '@/shared/lib/metrics/format';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';

type TopListProps = {
  title: string;
  description: string;
  items: MetricsEndpoint[] | undefined;
  empty: string;
  renderValue: (endpoint: MetricsEndpoint) => ReactNode;
};

const TopList = ({ title, description, items, empty, renderValue }: TopListProps) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-base">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="flex flex-col gap-2">
      {!items && <Skeleton className="h-40 w-full" />}
      {items?.length === 0 && <p className="text-sm text-muted-foreground">{empty}</p>}
      {items?.map((endpoint) => (
        <div
          key={endpoint.route}
          className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-md border p-3"
        >
          <RouteLabel route={endpoint.route} />
          <div className="text-right text-sm tabular-nums">{renderValue(endpoint)}</div>
        </div>
      ))}
    </CardContent>
  </Card>
);

export const TopEndpoints = ({ endpoints }: { endpoints: MetricsEndpoint[] | undefined }) => (
  <div className="grid gap-4 lg:grid-cols-2">
    <TopList
      title="Самые медленные"
      description="По p95 среди маршрутов, вызванных хотя бы 3 раза"
      items={endpoints && topSlow(endpoints)}
      empty="За период не было запросов."
      renderValue={(endpoint) => (
        <>
          <div className="font-semibold">{formatMs(endpoint.p95Ms)}</div>
          <div className="text-xs text-muted-foreground">
            p50 {formatMs(endpoint.p50Ms)} · макс {formatMs(endpoint.maxMs)}
          </div>
        </>
      )}
    />
    <TopList
      title="Больше всего ошибок"
      description="Сначала 5xx (ошибки API), затем 4xx (неверные запросы)"
      items={endpoints && topFailing(endpoints)}
      empty="За период ошибок не было."
      renderValue={(endpoint) => (
        <>
          <div className="font-semibold">
            {endpoint.serverErrors > 0 && (
              <span className="text-red-500 dark:text-red-400">
                {endpoint.serverErrors.toLocaleString('ru-RU')} × 5xx
              </span>
            )}
            {endpoint.serverErrors > 0 && endpoint.clientErrors > 0 && ' · '}
            {endpoint.clientErrors > 0 && `${endpoint.clientErrors.toLocaleString('ru-RU')} × 4xx`}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatPercent(endpointErrorRate(endpoint))} из{' '}
            {endpoint.requests.toLocaleString('ru-RU')}
          </div>
        </>
      )}
    />
  </div>
);
