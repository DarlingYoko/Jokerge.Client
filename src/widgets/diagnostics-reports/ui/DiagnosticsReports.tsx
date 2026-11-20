'use client';

import { KeyboardEvent, useEffect, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon, StethoscopeIcon } from 'lucide-react';

import { DiagnosticProblemBadges } from './DiagnosticProblemBadges';
import { DiagnosticReportDialog } from './DiagnosticReportDialog';

import { DiagnosticReportSummary } from '@/shared/api/contracts/diagnostics/schemas';
import { useDiagnosticReports } from '@/shared/hooks/useDiagnostics';
import { formatReportDate } from '@/shared/lib/diagnostics/format';
import { clampPage, getPageCount } from '@/shared/lib/diagnostics/pagination';
import { getDiagnosticProblems } from '@/shared/lib/diagnostics/problems';
import { hasPermission } from '@/shared/lib/permissions/hasPermission';
import { getStorageProfile } from '@/shared/services/AuthTokenService';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Skeleton } from '@/shared/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;
const COLUMNS = 6;

const ReportRow = ({
  report,
  onOpen,
}: {
  report: DiagnosticReportSummary;
  onOpen: (id: string) => void;
}) => {
  const onKeyDown = (event: KeyboardEvent<HTMLTableRowElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen(report.id);
    }
  };

  return (
    <TableRow
      className="cursor-pointer"
      tabIndex={0}
      onClick={() => onOpen(report.id)}
      onKeyDown={onKeyDown}
    >
      <TableCell className="font-medium">{report.userName}</TableCell>
      <TableCell className="whitespace-nowrap">{formatReportDate(report.createdAt)}</TableCell>
      <TableCell className="hidden md:table-cell">{report.launcherVersion}</TableCell>
      <TableCell className="hidden lg:table-cell">
        {report.osDescription}
        <span className="text-muted-foreground"> · {report.architecture}</span>
      </TableCell>
      <TableCell className="hidden md:table-cell">{report.profileName ?? '—'}</TableCell>
      <TableCell>
        <DiagnosticProblemBadges problems={getDiagnosticProblems(report)} />
      </TableCell>
    </TableRow>
  );
};

const LoadingRows = () => (
  <>
    {Array.from({ length: 5 }, (_, index) => (
      <TableRow key={index}>
        <TableCell colSpan={COLUMNS}>
          <Skeleton className="h-6 w-full" />
        </TableCell>
      </TableRow>
    ))}
  </>
);

const EmptyState = ({ search }: { search: string }) => (
  <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
    <StethoscopeIcon className="h-8 w-8 text-muted-foreground" />
    {search ? (
      <p className="text-sm text-muted-foreground">По запросу «{search}» отчётов не найдено</p>
    ) : (
      <p className="max-w-md text-sm text-muted-foreground">
        Отчётов пока нет — игрок может отправить отчёт из настроек лаунчера кнопкой «Диагностика»
      </p>
    )}
  </div>
);

export const DiagnosticsReports = () => {
  const [search, setSearch] = useState('');
  const [userName, setUserName] = useState('');
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  // The profile cookie is client-only; reading it during render would mismatch the server HTML.
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    setCanDelete(hasPermission(getStorageProfile(), 'diagnostics.delete'));
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setUserName(search.trim());
      setPage(0);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, isPending, isError, isFetching } = useDiagnosticReports({
    take: PAGE_SIZE,
    offset: page * PAGE_SIZE,
    userName: userName || undefined,
  });

  const total = data?.total ?? 0;
  const pageCount = getPageCount(total, PAGE_SIZE);

  // Deleting the only report on the last page would otherwise leave an empty page behind.
  useEffect(() => {
    if (data) setPage((current) => clampPage(current, data.total, PAGE_SIZE));
  }, [data]);

  const openReport = (id: string) => {
    setSelectedId(id);
    setDialogOpen(true);
  };

  const isEmpty = data !== undefined && data.items.length === 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-sm">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Ник игрока"
          aria-label="Поиск по нику"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="pl-9"
        />
      </div>

      {isError && (
        <p className="text-sm text-destructive">
          Не удалось загрузить отчёты. Проверьте подключение к API и право diagnostics.view.
        </p>
      )}

      <div
        className="rounded-md border transition-opacity"
        style={{ opacity: isFetching && !isPending ? 0.6 : 1 }}
      >
        {isEmpty ? (
          <EmptyState search={userName} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Игрок</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead className="hidden md:table-cell">Лаунчер</TableHead>
                <TableHead className="hidden lg:table-cell">ОС</TableHead>
                <TableHead className="hidden md:table-cell">Профиль</TableHead>
                <TableHead>Состояние</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending && !isError ? (
                <LoadingRows />
              ) : (
                data?.items.map((report) => (
                  <ReportRow key={report.id} report={report} onOpen={openReport} />
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
          <span>
            Страница {page + 1} из {pageCount} · всего отчётов: {total}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((current) => current - 1)}
            >
              <ChevronLeftIcon className="mr-1 h-4 w-4" />
              Назад
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page + 1 >= pageCount}
              onClick={() => setPage((current) => current + 1)}
            >
              Вперёд
              <ChevronRightIcon className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <DiagnosticReportDialog
        reportId={selectedId}
        open={dialogOpen}
        canDelete={canDelete}
        onClose={() => setDialogOpen(false)}
        onDeleted={() => {
          setDialogOpen(false);
          setSelectedId(null);
        }}
      />
    </div>
  );
};
