import {
  DiagnosticReport,
  DiagnosticReportSummary,
} from '@/shared/api/contracts/diagnostics/schemas';
import { formatBytes } from '@/shared/lib/sentry/format';
import { formatMegabytes } from '@/shared/lib/diagnostics/format';

export const LOW_DISK_THRESHOLD_BYTES = 2 * 1024 ** 3;

export type DiagnosticProblemCode =
  | 'apiUnreachable'
  | 'filesUnreachable'
  | 'lowDisk'
  | 'lowRam'
  | 'javaMissing';

/** 'error' — the game can't start or update; 'warning' — it may start but likely misbehaves. */
export type DiagnosticProblemSeverity = 'error' | 'warning';

export type DiagnosticProblem = {
  code: DiagnosticProblemCode;
  severity: DiagnosticProblemSeverity;
  label: string;
  details: string;
};

export type DiagnosticProblemInput = Pick<
  DiagnosticReportSummary,
  'freeDiskBytes' | 'freeRamMb' | 'selectedRamMb' | 'javaFound' | 'apiReachable' | 'filesReachable'
>;

/** Most severe first, so the first badge in a row is the one to look at. */
export const getDiagnosticProblems = (input: DiagnosticProblemInput): DiagnosticProblem[] => {
  const problems: DiagnosticProblem[] = [];

  if (!input.apiReachable) {
    problems.push({
      code: 'apiUnreachable',
      severity: 'error',
      label: 'API недоступен',
      details: 'Лаунчер не смог связаться с API: авторизация и профили не загрузятся',
    });
  }

  if (!input.filesReachable) {
    problems.push({
      code: 'filesUnreachable',
      severity: 'error',
      label: 'Файловый сервер недоступен',
      details: 'Лаунчер не смог связаться с файловым сервером: файлы игры не скачаются',
    });
  }

  // A negative value means the launcher couldn't measure it.
  if (input.freeDiskBytes >= 0 && input.freeDiskBytes < LOW_DISK_THRESHOLD_BYTES) {
    problems.push({
      code: 'lowDisk',
      severity: 'warning',
      label: 'Мало места на диске',
      details: `Свободно ${formatBytes(input.freeDiskBytes)}, нужно не меньше ${formatBytes(LOW_DISK_THRESHOLD_BYTES)}`,
    });
  }

  if (input.selectedRamMb > 0 && input.freeRamMb >= 0 && input.freeRamMb < input.selectedRamMb) {
    problems.push({
      code: 'lowRam',
      severity: 'warning',
      label: 'Не хватает памяти',
      details: `Свободно ${formatMegabytes(input.freeRamMb)}, игре выделено ${formatMegabytes(input.selectedRamMb)}`,
    });
  }

  if (!input.javaFound) {
    problems.push({
      code: 'javaMissing',
      severity: 'warning',
      label: 'Java не найдена',
      details: 'На компьютере не найдена подходящая Java',
    });
  }

  return problems;
};

/** An absent probe is no evidence of a problem, so it counts as reachable. */
const isProbeReachable = (report: DiagnosticReport, name: string): boolean =>
  report.connectivity.find((probe) => probe.name.toLowerCase() === name)?.reachable ?? true;

/** Same checks for the full report as for a list row. */
export const toProblemInput = (report: DiagnosticReport): DiagnosticProblemInput => ({
  freeDiskBytes: report.disk.freeBytes,
  freeRamMb: report.memory.freeMb,
  selectedRamMb: report.profile.ramMb,
  javaFound: report.java.found,
  apiReachable: isProbeReachable(report, 'api'),
  filesReachable: isProbeReachable(report, 'files'),
});
