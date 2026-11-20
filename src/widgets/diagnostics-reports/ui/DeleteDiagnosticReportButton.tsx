'use client';

import { Trash2Icon } from 'lucide-react';

import { useDeleteDiagnosticReport } from '@/shared/hooks/useDiagnostics';
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
import { Button, buttonVariants } from '@/shared/ui/button';

type DeleteDiagnosticReportButtonProps = {
  id: string;
  userName: string;
  onDeleted: () => void;
};

export const DeleteDiagnosticReportButton = ({
  id,
  userName,
  onDeleted,
}: DeleteDiagnosticReportButtonProps) => {
  const { mutate, isPending } = useDeleteDiagnosticReport();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" disabled={isPending}>
          <Trash2Icon className="mr-2 h-4 w-4" />
          Удалить
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить отчёт?</AlertDialogTitle>
          <AlertDialogDescription>
            Отчёт игрока {userName} будет удалён без возможности восстановления. Если проблема
            осталась, игрок сможет отправить новый отчёт из лаунчера.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: 'destructive' })}
            onClick={() => mutate(id, { onSuccess: onDeleted })}
          >
            Удалить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
