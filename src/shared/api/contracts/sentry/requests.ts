import { ResponseBaseEntity } from '@/shared/api/schemas';
import {
  BaseSentryStats,
  BaseSentrySummary,
  SentryIssue,
} from '@/shared/api/contracts/sentry/schemas';
import { ProjectTypeEnum } from '@/shared/enums';

export type TPostSentryIssuesRequest = {
  projectType: ProjectTypeEnum;
  /** UTC ISO instant; null means all time. */
  dateFrom: string | null;
  dateTo: string;
  /** Viewer offset in minutes east of UTC, for chart buckets. */
  tzOffset: number;
};
export type TPostSentryIssuesResponse = ResponseBaseEntity & {
  data: SentryIssue[];
};

export type TPostSentryResolveIssueRequest = { fingerprint: string };
export type TPostSentryResolveIssueResponse = ResponseBaseEntity & { data: number };

export type TGetSentryStatsResponse = ResponseBaseEntity & {
  data: BaseSentryStats[];
};

export type TGetSentrySummaryResponse = ResponseBaseEntity & {
  data: BaseSentrySummary;
};

export type TPostSentryClearResponse = ResponseBaseEntity;
