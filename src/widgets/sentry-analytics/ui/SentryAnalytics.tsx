'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import { SentryFilters, SentryFiltersValue } from './SentryFilters';
import { SentryIssueRow } from './SentryIssueRow';

import { useSentryIssues } from '@/shared/hooks';
import { ProjectTypeEnum } from '@/shared/enums';
import { pluralRu } from '@/shared/lib/sentry/format';
import { filterAndSortIssues, summarizeIssues } from '@/shared/lib/sentry/issues';
import { SENTRY_PERIOD_LABELS, SentryPeriod } from '@/shared/lib/sentry/period';
import { cn } from '@/shared/lib/utils';
import { Card, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';

/** Asks the list to open one problem, e.g. after a click on the overview tab. */
export type SentryIssueFocus = { fingerprint: string; nonce: number };

type SentryAnalyticsProps = {
  focus?: SentryIssueFocus;
};

const DEFAULT_FILTERS: SentryFiltersValue = {
  period: SentryPeriod.Week,
  custom: undefined,
  projectType: ProjectTypeEnum.All,
  search: '',
  sort: 'count',
};

const periodText = (filters: SentryFiltersValue) => {
  if (filters.period !== SentryPeriod.Custom) {
    return filters.period === SentryPeriod.All
      ? 'за всё время'
      : `за ${SENTRY_PERIOD_LABELS[filters.period].toLowerCase()}`;
  }
  const { from, to } = filters.custom ?? {};
  if (!from) return '';
  const fromText = format(from, 'd MMM', { locale: ru });
  return !to || to.getTime() === from.getTime()
    ? `за ${fromText}`
    : `с ${fromText} по ${format(to, 'd MMM', { locale: ru })}`;
};

const Message = ({ title, description }: { title: string; description: string }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
  </Card>
);

export const SentryAnalytics = ({ focus }: SentryAnalyticsProps) => {
  const [filters, setFilters] = useState<SentryFiltersValue>(DEFAULT_FILTERS);
  const [expanded, setExpanded] = useState<string | null>(null);
  const rowRefs = useRef(new Map<string, HTMLDivElement>());

  const { data, isPending, isError, isFetching, isPlaceholderData } = useSentryIssues({
    period: filters.period,
    custom: filters.custom,
    projectType: filters.projectType,
  });

  useEffect(() => {
    if (!focus) return;
    setFilters((current) => ({
      ...current,
      period: SentryPeriod.Week,
      projectType: ProjectTypeEnum.All,
      search: '',
    }));
    setExpanded(focus.fingerprint);
  }, [focus]);

  useEffect(() => {
    if (!expanded || !focus || expanded !== focus.fingerprint) return;
    rowRefs.current.get(expanded)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [expanded, focus, data]);

  const issues = useMemo(
    () => filterAndSortIssues(data ?? [], filters.search, filters.sort),
    [data, filters.search, filters.sort],
  );
  const totals = useMemo(() => summarizeIssues(data ?? []), [data]);

  const waitingForDates = filters.period === SentryPeriod.Custom && !filters.custom?.from;

  return (
    <div className="flex flex-col gap-4">
      <SentryFilters value={filters} onChange={setFilters} />

      {waitingForDates && (
        <Message
          title="Выберите даты"
          description="Нажмите на кнопку с календарём и выберите день или период."
        />
      )}

      {!waitingForDates && isPending && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {!waitingForDates && isError && (
        <Message
          title="Не удалось загрузить ошибки"
          description="Проверьте подключение к панели и права доступа (perm:integrations.sentry.manage)."
        />
      )}

      {!waitingForDates && data && (
        <>
          <p
            className={cn(
              'text-sm text-muted-foreground',
              isFetching && isPlaceholderData && 'opacity-60',
            )}
          >
            {totals.issues === 0
              ? `Ошибок ${periodText(filters)} нет`
              : `${totals.issues} ${pluralRu(totals.issues, 'проблема', 'проблемы', 'проблем')} · ` +
                `${totals.events.toLocaleString('ru-RU')} ${pluralRu(totals.events, 'событие', 'события', 'событий')} · ` +
                `${totals.devices} ${pluralRu(totals.devices, 'устройство', 'устройства', 'устройств')} ${periodText(filters)}`}
            {filters.search && totals.issues > 0 && ` · найдено ${issues.length}`}
          </p>

          {totals.issues === 0 && (
            <Message
              title="Ошибок нет"
              description="За выбранный период лаунчер и панель ничего не присылали. Попробуйте период побольше."
            />
          )}

          {totals.issues > 0 && issues.length === 0 && (
            <Message title="Ничего не найдено" description="Измените текст поиска." />
          )}

          <div
            className={cn('flex flex-col gap-3', isFetching && isPlaceholderData && 'opacity-60')}
          >
            {issues.map((issue) => (
              <SentryIssueRow
                key={issue.fingerprint}
                ref={(node) => {
                  if (node) rowRefs.current.set(issue.fingerprint, node);
                  else rowRefs.current.delete(issue.fingerprint);
                }}
                issue={issue}
                expanded={expanded === issue.fingerprint}
                onToggle={() =>
                  setExpanded((current) =>
                    current === issue.fingerprint ? null : issue.fingerprint,
                  )
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
