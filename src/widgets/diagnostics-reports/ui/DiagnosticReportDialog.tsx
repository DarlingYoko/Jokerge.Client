'use client';

import { ClipboardCopyIcon, Loader2Icon } from 'lucide-react';

import { copyToClipboard } from '../lib/clipboard';

import { DeleteDiagnosticReportButton } from './DeleteDiagnosticReportButton';
import { DiagnosticProblemBadges } from './DiagnosticProblemBadges';
import { DiagnosticReportSections } from './DiagnosticReportSections';

import { useDiagnosticReport } from '@/shared/hooks/useDiagnostics';
import { formatReportDate } from '@/shared/lib/diagnostics/format';
import { getDiagnosticProblems, toProblemInput } from '@/shared/lib/diagnostics/problems';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';

type DiagnosticReportDialogProps = {
  /** Kept after closing so the content doesn't flash to "loading" during the close animation. */
  reportId: string | null;
  open: boolean;
  canDelete: boolean;
  onClose: () => void;
  onDeleted: () => void;
};

export const DiagnosticReportDialog = ({
  reportId,
  open,
  canDelete,
  onClose,
  onDeleted,
}: DiagnosticReportDialogProps) => {
  const { data: details, isPending, isError } = useDiagnosticReport(reportId);

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="flex max-h-[calc(100vh-4rem)] max-w-4xl flex-col gap-4">
        <DialogHeader className="pr-6">
          <DialogTitle>
            {details ? `Диагностика: ${details.userName}` : 'Отчёт диагностики'}
          </DialogTitle>
          <DialogDescription>
            {details ? `Получен ${formatReportDate(details.createdAt)}` : 'Загрузка отчёта'}
          </DialogDescription>
        </DialogHeader>

        <div className="-mx-6 min-h-0 flex-1 overflow-y-auto px-6 [contain:inline-size]">
          {isPending && reportId !== null && (
            <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2Icon className="h-4 w-4 animate-spin" />
              Загружаем отчёт…
            </div>
          )}

          {isError && (
            <p className="py-10 text-sm text-destructive">
              Не удалось загрузить отчёт. Возможно, он уже удалён.
            </p>
          )}

          {details && (
            <div className="flex flex-col gap-6 pb-2">
              <DiagnosticProblemBadges
                problems={getDiagnosticProblems(toProblemInput(details.report))}
              />

              <DiagnosticReportSections details={details} />

              <section className="flex flex-col gap-2">
                <h4 className="text-sm font-medium">Полный текст отчёта</h4>
                <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-md border bg-muted/50 p-3 font-mono text-xs leading-5">
                  {details.report.text}
                </pre>
              </section>
            </div>
          )}
        </div>

        {details && (
          <div className="flex flex-wrap gap-2 border-t pt-4">
            <Button
              variant="secondary"
              onClick={() => void copyToClipboard(details.report.text, 'Отчёт')}
            >
              <ClipboardCopyIcon className="mr-2 h-4 w-4" />
              Скопировать отчёт
            </Button>
            {canDelete && (
              <DeleteDiagnosticReportButton
                id={details.id}
                userName={details.userName}
                onDeleted={onDeleted}
              />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
