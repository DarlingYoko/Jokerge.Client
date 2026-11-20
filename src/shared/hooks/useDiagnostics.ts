import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { TGetDiagnosticReportsRequest } from '@/shared/api/contracts/diagnostics/requests';
import { isAxiosError } from '@/shared/lib/isAxiosError/isAxiosError';
import { diagnosticsService } from '@/shared/services/DiagnosticsService';

export const diagnosticsKeys = {
  all: ['diagnostics'] as const,
  lists: () => [...diagnosticsKeys.all, 'list'] as const,
  list: (params: TGetDiagnosticReportsRequest) => [...diagnosticsKeys.lists(), params] as const,
  details: (id: string) => [...diagnosticsKeys.all, 'details', id] as const,
};

/** One page; the previous page stays on screen while the next one loads. */
export const useDiagnosticReports = (params: TGetDiagnosticReportsRequest) => {
  return useQuery({
    queryKey: diagnosticsKeys.list(params),
    queryFn: () => diagnosticsService.getReports(params),
    select: (data) => data.data,
    placeholderData: keepPreviousData,
  });
};

export const useDiagnosticReport = (id: string | null) => {
  return useQuery({
    queryKey: diagnosticsKeys.details(id ?? ''),
    queryFn: () => diagnosticsService.getReport(id ?? ''),
    select: (data) => data.data,
    enabled: id !== null,
  });
};

export const useDeleteDiagnosticReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => diagnosticsService.deleteReport(id),
    onSuccess: async (data) => {
      toast.success('Отчёт удалён', { description: data.message });
      await queryClient.invalidateQueries({ queryKey: diagnosticsKeys.lists() });
    },
    onError: (error) => {
      isAxiosError({ toast, error });
    },
  });
};
