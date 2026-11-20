import { ProjectTypeEnum } from '@/shared/enums';
import { SentryGranularity } from '@/shared/lib/sentry/format';

export type SentryFrame = {
  function: string | null;
  file: string | null;
  line: number | null;
  /** Frame in our own code (launcher), as opposed to .NET/library code. */
  inApp: boolean;
};

export type SentryExceptionInfo = {
  type: string;
  message: string;
  frames: SentryFrame[];
};

export type SentryCount = { name: string; count: number };

/** One chart bar; `start` is viewer wall-clock time ("2026-11-20" or "2026-11-20T15:00"). */
export type SentryBucket = { start: string; count: number };

export type SentryIssueUser = {
  username: string;
  pcName: string;
  count: number;
  lastSeen: string;
  ipAddress: string | null;
  os: string | null;
  release: string | null;
};

export type SentryIssueEvent = {
  id: string;
  sendAt: string;
  username: string | null;
  pcName: string | null;
  ipAddress: string | null;
  os: string | null;
  runtime: string | null;
  release: string | null;
  memoryAllocatedBytes: number | null;
  memoryTotalBytes: number | null;
  /** Outermost exception first, crashing frame first. */
  exceptions: SentryExceptionInfo[];
  stackTrace: string;
};

export type SentryIssue = {
  fingerprint: string;
  projectType: ProjectTypeEnum;
  exception: string;
  message: string;
  count: number;
  countUsers: number;
  firstSeen: string;
  lastSeen: string;
  releases: SentryCount[];
  operationSystems: SentryCount[];
  users: SentryIssueUser[];
  granularity: SentryGranularity;
  graphic: SentryBucket[];
  latestEvent: SentryIssueEvent;
};

export type BaseSentryStats = {
  date: string;
  launcher: number;
  backend: number;
};

export type BaseSentrySummary = {
  totalBugs: number;
  bugsToday: number;
  bugsYesterday: number;
  bugsLast7Days: number;
  bugsPrevious7Days: number;
  issuesLast7Days: number;
  usersLast7Days: number;
  lastBugAt: string | null;
};
