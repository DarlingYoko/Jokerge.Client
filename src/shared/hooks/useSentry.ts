import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { sentryService } from '@/shared/services/SentryService';
import { isAxiosError } from '@/shared/lib/isAxiosError/isAxiosError';
import { ProjectTypeEnum } from '@/shared/enums';
import {
  getViewerTzOffset,
  resolveSentryPeriod,
  SentryCustomRange,
  SentryPeriod,
} from '@/shared/lib/sentry/period';

const REFRESH_MS = 60_000;

export const sentryKeys = {
  all: ['sentry'] as const,
  stats: () => [...sentryKeys.all, 'stats'] as const,
  summary: () => [...sentryKeys.all, 'summary'] as const,
  issues: (
    period: SentryPeriod,
    custom: SentryCustomRange | undefined,
    projectType: ProjectTypeEnum,
  ) =>
    [
      ...sentryKeys.all,
      'issues',
      period,
      period === SentryPeriod.Custom ? custom?.from?.getTime() ?? null : null,
      period === SentryPeriod.Custom ? custom?.to?.getTime() ?? null : null,
      projectType,
    ] as const,
};

export const useSentryStats = () => {
  return useQuery({
    queryKey: sentryKeys.stats(),
    queryFn: () => sentryService.getStats(getViewerTzOffset()),
    select: (data) => data.data,
    refetchInterval: REFRESH_MS,
  });
};

export const useSentrySummary = () => {
  return useQuery({
    queryKey: sentryKeys.summary(),
    queryFn: () => sentryService.getSummary(getViewerTzOffset()),
    select: (data) => data.data,
    refetchInterval: REFRESH_MS,
  });
};

type UseSentryIssuesParams = {
  period: SentryPeriod;
  custom?: SentryCustomRange;
  projectType: ProjectTypeEnum;
};

/**
 * A query, not a mutation: results are cached per filter, a slow response can't overwrite a newer
 * one, and a custom period with no day picked yet doesn't keep showing the previous filter's rows.
 */
export const useSentryIssues = ({ period, custom, projectType }: UseSentryIssuesParams) => {
  const ready = resolveSentryPeriod(period, custom, new Date()) !== null;

  return useQuery({
    queryKey: sentryKeys.issues(period, custom, projectType),
    queryFn: () => {
      const range = resolveSentryPeriod(period, custom, new Date());
      if (!range) throw new Error('Период не выбран');
      return sentryService.getIssues({ ...range, projectType, tzOffset: getViewerTzOffset() });
    },
    select: (data) => data.data,
    enabled: ready,
    placeholderData: keepPreviousData,
    refetchInterval: REFRESH_MS,
  });
};

export const useResolveSentryIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fingerprint: string) => sentryService.resolveIssue({ fingerprint }),
    onSuccess: async (data) => {
      toast.success('Проблема отмечена решённой', { description: data.message });
      await queryClient.invalidateQueries({ queryKey: sentryKeys.all });
    },
    onError: (error) => {
      isAxiosError({ toast, error });
    },
  });
};

export const useClearSentryErrors = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => sentryService.clearAll(),
    onSuccess: async (data) => {
      toast.success('Готово', { description: data.message });
      await queryClient.invalidateQueries({ queryKey: sentryKeys.all });
    },
    onError: (error) => {
      isAxiosError({ toast, error });
    },
  });
};
