import { formatDateTime } from './format';

import { SentryIssue, SentryIssueUser } from '@/shared/api/contracts/sentry/schemas';

/** "Waffle (yoko @ PC-A)" once the player is known, "yoko @ PC-A" for reports before sign-in. */
const describeUser = (user: SentryIssueUser): string => {
  const device = `${user.username} @ ${user.pcName}`;
  return user.player ? `${user.player} (${device})` : device;
};

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
      'Игроки и устройства:',
      ...issue.users.map((u) => `  ${describeUser(u)} — ${u.count}`),
    );
  }

  lines.push('', `Стек последнего события (${formatDateTime(issue.latestEvent.sendAt)}):`);
  lines.push(issue.latestEvent.stackTrace);

  return lines.join('\n');
};
