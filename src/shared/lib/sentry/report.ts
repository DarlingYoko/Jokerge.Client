import { formatDateTime } from './format';

import { SentryIssue } from '@/shared/api/contracts/sentry/schemas';

/**
 * Plain-text summary of one problem to paste into a task or a chat. IP addresses stay out of it:
 * the text is meant to leave the panel.
 */
export const buildIssueReport = (issue: SentryIssue): string => {
  const lines = [
    `${issue.exception}: ${issue.message}`,
    '',
    `Событий: ${issue.count}, устройств: ${issue.countUsers}`,
    `Впервые: ${formatDateTime(issue.firstSeen)}, последний раз: ${formatDateTime(issue.lastSeen)}`,
  ];

  if (issue.releases.length) {
    lines.push('', 'Версии:', ...issue.releases.map((r) => `  ${r.name} — ${r.count}`));
  }
  if (issue.operationSystems.length) {
    lines.push('', 'ОС:', ...issue.operationSystems.map((o) => `  ${o.name} — ${o.count}`));
  }
  if (issue.users.length) {
    lines.push(
      '',
      'Устройства:',
      ...issue.users.map((u) => `  ${u.username} @ ${u.pcName} — ${u.count}`),
    );
  }

  lines.push('', `Стек последнего события (${formatDateTime(issue.latestEvent.sendAt)}):`);
  lines.push(issue.latestEvent.stackTrace);

  return lines.join('\n');
};
