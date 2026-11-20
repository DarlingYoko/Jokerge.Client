/** A row of `GET /diagnostics`: the fields needed for the list and the problem badges. */
export type DiagnosticReportSummary = {
  id: string;
  userName: string;
  /** ISO UTC instant the API received the report. */
  createdAt: string;
  launcherVersion: string;
  osDescription: string;
  architecture: string;
  totalRamMb: number;
  freeRamMb: number;
  /** RAM the player's profile settings give the game. */
  selectedRamMb: number;
  freeDiskBytes: number;
  javaFound: boolean;
  apiReachable: boolean;
  filesReachable: boolean;
  profileName: string | null;
};

/** One connectivity probe the launcher ran; `name` is e.g. 'api', 'files', 'ping'. */
export type DiagnosticConnectivity = {
  name: string;
  target: string;
  reachable: boolean;
  latencyMs: number | null;
  statusCode: number | null;
  error: string | null;
};

export type DiagnosticProfileSettings = {
  name: string | null;
  isDynamicRam: boolean;
  ramMb: number;
  recommendedRamMb: number | null;
  fullScreen: boolean;
  windowWidth: number;
  windowHeight: number;
};

export type DiagnosticReport = {
  launcherVersion: string;
  os: { description: string; architecture: string; type: string };
  memory: { totalMb: number; freeMb: number };
  disk: { gameFolder: string; freeBytes: number; totalBytes: number };
  java: { found: boolean; path: string | null; version: string | null };
  connectivity: DiagnosticConnectivity[];
  profile: DiagnosticProfileSettings;
  logTail: string[];
  /** ISO instant the launcher collected the data (player's clock). */
  collectedAt: string;
  /** The text report exactly as the player sees and copies it in the launcher. */
  text: string;
};

export type DiagnosticReportDetails = {
  id: string;
  userName: string;
  createdAt: string;
  report: DiagnosticReport;
};

export type DiagnosticReportsPage = {
  items: DiagnosticReportSummary[];
  total: number;
};
