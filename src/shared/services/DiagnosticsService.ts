import { $api } from '@/services/api.service';
import {
  TDeleteDiagnosticReportResponse,
  TGetDiagnosticReportResponse,
  TGetDiagnosticReportsRequest,
  TGetDiagnosticReportsResponse,
} from '@/shared/api/contracts/diagnostics/requests';

class DiagnosticsService {
  private BASE_URL = '/diagnostics';

  async getReports({
    userName,
    ...params
  }: TGetDiagnosticReportsRequest): Promise<TGetDiagnosticReportsResponse> {
    const name = userName?.trim();
    const { data } = await $api.get<TGetDiagnosticReportsResponse>(this.BASE_URL, {
      params: name ? { ...params, userName: name } : params,
    });
    return data;
  }

  async getReport(id: string): Promise<TGetDiagnosticReportResponse> {
    const { data } = await $api.get<TGetDiagnosticReportResponse>(
      `${this.BASE_URL}/${encodeURIComponent(id)}`,
    );
    return data;
  }

  async deleteReport(id: string): Promise<TDeleteDiagnosticReportResponse> {
    const { data } = await $api.delete<TDeleteDiagnosticReportResponse>(
      `${this.BASE_URL}/${encodeURIComponent(id)}`,
    );
    return data;
  }
}

export const diagnosticsService = new DiagnosticsService();
