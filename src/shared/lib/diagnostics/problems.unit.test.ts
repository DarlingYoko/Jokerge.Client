import { describe, expect, it } from 'vitest';

import {
  DiagnosticProblemInput,
  getDiagnosticProblems,
  LOW_DISK_THRESHOLD_BYTES,
  toProblemInput,
} from './problems';

import { DiagnosticReport } from '@/shared/api/contracts/diagnostics/schemas';

const GIB = 1024 ** 3;

const healthy: DiagnosticProblemInput = {
  freeDiskBytes: 50 * GIB,
  freeRamMb: 8192,
  selectedRamMb: 4096,
  javaFound: true,
  apiReachable: true,
  filesReachable: true,
};

const codes = (input: DiagnosticProblemInput) => getDiagnosticProblems(input).map((p) => p.code);

describe('getDiagnosticProblems', () => {
  it('returns nothing for a healthy machine', () => {
    expect(getDiagnosticProblems(healthy)).toEqual([]);
  });

  it('treats exactly 2 GiB of free disk as enough', () => {
    expect(LOW_DISK_THRESHOLD_BYTES).toBe(2 * GIB);
    expect(codes({ ...healthy, freeDiskBytes: 2 * GIB })).toEqual([]);
  });

  it('flags free disk just under 2 GiB and says how much is left', () => {
    const [problem] = getDiagnosticProblems({ ...healthy, freeDiskBytes: 2 * GIB - 1 });

    expect(problem.code).toBe('lowDisk');
    expect(problem.label).toBe('Мало места на диске');
    expect(problem.details).toBe('Свободно 2 ГБ, нужно не меньше 2 ГБ');
  });

  it('flags a full disk', () => {
    expect(codes({ ...healthy, freeDiskBytes: 0 })).toEqual(['lowDisk']);
  });

  it('skips the disk check when the launcher could not measure it', () => {
    expect(codes({ ...healthy, freeDiskBytes: -1 })).toEqual([]);
  });

  it('treats free RAM equal to the selected amount as enough', () => {
    expect(codes({ ...healthy, freeRamMb: 4096, selectedRamMb: 4096 })).toEqual([]);
  });

  it('flags free RAM below the selected amount', () => {
    const [problem] = getDiagnosticProblems({ ...healthy, freeRamMb: 4095, selectedRamMb: 4096 });

    expect(problem.code).toBe('lowRam');
    expect(problem.label).toBe('Не хватает памяти');
    expect(problem.details).toBe('Свободно 4 ГБ, игре выделено 4 ГБ');
  });

  it('skips the RAM check when no amount is selected', () => {
    expect(codes({ ...healthy, freeRamMb: 100, selectedRamMb: 0 })).toEqual([]);
  });

  it('flags unreachable servers and missing Java', () => {
    const problems = getDiagnosticProblems({
      ...healthy,
      apiReachable: false,
      filesReachable: false,
      javaFound: false,
    });

    expect(problems.map((p) => [p.code, p.label, p.severity])).toEqual([
      ['apiUnreachable', 'API недоступен', 'error'],
      ['filesUnreachable', 'Файловый сервер недоступен', 'error'],
      ['javaMissing', 'Java не найдена', 'warning'],
    ]);
  });

  it('lists every problem at once, most severe first', () => {
    expect(
      codes({
        freeDiskBytes: 0,
        freeRamMb: 1,
        selectedRamMb: 2,
        javaFound: false,
        apiReachable: false,
        filesReachable: false,
      }),
    ).toEqual(['apiUnreachable', 'filesUnreachable', 'lowDisk', 'lowRam', 'javaMissing']);
  });
});

const report = (overrides: Partial<DiagnosticReport> = {}): DiagnosticReport => ({
  launcherVersion: '1.0.0',
  os: { description: 'Windows 11', architecture: 'X64', type: 'Windows' },
  memory: { totalMb: 16384, freeMb: 9000 },
  disk: { gameFolder: 'C:\\Games', freeBytes: 10 * GIB, totalBytes: 500 * GIB },
  java: { found: true, path: 'C:\\java', version: '21' },
  connectivity: [
    {
      name: 'api',
      target: 'https://a',
      reachable: true,
      latencyMs: 10,
      statusCode: 200,
      error: null,
    },
    {
      name: 'files',
      target: 'https://f',
      reachable: false,
      latencyMs: null,
      statusCode: null,
      error: 'x',
    },
  ],
  profile: {
    name: 'main',
    isDynamicRam: false,
    ramMb: 6144,
    recommendedRamMb: null,
    fullScreen: false,
    windowWidth: 1280,
    windowHeight: 720,
  },
  logTail: [],
  collectedAt: '2026-11-20T10:00:00Z',
  text: '',
  ...overrides,
});

describe('toProblemInput', () => {
  it('maps the full report onto the same input the list uses', () => {
    expect(toProblemInput(report())).toEqual({
      freeDiskBytes: 10 * GIB,
      freeRamMb: 9000,
      selectedRamMb: 6144,
      javaFound: true,
      apiReachable: true,
      filesReachable: false,
    });
  });

  it('matches probe names case-insensitively and assumes reachable when a probe is absent', () => {
    const input = toProblemInput(
      report({
        connectivity: [
          {
            name: 'API',
            target: 'x',
            reachable: false,
            latencyMs: null,
            statusCode: 503,
            error: null,
          },
        ],
      }),
    );

    expect(input.apiReachable).toBe(false);
    expect(input.filesReachable).toBe(true);
  });
});
