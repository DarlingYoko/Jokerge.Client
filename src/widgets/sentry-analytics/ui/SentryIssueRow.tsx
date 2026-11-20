'use client';

import { forwardRef } from 'react';
import { ChevronRight } from 'lucide-react';

import { SentryIssueDetails } from './SentryIssueDetails';
import { SentrySparkline } from './SentrySparkline';

import { SentryIssue } from '@/shared/api/contracts/sentry/schemas';
import { ProjectTypeOption } from '@/shared/enums';
import {
  formatDateTime,
  formatRelative,
  pluralRu,
  shortExceptionName,
} from '@/shared/lib/sentry/format';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';

type SentryIssueRowProps = {
  issue: SentryIssue;
  expanded: boolean;
  onToggle: () => void;
};

const Stat = ({ value, label }: { value: number; label: string }) => (
  <div className="flex w-20 flex-col items-end">
    <span className="text-lg font-semibold tabular-nums">{value.toLocaleString('ru-RU')}</span>
    <span className="text-xs text-muted-foreground">{label}</span>
  </div>
);

export const SentryIssueRow = forwardRef<HTMLDivElement, SentryIssueRowProps>(
  ({ issue, expanded, onToggle }, ref) => {
    const project =
      ProjectTypeOption[`OPTION_${issue.projectType}` as keyof typeof ProjectTypeOption];
    const latestRelease = issue.releases[0]?.name;

    return (
      <div ref={ref} className={cn('rounded-lg border bg-card', expanded && 'ring-1 ring-ring/30')}>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="grid w-full grid-cols-1 gap-3 p-4 text-left transition-colors hover:bg-muted/40 md:grid-cols-[1fr_auto] md:items-center"
        >
          <div className="flex min-w-0 gap-3">
            <ChevronRight
              className={cn(
                'mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                expanded && 'rotate-90',
              )}
            />
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold" title={issue.exception}>
                  {shortExceptionName(issue.exception)}
                </span>
                {project && <Badge variant="outline">{project}</Badge>}
                {latestRelease && (
                  <Badge variant="secondary" className="font-normal">
                    {latestRelease}
                    {issue.releases.length > 1 && ` +${issue.releases.length - 1}`}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground break-words line-clamp-2">
                {issue.message || 'Без сообщения'}
              </p>
              <p className="text-xs text-muted-foreground">
                <span title={formatDateTime(issue.lastSeen)}>
                  Последний раз {formatRelative(issue.lastSeen)}
                </span>
                {' · '}
                <span title={formatDateTime(issue.firstSeen)}>
                  впервые {formatRelative(issue.firstSeen)}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-4 pl-7 md:pl-0">
            <SentrySparkline
              buckets={issue.graphic}
              granularity={issue.granularity}
              className="hidden sm:flex"
            />
            <Stat
              value={issue.count}
              label={pluralRu(issue.count, 'событие', 'события', 'событий')}
            />
            <Stat
              value={issue.countUsers}
              label={pluralRu(issue.countUsers, 'устройство', 'устройства', 'устройств')}
            />
          </div>
        </button>
        {expanded && <SentryIssueDetails issue={issue} />}
      </div>
    );
  },
);
SentryIssueRow.displayName = 'SentryIssueRow';
