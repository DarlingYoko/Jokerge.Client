'use client';

import { PencilIcon, PlusIcon } from 'lucide-react';

import { NewsFormDialog } from '@/features/news-form-dialog';
import { DeleteNewsDialog } from '@/features/delete-news';
import { useNewsList } from '@/shared/hooks/useNews';
import { newsBindingLabel } from '@/shared/lib/news/news';
import { getFormatDate } from '@/shared/lib/getFormatDate/getFormatDate';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
};

export const NewsList = () => {
  const { data: news, isLoading } = useNewsList();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Новости показываются на главной странице лаунчера, новые сверху.
        </p>
        <NewsFormDialog
          trigger={
            <Button className="w-fit gap-2">
              <PlusIcon size={16} />
              Добавить новость
            </Button>
          }
        />
      </div>

      {isLoading && <Skeleton className="h-32 w-full" />}

      {!isLoading && !news?.length && (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Новостей пока нет. Добавьте первую — игроки увидят её в лаунчере.
          </CardContent>
        </Card>
      )}

      {news?.map((item) => {
        const binding = newsBindingLabel(item);

        return (
          <Card key={item.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
              <div className="flex flex-col gap-1.5">
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-2">
                  {getFormatDate(item.date, DATE_FORMAT)}
                  {binding && <Badge variant="secondary">{binding}</Badge>}
                </CardDescription>
              </div>
              <div className="flex shrink-0 gap-1">
                <NewsFormDialog
                  news={item}
                  trigger={
                    <Button variant="ghost" size="icon">
                      <PencilIcon className="h-4 w-4" />
                      <span className="sr-only">Редактировать новость</span>
                    </Button>
                  }
                />
                <DeleteNewsDialog news={item} />
              </div>
            </CardHeader>
            {item.content && (
              <CardContent>
                <p className="line-clamp-6 whitespace-pre-wrap break-words text-sm text-muted-foreground">
                  {item.content}
                </p>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};
