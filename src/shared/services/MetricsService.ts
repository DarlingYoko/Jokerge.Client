import { $api } from '@/services/api.service';
import { TGetMetricsRequest, TGetMetricsResponse } from '@/shared/api/contracts/metrics/requests';

class MetricsService {
  private BASE_URL = '/metrics';

  async getReport({ period }: TGetMetricsRequest): Promise<TGetMetricsResponse> {
    const { data } = await $api.get<TGetMetricsResponse>(this.BASE_URL, { params: { period } });
    return data;
  }
}

export const metricsService = new MetricsService();
