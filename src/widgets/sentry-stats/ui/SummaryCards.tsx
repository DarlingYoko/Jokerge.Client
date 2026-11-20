'use client';

import { ReactNode } from 'react';
import { CalendarDays, Clock, Layers, MonitorSmartphone } from 'lucide-react';

import { BaseSentrySummary } from '@/shared/api/contracts/sentry/schemas';
import { describeChange } from '@/shared/lib/sentry/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';

type SummaryCardProps = {
  title: string;
  icon: ReactNode;
  value: number | undefined;
  hint: string | undefined;
  tone?: 'up' | 'down' | 'neutral';
};

const SummaryCard = ({ title, icon, value, hint, tone = 'neutral' }: SummaryCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      {value === undefined ? (
        <Skeleton className="h-8 w-20" />
      ) : (
        <div className="text-2xl font-bold tabular-nums">{value.toLocaleString('ru-RU')}</div>
      )}
      <p
        className={
          tone === 'up'
            ? 'text-xs text-red-500 dark:text-red-400'
            : tone === 'down'
              ? 'text-xs text-green-600 dark:text-green-400'
              : 'text-xs text-muted-foreground'
        }
      >
        {hint ?? ' '}
      </p>
    </CardContent>
  </Card>
);

const toneOf = (current: number, previous: number): SummaryCardProps['tone'] =>
  current > previous ? 'up' : current < previous ? 'down' : 'neutral';

export const SummaryCards = ({ summary }: { summary: BaseSentrySummary | undefined }) => {
  const iconClass = 'h-4 w-4 text-muted-foreground';

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        title="Сегодня"
        icon={<Clock className={iconClass} />}
        value={summary?.bugsToday}
        hint={summary && describeChange(summary.bugsToday, summary.bugsYesterday, 'вчера')}
        tone={summary && toneOf(summary.bugsToday, summary.bugsYesterday)}
      />
      <SummaryCard
        title="За 7 дней"
        icon={<CalendarDays className={iconClass} />}
        value={summary?.bugsLast7Days}
        hint={
          summary &&
          describeChange(summary.bugsLast7Days, summary.bugsPrevious7Days, 'прошлые 7 дней')
        }
        tone={summary && toneOf(summary.bugsLast7Days, summary.bugsPrevious7Days)}
      />
      <SummaryCard
        title="Разных проблем за 7 дней"
        icon={<Layers className={iconClass} />}
        value={summary?.issuesLast7Days}
        hint="Одна проблема — одна строка во вкладке «Проблемы»"
      />
      <SummaryCard
        title="Затронуто устройств за 7 дней"
        icon={<MonitorSmartphone className={iconClass} />}
        value={summary?.usersLast7Days}
        hint="Пользователь Windows + имя компьютера"
      />
    </div>
  );
};
