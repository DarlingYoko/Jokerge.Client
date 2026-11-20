import { ResponseBaseEntity } from '@/shared/api/schemas';
import {
  DiagnosticReportDetails,
  DiagnosticReportsPage,
} from '@/shared/api/contracts/diagnostics/schemas';

export type TGetDiagnosticReportsRequest = {
  take: number;
  offset: number;
  /** Substring of the player's nickname; omitted when empty. */
  userName?: string;
};
export type TGetDiagnosticReportsResponse = ResponseBaseEntity & {
  data: DiagnosticReportsPage;
};

export type TGetDiagnosticReportResponse = ResponseBaseEntity & {
  data: DiagnosticReportDetails;
};

export type TDeleteDiagnosticReportResponse = ResponseBaseEntity;
