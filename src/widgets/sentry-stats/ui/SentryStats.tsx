'use client';

import { ClearAllErrorsButton } from './ClearAllErrorsButton';
import { ErrorsChart } from './ErrorsChart';
import { SummaryCards } from './SummaryCards';
import { TopIssues } from './TopIssues';

import { useSentryStats, useSentrySummary } from '@/shared/hooks';
import { formatDateTime, formatRelative } from '@/shared/lib/sentry/format';

type SentryStatsProps = {
  onOpenIssue: (fingerprint: string) => void;
  onOpenAll: () => void;
};

export const SentryStats = ({ onOpenIssue, onOpenAll }: SentryStatsProps) => {
  const { data: summary } = useSentrySummary();
  const { data: stats } = useSentryStats();

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <SummaryCards summary={summary} />
      <TopIssues onOpenIssue={onOpenIssue} onOpenAll={onOpenAll} />
      <ErrorsChart stats={stats} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {summary && `Всего в базе: ${summary.totalBugs.toLocaleString('ru-RU')} отчётов`}
          {summary?.lastBugAt && (
            <span title={formatDateTime(summary.lastBugAt)}>
              {` · последний ${formatRelative(summary.lastBugAt)}`}
            </span>
          )}
        </p>
        <ClearAllErrorsButton total={summary?.totalBugs} />
      </div>
    </div>
  );
};
