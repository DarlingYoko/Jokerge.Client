import { describe, expect, it } from 'vitest';

import { buildIssueReport } from './report';

import { SentryIssue } from '@/shared/api/contracts/sentry/schemas';
import { ProjectTypeEnum } from '@/shared/enums';

const issue: SentryIssue = {
  fingerprint: 'abc',
  projectType: ProjectTypeEnum.Launcher,
  exception: 'System.IO.IOException',
  message: "The process cannot access the file '…\\profiles.json'",
  count: 413,
  countUsers: 3,
  firstSeen: '2026-11-01T10:00:00Z',
  lastSeen: '2026-11-20T10:00:00Z',
  releases: [{ name: 'Gml.Launcher@1.0.0.15', count: 400 }],
  operationSystems: [{ name: 'Windows 11', count: 413 }],
  users: [
    {
      username: 'yoko',
      pcName: 'PC-A',
      player: 'Waffle',
      count: 247,
      lastSeen: '2026-11-20T10:00:00Z',
      ipAddress: null,
      os: null,
      release: null,
    },
    {
      username: 'vipig',
      pcName: 'PC-B',
      player: null,
      count: 3,
      lastSeen: '2026-11-19T10:00:00Z',
      ipAddress: null,
      os: null,
      release: null,
    },
  ],
  granularity: 'day',
  graphic: [],
  latestEvent: {
    id: '1',
    sendAt: '2026-11-20T10:00:00Z',
    username: 'yoko',
    pcName: 'PC-A',
    player: 'Waffle',
    ipAddress: '10.0.0.1',
    os: 'Windows 11',
    runtime: null,
    release: 'Gml.Launcher@1.0.0.15',
    memoryAllocatedBytes: null,
    memoryTotalBytes: null,
    exceptions: [],
    stackTrace: 'System.IO.IOException: locked\n   at Crash() in B.cs:line 2',
  },
};

describe('buildIssueReport', () => {
  it('has what is needed to start fixing without opening the panel', () => {
    const report = buildIssueReport(issue);

    expect(report).toContain('System.IO.IOException');
    expect(report).toContain('413');
    expect(report).toContain('Waffle (yoko @ PC-A) — 247');
    expect(report).toContain('  vipig @ PC-B — 3');
    expect(report).toContain('Gml.Launcher@1.0.0.15 — 400');
    expect(report).toContain('at Crash() in B.cs:line 2');
    expect(report).not.toContain('10.0.0.1');
  });
});
