'use client';

import { CheckCircle2, ClipboardCopy, Copy } from 'lucide-react';

import { copyToClipboard } from '../lib/clipboard';

import { SentryStackTrace } from './SentryStackTrace';

import { SentryCount, SentryIssue } from '@/shared/api/contracts/sentry/schemas';
import { useResolveSentryIssue } from '@/shared/hooks';
import { formatBytes, formatDateTime, formatRelative } from '@/shared/lib/sentry/format';
import { buildIssueReport } from '@/shared/lib/sentry/report';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui/alert-dialog';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';

const Counts = ({ title, items }: { title: string; items: SentryCount[] }) => (
  <div className="flex flex-col gap-2">
    <h4 className="text-sm font-medium">{title}</h4>
    {items.length === 0 ? (
      <p className="text-sm text-muted-foreground">Нет данных</p>
    ) : (
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge key={item.name} variant="secondary" className="font-normal">
            {item.name}
            <span className="ml-2 text-muted-foreground">{item.count}</span>
          </Badge>
        ))}
      </div>
    )}
  </div>
);

export const SentryIssueDetails = ({ issue }: { issue: SentryIssue }) => {
  const { mutate: resolve, isPending } = useResolveSentryIssue();
  const event = issue.latestEvent;

  return (
    // contain:inline-size keeps the wide table and long stack lines from stretching the
    // dashboard layout column; they scroll inside their own boxes instead.
    <div className="flex flex-col gap-6 border-t px-4 py-5 [contain:inline-size]">
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-medium">Полное сообщение последнего события</h4>
        <p className="text-sm text-muted-foreground break-words whitespace-pre-wrap">
          {event.exceptions[event.exceptions.length - 1]?.message || issue.message}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Counts title="Версии лаунчера" items={issue.releases} />
        <Counts title="Операционные системы" items={issue.operationSystems} />
      </div>

      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-medium">
          У кого возникает
          <span className="ml-2 font-normal text-muted-foreground">
            пользователь Windows @ имя компьютера
          </span>
        </h4>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Устройство</TableHead>
                <TableHead className="text-right">Событий</TableHead>
                <TableHead>Последний раз</TableHead>
                <TableHead className="hidden lg:table-cell">Версия</TableHead>
                <TableHead className="hidden lg:table-cell">ОС</TableHead>
                <TableHead className="hidden md:table-cell">IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {issue.users.map((user) => (
                <TableRow key={`${user.username}@${user.pcName}`}>
                  <TableCell className="font-medium">
                    {user.username}
                    <span className="text-muted-foreground"> @ {user.pcName}</span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{user.count}</TableCell>
                  <TableCell title={formatDateTime(user.lastSeen)}>
                    {formatRelative(user.lastSeen)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{user.release ?? '—'}</TableCell>
                  <TableCell className="hidden lg:table-cell">{user.os ?? '—'}</TableCell>
                  <TableCell className="hidden md:table-cell">{user.ipAddress ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {issue.countUsers > issue.users.length && (
          <p className="text-xs text-muted-foreground">
            Показаны {issue.users.length} из {issue.countUsers} устройств
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h4 className="text-sm font-medium">Стек последнего события</h4>
          <p className="text-xs text-muted-foreground">
            {formatDateTime(event.sendAt)}
            {event.username && ` · ${event.username} @ ${event.pcName ?? '—'}`}
            {event.release && ` · ${event.release}`}
            {event.runtime && ` · ${event.runtime}`}
            {event.memoryAllocatedBytes != null &&
              event.memoryAllocatedBytes > 0 &&
              ` · память процесса ${formatBytes(event.memoryAllocatedBytes)}`}
            {event.memoryTotalBytes != null &&
              event.memoryTotalBytes > 0 &&
              ` из ${formatBytes(event.memoryTotalBytes)}`}
          </p>
        </div>
        <SentryStackTrace exceptions={event.exceptions} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => void copyToClipboard(event.stackTrace, 'Стек')}>
          <Copy className="mr-2 h-4 w-4" />
          Копировать стек
        </Button>
        <Button
          variant="secondary"
          onClick={() => void copyToClipboard(buildIssueReport(issue), 'Отчёт')}
        >
          <ClipboardCopy className="mr-2 h-4 w-4" />
          Копировать отчёт
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" disabled={isPending}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Отметить решённой
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Отметить проблему решённой?</AlertDialogTitle>
              <AlertDialogDescription>
                Все события этой проблемы будут удалены за всё время, а не только за выбранный
                период. Если ошибка повторится (например, у игроков ещё старая версия лаунчера), она
                снова появится в списке. Последнее событие было {formatRelative(issue.lastSeen)}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction onClick={() => resolve(issue.fingerprint)}>
                Решена
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
