import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { gameServerService } from '@/shared/services/GameServerService';
import {
  TCheckGameServersRequest,
  TDeleteGameServersRequest,
  TGetGameServersRequest,
  TPostGameServersRequest,
  TPutGameServersRequest,
} from '@/shared/api/contracts';
import { isAxiosError } from '@/shared/lib/isAxiosError/isAxiosError';

export const serversKeys = {
  all: ['servers'] as const,
  creating: () => [...serversKeys.all, 'creating'] as const,
  reading: () => [...serversKeys.all, 'reading'] as const,
  editing: () => [...serversKeys.all, 'editing'] as const,
  deleting: () => [...serversKeys.all, 'deleting'] as const,
  deletingAll: () => [...serversKeys.all, 'deletingAll'] as const,
  checking: () => [...serversKeys.all, 'checking'] as const,

  entities: () => [...serversKeys.all, 'entities'] as const,
};

export const useGameServers = (profile: TGetGameServersRequest) => {
  return useQuery({
    queryKey: serversKeys.entities(),
    queryFn: () => gameServerService.getServers(profile),
    select: (data) => data?.data,
  });
};

export const useCreateGameServer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: serversKeys.creating(),
    mutationFn: (data: TPostGameServersRequest) => gameServerService.addServer(data),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: serversKeys.entities(),
      });

      toast.success('Успешно', {
        description: `Сервер "${data.data.name}" успешно добавлен`,
      });
    },
    onError: (error) => {
      isAxiosError({ toast, error });
    },
  });
};

export const useDeleteGameServer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: serversKeys.deleting(),
    mutationFn: (data: TDeleteGameServersRequest) => gameServerService.deleteServer(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: serversKeys.entities(),
      });

      toast.success('Успешно', {
        description: 'Сервер успешно удален',
      });
    },
    onError: (error) => {
      isAxiosError({ toast, error });
    },
  });
};

export const useUpdateGameServer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: serversKeys.editing(),
    mutationFn: (data: TPutGameServersRequest) => gameServerService.updateServer(data),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: serversKeys.entities(),
      });

      toast.success('Успешно', {
        description: `Сервер "${data.data.name}" успешно обновлен`,
      });
    },
    onError: (error) => {
      isAxiosError({ toast, error });
    },
  });
};

export const useCheckGameServers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: serversKeys.checking(),
    mutationFn: (data: TCheckGameServersRequest) => gameServerService.checkServers(data),
    onSuccess: (data) => {
      // The check already returns the fresh list, so put it into the cache instead of refetching.
      queryClient.setQueryData(serversKeys.entities(), data);
    },
    onError: (error) => {
      isAxiosError({ toast, error, customDescription: 'Не удалось проверить серверы' });
    },
  });
};
