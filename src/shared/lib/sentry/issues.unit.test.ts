import { describe, expect, it } from 'vitest';

import { filterAndSortIssues, summarizeIssues } from './issues';

import { SentryIssue } from '@/shared/api/contracts/sentry/schemas';

const issue = (patch: Partial<SentryIssue>): SentryIssue =>
  ({
    fingerprint: Math.random().toString(),
    exception: 'System.Exception',
    message: '',
    count: 1,
    countUsers: 1,
    lastSeen: '2026-11-20T10:00:00Z',
    releases: [],
    users: [],
    ...patch,
  }) as SentryIssue;

describe('filterAndSortIssues', () => {
  const a = issue({ exception: 'A', count: 5, countUsers: 1, lastSeen: '2026-11-20T08:00:00Z' });
  const b = issue({ exception: 'B', count: 2, countUsers: 3, lastSeen: '2026-11-20T09:00:00Z' });
  const c = issue({
    exception: 'System.IO.IOException',
    message: 'profiles.json is locked',
    count: 1,
    lastSeen: '2026-11-20T10:00:00Z',
    users: [
      {
        username: 'vipig',
        pcName: 'DESKTOP-9',
        player: 'WaffleKing',
        count: 1,
        lastSeen: '',
        ipAddress: null,
        os: null,
        release: null,
      },
    ],
    releases: [{ name: 'Gml.Launcher@1.0.0.15', count: 1 }],
  });

  it('sorts by count, recency or devices', () => {
    expect(filterAndSortIssues([b, c, a], '', 'count').map((i) => i.exception)).toEqual([
      'A',
      'B',
      'System.IO.IOException',
    ]);
    expect(filterAndSortIssues([a, b, c], '', 'recent')[0]).toBe(c);
    expect(filterAndSortIssues([a, b, c], '', 'users')[0]).toBe(b);
  });

  it('searches message, exception, player, computer and version, case-insensitively', () => {
    expect(filterAndSortIssues([a, b, c], 'PROFILES', 'count')).toEqual([c]);
    expect(filterAndSortIssues([a, b, c], 'ioexception', 'count')).toEqual([c]);
    expect(filterAndSortIssues([a, b, c], 'vipig', 'count')).toEqual([c]);
    expect(filterAndSortIssues([a, b, c], 'waffleking', 'count')).toEqual([c]);
    expect(filterAndSortIssues([a, b, c], 'desktop-9', 'count')).toEqual([c]);
    expect(filterAndSortIssues([a, b, c], '1.0.0.15', 'count')).toEqual([c]);
  });
});

describe('summarizeIssues', () => {
  it('counts events and distinct devices across issues', () => {
    const user = (name: string, player: string | null = null) => ({
      username: name,
      pcName: 'PC',
      player,
      count: 1,
      lastSeen: '',
      ipAddress: null,
      os: null,
      release: null,
    });
    const issues = [
      issue({ count: 3, countUsers: 2, users: [user('a'), user('b')] }),
      issue({ count: 2, countUsers: 1, users: [user('a')] }),
    ];

    expect(summarizeIssues(issues)).toEqual({ issues: 2, events: 5, devices: 2 });
  });

  it('counts two players on one computer as two', () => {
    const user = (player: string) => ({
      username: 'home',
      pcName: 'PC',
      player,
      count: 1,
      lastSeen: '',
      ipAddress: null,
      os: null,
      release: null,
    });
    const issues = [issue({ users: [user('Elder'), user('Younger')] })];

    expect(summarizeIssues(issues).devices).toBe(2);
  });
});
