import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import { DiagnosticProfileSettings } from '@/shared/api/contracts/diagnostics/schemas';
import { formatBytes } from '@/shared/lib/sentry/format';

const MB = 1024 ** 2;

/** Launcher values in MiB; below 1 GiB stays in МБ so "512 МБ" doesn't turn into "0.5 ГБ". */
export const formatMegabytes = (mb: number): string => {
  if (mb < 0) return '—';
  if (mb < 1024) return `${Math.round(mb)} МБ`;
  return formatBytes(mb * MB);
};

export const formatLatency = (ms: number | null): string => (ms === null ? '—' : `${ms} мс`);

const HAS_ZONE = /(Z|[+-]\d{2}:?\d{2})$/i;

/**
 * The API stores UTC, but a DateTime read back from SQLite may serialize without a zone, and
 * `new Date('2026-11-20T10:00:00')` would then read it as the viewer's local time.
 */
export const parseUtcDate = (iso: string): Date => new Date(HAS_ZONE.test(iso) ? iso : `${iso}Z`);

export const formatReportDate = (iso: string): string =>
  format(parseUtcDate(iso), 'd MMM yyyy, HH:mm:ss', { locale: ru });

const CONNECTIVITY_LABELS: Record<string, string> = {
  api: 'API',
  files: 'Файловый сервер',
  ping: 'Пинг',
};

export const connectivityLabel = (name: string): string =>
  CONNECTIVITY_LABELS[name.toLowerCase()] ?? name;

export const describeProfileRam = (
  profile: Pick<DiagnosticProfileSettings, 'isDynamicRam' | 'ramMb' | 'recommendedRamMb'>,
): string => {
  const amount = formatMegabytes(profile.ramMb);
  if (!profile.isDynamicRam) return `${amount} (вручную)`;
  if (profile.recommendedRamMb === null) return `${amount} (автоматически)`;
  return `${amount} (автоматически, рекомендовано ${formatMegabytes(profile.recommendedRamMb)})`;
};
