'use client';

import { ArrowRight } from 'lucide-react';

import { useSentryIssues } from '@/shared/hooks';
import { ProjectTypeEnum } from '@/shared/enums';
import { formatRelative, pluralRu, shortExceptionName } from '@/shared/lib/sentry/format';
import { SentryPeriod } from '@/shared/lib/sentry/period';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { SentrySparkline } from '@/widgets/sentry-analytics';

const TOP = 5;

type TopIssuesProps = {
  onOpenIssue: (fingerprint: string) => void;
  onOpenAll: () => void;
};

export const TopIssues = ({ onOpenIssue, onOpenAll }: TopIssuesProps) => {
  const { data, isPending } = useSentryIssues({
    period: SentryPeriod.Week,
    projectType: ProjectTypeEnum.All,
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="flex flex-col gap-1">
          <CardTitle>Что чинить в первую очередь</CardTitle>
          <CardDescription>Самые частые проблемы за последние 7 дней</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={onOpenAll}>
          Все проблемы
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {isPending && <Skeleton className="h-40 w-full" />}
        {data?.length === 0 && (
          <p className="text-sm text-muted-foreground">За 7 дней ошибок не было.</p>
        )}
        {data?.slice(0, TOP).map((issue) => (
          <button
            key={issue.fingerprint}
            type="button"
            onClick={() => onOpenIssue(issue.fingerprint)}
            className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-md border p-3 text-left transition-colors hover:bg-muted/40"
          >
            <div className="min-w-0">
              <p className="truncate font-medium" title={issue.exception}>
                {shortExceptionName(issue.exception)}
                <span className="ml-2 font-normal text-muted-foreground">
                  последний раз {formatRelative(issue.lastSeen)}
                </span>
              </p>
              <p className="truncate text-sm text-muted-foreground" title={issue.message}>
                {issue.message}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <SentrySparkline
                buckets={issue.graphic}
                granularity={issue.granularity}
                className="hidden w-24 md:flex"
              />
              <div className="w-28 text-right text-sm tabular-nums">
                <div className="font-semibold">
                  {issue.count.toLocaleString('ru-RU')}{' '}
                  {pluralRu(issue.count, 'событие', 'события', 'событий')}
                </div>
                <div className="text-xs text-muted-foreground">
                  {issue.countUsers}{' '}
                  {pluralRu(issue.countUsers, 'устройство', 'устройства', 'устройств')}
                </div>
              </div>
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
};
