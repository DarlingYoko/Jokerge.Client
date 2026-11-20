'use client';

import { Trash2Icon } from 'lucide-react';

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
import { useDeleteNews } from '@/shared/hooks/useNews';
import { PanelNewsEntity } from '@/shared/api/contracts/news/schemas';

type DeleteNewsDialogProps = {
  news: Pick<PanelNewsEntity, 'id' | 'title'>;
};

export const DeleteNewsDialog = ({ news }: DeleteNewsDialogProps) => {
  const { mutateAsync, isPending } = useDeleteNews();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2Icon className="h-4 w-4" />
          <span className="sr-only">Удалить новость</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удаление новости</AlertDialogTitle>
          <AlertDialogDescription>
            {`Удалить новость "${news.title}"? Она пропадёт из лаунчера у всех игроков.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Отмена</AlertDialogCancel>
          <AlertDialogAction disabled={isPending} onClick={() => mutateAsync(news.id)}>
            Удалить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
