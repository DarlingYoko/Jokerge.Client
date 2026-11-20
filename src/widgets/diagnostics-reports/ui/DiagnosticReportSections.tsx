import { ReactNode } from 'react';

import { DiagnosticConnectivityTable } from './DiagnosticConnectivityTable';

import { DiagnosticReportDetails } from '@/shared/api/contracts/diagnostics/schemas';
import {
  describeProfileRam,
  formatMegabytes,
  formatReportDate,
} from '@/shared/lib/diagnostics/format';
import { formatBytes, pluralRu } from '@/shared/lib/sentry/format';

type Field = { label: string; value: ReactNode; mono?: boolean };

const Section = ({ title, fields }: { title: string; fields: Field[] }) => (
  <section className="flex flex-col gap-2">
    <h4 className="text-sm font-medium">{title}</h4>
    <dl className="grid grid-cols-[minmax(8rem,auto)_1fr] gap-x-4 gap-y-1 text-sm">
      {fields.map((field) => (
        <div key={field.label} className="contents">
          <dt className="text-muted-foreground">{field.label}</dt>
          <dd className={field.mono ? 'break-all font-mono text-xs leading-5' : 'break-words'}>
            {field.value}
          </dd>
        </div>
      ))}
    </dl>
  </section>
);

const yesNo = (value: boolean): string => (value ? 'Да' : 'Нет');

/** Bytes may be unknown (-1) when the launcher couldn't read the drive. */
const formatDiskBytes = (bytes: number): string => (bytes < 0 ? '—' : formatBytes(bytes));

export const DiagnosticReportSections = ({ details }: { details: DiagnosticReportDetails }) => {
  const { report } = details;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Section
          title="Система"
          fields={[
            { label: 'Версия лаунчера', value: report.launcherVersion },
            { label: 'ОС', value: report.os.description },
            { label: 'Тип ОС', value: report.os.type },
            { label: 'Архитектура', value: report.os.architecture },
            { label: 'Собран у игрока', value: formatReportDate(report.collectedAt) },
            { label: 'Получен сервером', value: formatReportDate(details.createdAt) },
          ]}
        />
        <Section
          title="Профиль и настройки"
          fields={[
            { label: 'Профиль', value: report.profile.name ?? '—' },
            { label: 'Память игре', value: describeProfileRam(report.profile) },
            { label: 'Полный экран', value: yesNo(report.profile.fullScreen) },
            {
              label: 'Размер окна',
              value: `${report.profile.windowWidth} × ${report.profile.windowHeight}`,
            },
          ]}
        />
        <Section
          title="Память"
          fields={[
            { label: 'Всего', value: formatMegabytes(report.memory.totalMb) },
            { label: 'Свободно', value: formatMegabytes(report.memory.freeMb) },
          ]}
        />
        <Section
          title="Диск"
          fields={[
            { label: 'Папка игры', value: report.disk.gameFolder || '—', mono: true },
            { label: 'Свободно', value: formatDiskBytes(report.disk.freeBytes) },
            { label: 'Всего', value: formatDiskBytes(report.disk.totalBytes) },
          ]}
        />
        <Section
          title="Java"
          fields={[
            { label: 'Найдена', value: yesNo(report.java.found) },
            { label: 'Версия', value: report.java.version ?? '—' },
            { label: 'Путь', value: report.java.path ?? '—', mono: !!report.java.path },
          ]}
        />
      </div>

      <section className="flex flex-col gap-2">
        <h4 className="text-sm font-medium">Связь</h4>
        <DiagnosticConnectivityTable probes={report.connectivity} />
      </section>

      <section className="flex flex-col gap-2">
        <h4 className="text-sm font-medium">
          Хвост лога
          <span className="ml-2 font-normal text-muted-foreground">
            {report.logTail.length} {pluralRu(report.logTail.length, 'строка', 'строки', 'строк')}
          </span>
        </h4>
        {report.logTail.length === 0 ? (
          <p className="text-sm text-muted-foreground">Лог пуст</p>
        ) : (
          <pre className="max-h-72 overflow-auto rounded-md border bg-muted/50 p-3 font-mono text-xs leading-5">
            {report.logTail.join('\n')}
          </pre>
        )}
      </section>
    </div>
  );
};
