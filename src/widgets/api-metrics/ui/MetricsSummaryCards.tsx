'use client';

import { ReactNode } from 'react';
import {
  ActivityIcon,
  AlertTriangleIcon,
  CpuIcon,
  DatabaseIcon,
  GaugeIcon,
  MemoryStickIcon,
  MonitorIcon,
  TimerIcon,
} from 'lucide-react';

import { MetricsReport } from '@/shared/api/contracts/metrics/schemas';
import {
  formatBytes,
  formatCpu,
  formatMs,
  formatPercent,
  formatRpm,
  formatUptime,
} from '@/shared/lib/metrics/format';
import { formatDateTime, pluralRu } from '@/shared/lib/sentry/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';

type SummaryCardProps = {
  title: string;
  icon: ReactNode;
  value: string | undefined;
  hint: ReactNode;
  hintTitle?: string;
  alert?: boolean;
};

const SummaryCard = ({ title, icon, value, hint, hintTitle, alert }: SummaryCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      {value === undefined ? (
        <Skeleton className="h-8 w-24" />
      ) : (
        <div
          className={
            alert
              ? 'text-2xl font-bold tabular-nums text-red-500 dark:text-red-400'
              : 'text-2xl font-bold tabular-nums'
          }
        >
          {value}
        </div>
      )}
      <p className="truncate text-xs text-muted-foreground" title={hintTitle}>
        {hint ?? ' '}
      </p>
    </CardContent>
  </Card>
);

export const MetricsSummaryCards = ({ report }: { report: MetricsReport | undefined }) => {
  const iconClass = 'h-4 w-4 text-muted-foreground';
  const summary = report?.summary;
  const live = report?.live;

  const databasesBytes = live?.databases.reduce((sum, db) => sum + (db.bytes ?? 0), 0);
  const databasesList = live?.databases
    .map(
      (db) =>
        `${db.name} (${db.fileName}): ${db.bytes === null ? 'нет файла' : formatBytes(db.bytes)}`,
    )
    .join('\n');

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        title="Запросов в минуту"
        icon={<ActivityIcon className={iconClass} />}
        value={summary && formatRpm(summary.requestsPerMinute)}
        hint={
          summary &&
          `${summary.requests.toLocaleString('ru-RU')} ${pluralRu(summary.requests, 'запрос', 'запроса', 'запросов')} за период`
        }
      />
      <SummaryCard
        title="Время ответа p50 / p95"
        icon={<GaugeIcon className={iconClass} />}
        value={summary && `${formatMs(summary.p50Ms)} / ${formatMs(summary.p95Ms)}`}
        hint="Половина запросов быстрее p50, 95% — быстрее p95"
      />
      <SummaryCard
        title="Ошибки сервера (5xx)"
        icon={<AlertTriangleIcon className={iconClass} />}
        value={summary && formatPercent(summary.serverErrorRate)}
        alert={(summary?.serverErrors ?? 0) > 0}
        hint={
          summary &&
          `${summary.serverErrors.toLocaleString('ru-RU')} шт. · 4xx: ${formatPercent(summary.clientErrorRate)} (${summary.clientErrors.toLocaleString('ru-RU')})`
        }
      />
      <SummaryCard
        title="Лаунчеры онлайн"
        icon={<MonitorIcon className={iconClass} />}
        value={live && live.launchersOnline.toLocaleString('ru-RU')}
        hint={summary && `Пик за период: ${summary.peakLaunchersOnline ?? '—'}`}
      />
      <SummaryCard
        title="Аптайм"
        icon={<TimerIcon className={iconClass} />}
        value={live && formatUptime(live.uptimeSeconds)}
        hint={live && `Запущен ${formatDateTime(live.startedAtUtc)}`}
      />
      <SummaryCard
        title="Память процесса"
        icon={<MemoryStickIcon className={iconClass} />}
        value={live && formatBytes(live.workingSetBytes)}
        hint={
          live &&
          `Куча .NET ${formatBytes(live.gcHeapBytes)} · доступно ${formatBytes(live.memoryLimitBytes)}`
        }
      />
      <SummaryCard
        title="CPU"
        icon={<CpuIcon className={iconClass} />}
        value={live && formatCpu(live.cpuPercent)}
        hint={
          live &&
          `Доля всех ${live.processorCount} ${pluralRu(live.processorCount, 'ядра', 'ядер', 'ядер')}, за 15 с`
        }
      />
      <SummaryCard
        title="SQLite"
        icon={<DatabaseIcon className={iconClass} />}
        value={databasesBytes === undefined ? undefined : formatBytes(databasesBytes)}
        hint={
          live &&
          `${live.databases.length} ${pluralRu(live.databases.length, 'файл', 'файла', 'файлов')} с журналами WAL`
        }
        hintTitle={databasesList}
      />
    </div>
  );
};
