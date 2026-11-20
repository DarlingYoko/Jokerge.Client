import { $api } from '@/services/api.service';
import {
  TGetSentryStatsResponse,
  TGetSentrySummaryResponse,
  TPostSentryClearResponse,
  TPostSentryIssuesRequest,
  TPostSentryIssuesResponse,
  TPostSentryResolveIssueRequest,
  TPostSentryResolveIssueResponse,
} from '@/shared/api/contracts/sentry/requests';

class SentryService {
  private BASE_URL = '/sentry';

  async getIssues(data: TPostSentryIssuesRequest): Promise<TPostSentryIssuesResponse> {
    const response = await $api.post<TPostSentryIssuesResponse>(
      `${this.BASE_URL}/filter/list`,
      data,
    );
    return response.data;
  }

  async resolveIssue(
    data: TPostSentryResolveIssueRequest,
  ): Promise<TPostSentryResolveIssueResponse> {
    const response = await $api.post<TPostSentryResolveIssueResponse>(
      `${this.BASE_URL}/issues/resolve`,
      data,
    );
    return response.data;
  }

  async clearAll(): Promise<TPostSentryClearResponse> {
    const response = await $api.post<TPostSentryClearResponse>(`${this.BASE_URL}/clear`);
    return response.data;
  }

  async getStats(tzOffset: number): Promise<TGetSentryStatsResponse> {
    const response = await $api.get<TGetSentryStatsResponse>(`${this.BASE_URL}/stats/last`, {
      params: { tzOffset },
    });
    return response.data;
  }

  async getSummary(tzOffset: number): Promise<TGetSentrySummaryResponse> {
    const response = await $api.get<TGetSentrySummaryResponse>(`${this.BASE_URL}/stats/summary`, {
      params: { tzOffset },
    });
    return response.data;
  }
}

export const sentryService = new SentryService();
