'use client';

import { useMemo, useState } from 'react';
import { ArrowDownIcon, ArrowUpIcon, Search } from 'lucide-react';

import { RouteLabel } from './RouteLabel';

import { MetricsEndpoint } from '@/shared/api/contracts/metrics/schemas';
import { EndpointSortKey, SortDirection, sortEndpoints } from '@/shared/lib/metrics/endpoints';
import { formatMs, formatRpm } from '@/shared/lib/metrics/format';
import { cn } from '@/shared/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Skeleton } from '@/shared/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';

type SortState = { key: EndpointSortKey; direction: SortDirection };

const SortHeader = ({
  label,
  sortKey,
  sort,
  onSort,
  className,
}: {
  label: string;
  sortKey: EndpointSortKey;
  sort: SortState;
  onSort: (key: EndpointSortKey) => void;
  className?: string;
}) => {
  const active = sort.key === sortKey;
  const Icon = sort.direction === 'asc' ? ArrowUpIcon : ArrowDownIcon;

  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          'inline-flex items-center gap-1 hover:text-foreground',
          active && 'text-foreground',
        )}
      >
        {label}
        {active && <Icon className="h-3 w-3" />}
      </button>
    </TableHead>
  );
};

export const EndpointsTable = ({ endpoints }: { endpoints: MetricsEndpoint[] | undefined }) => {
  const [sort, setSort] = useState<SortState>({ key: 'requests', direction: 'desc' });
  const [search, setSearch] = useState('');

  const rows = useMemo(() => {
    if (!endpoints) return undefined;
    const needle = search.trim().toLowerCase();
    const filtered = needle
      ? endpoints.filter((e) => e.route.toLowerCase().includes(needle))
      : endpoints;
    return sortEndpoints(filtered, sort.key, sort.direction);
  }, [endpoints, search, sort]);

  const handleSort = (key: EndpointSortKey) =>
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === 'desc' ? 'asc' : 'desc' }
        : { key, direction: key === 'route' ? 'asc' : 'desc' },
    );

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base">Эндпоинты</CardTitle>
          <CardDescription>
            Сгруппированы по шаблону маршрута; 100 самых нагруженных за период
          </CardDescription>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Фильтр по маршруту"
            className="pl-8"
          />
        </div>
      </CardHeader>
      {/* The table's min-content width would otherwise widen the whole dashboard on small screens;
          with inline-size containment it scrolls inside the card instead. */}
      <CardContent className="[contain:inline-size]">
        {!rows ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <SortHeader label="Маршрут" sortKey="route" sort={sort} onSort={handleSort} />
                <SortHeader
                  label="Запросов"
                  sortKey="requests"
                  sort={sort}
                  onSort={handleSort}
                  className="text-right"
                />
                <TableHead className="hidden text-right md:table-cell">В минуту</TableHead>
                <TableHead className="hidden text-right md:table-cell">p50</TableHead>
                <SortHeader
                  label="p95"
                  sortKey="p95"
                  sort={sort}
                  onSort={handleSort}
                  className="text-right"
                />
                <TableHead className="hidden text-right lg:table-cell">Макс</TableHead>
                <SortHeader
                  label="4xx / 5xx"
                  sortKey="errors"
                  sort={sort}
                  onSort={handleSort}
                  className="text-right"
                />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-20 text-center text-muted-foreground">
                    {search ? 'Ничего не найдено' : 'За период запросов не было'}
                  </TableCell>
                </TableRow>
              )}
              {rows.map((endpoint) => (
                <TableRow key={endpoint.route}>
                  <TableCell className="max-w-[420px]">
                    <RouteLabel route={endpoint.route} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {endpoint.requests.toLocaleString('ru-RU')}
                  </TableCell>
                  <TableCell className="hidden text-right tabular-nums md:table-cell">
                    {formatRpm(endpoint.requestsPerMinute)}
                  </TableCell>
                  <TableCell className="hidden text-right tabular-nums md:table-cell">
                    {formatMs(endpoint.p50Ms)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatMs(endpoint.p95Ms)}
                  </TableCell>
                  <TableCell className="hidden text-right tabular-nums lg:table-cell">
                    {formatMs(endpoint.maxMs)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <span className={cn(endpoint.clientErrors === 0 && 'text-muted-foreground')}>
                      {endpoint.clientErrors.toLocaleString('ru-RU')}
                    </span>
                    {' / '}
                    <span
                      className={cn(
                        endpoint.serverErrors > 0
                          ? 'font-semibold text-red-500 dark:text-red-400'
                          : 'text-muted-foreground',
                      )}
                    >
                      {endpoint.serverErrors.toLocaleString('ru-RU')}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
