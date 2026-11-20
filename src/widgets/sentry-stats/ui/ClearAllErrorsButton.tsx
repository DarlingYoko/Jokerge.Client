'use client';

import { Trash2 } from 'lucide-react';

import { useClearSentryErrors } from '@/shared/hooks';
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
import { Button } from '@/shared/ui/button';

/** The old "mark all solved" button silently deleted everything; say what it really does. */
export const ClearAllErrorsButton = ({ total }: { total: number | undefined }) => {
  const { mutate, isPending } = useClearSentryErrors();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="w-fit text-red-500 hover:text-red-500"
          disabled={isPending || total === 0}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Удалить все ошибки
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить все ошибки?</AlertDialogTitle>
          <AlertDialogDescription>
            {total !== undefined && `Будут удалены все ${total.toLocaleString('ru-RU')} отчётов. `}
            История и графики очистятся, восстановить их нельзя. Чтобы убрать одну исправленную
            проблему, откройте её во вкладке «Проблемы» и нажмите «Отметить решённой».
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction onClick={() => mutate()}>Удалить всё</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
