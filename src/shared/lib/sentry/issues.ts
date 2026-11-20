import { SentryIssue } from '@/shared/api/contracts/sentry/schemas';

export type SentryIssueSort = 'count' | 'recent' | 'users';

const matches = (issue: SentryIssue, needle: string): boolean => {
  const haystack = [
    issue.exception,
    issue.message,
    ...issue.releases.map((r) => r.name),
    ...issue.users.flatMap((u) => [u.player, u.username, u.pcName]),
  ];
  return haystack.some((text) => text?.toLowerCase().includes(needle));
};

const comparators: Record<SentryIssueSort, (a: SentryIssue, b: SentryIssue) => number> = {
  count: (a, b) => b.count - a.count || b.lastSeen.localeCompare(a.lastSeen),
  recent: (a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime(),
  users: (a, b) => b.countUsers - a.countUsers || b.count - a.count,
};

export const filterAndSortIssues = (
  issues: SentryIssue[],
  search: string,
  sort: SentryIssueSort,
): SentryIssue[] => {
  const needle = search.trim().toLowerCase();
  const filtered = needle ? issues.filter((issue) => matches(issue, needle)) : [...issues];
  return filtered.sort(comparators[sort]);
};

/**
 * Totals for the list header. Devices are counted from the per-issue lists, which the server caps,
 * so on very wide problems this is a lower bound.
 */
export const summarizeIssues = (issues: SentryIssue[]) => {
  const devices = new Set(
    issues.flatMap((i) => i.users.map((u) => `${u.player ?? ''}|${u.username}@${u.pcName}`)),
  );
  return {
    issues: issues.length,
    events: issues.reduce((sum, i) => sum + i.count, 0),
    devices: devices.size,
  };
};
