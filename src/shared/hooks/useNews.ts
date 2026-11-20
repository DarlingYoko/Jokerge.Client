import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { newsService } from '@/shared/services/NewsService';
import { TPanelNewsWriteRequest } from '@/shared/api/contracts/news/schemas';
import { isAxiosError } from '@/shared/lib/isAxiosError/isAxiosError';
import { sortNewsNewestFirst } from '@/shared/lib/news/news';

export const newsKeys = {
  all: ['panel-news'] as const,
};

export const useNewsList = () => {
  return useQuery({
    queryKey: newsKeys.all,
    queryFn: () => newsService.getAll(),
    select: (data) => sortNewsNewestFirst(data.data ?? []),
  });
};

export const useSaveNews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id?: number; body: TPanelNewsWriteRequest }) =>
      id === undefined ? newsService.create(body) : newsService.update(id, body),
    onSuccess: async (data, { id }) => {
      await queryClient.invalidateQueries({ queryKey: newsKeys.all });
      toast.success('Успешно', {
        description: `Новость "${data.data.title}" ${id === undefined ? 'опубликована' : 'обновлена'}`,
      });
    },
    onError: (error) => {
      isAxiosError({ toast, error });
    },
  });
};

export const useDeleteNews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => newsService.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: newsKeys.all });
      toast.success('Успешно', { description: 'Новость удалена' });
    },
    onError: (error) => {
      isAxiosError({ toast, error });
    },
  });
};
