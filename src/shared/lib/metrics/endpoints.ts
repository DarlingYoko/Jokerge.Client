import { MetricsEndpoint } from '@/shared/api/contracts/metrics/schemas';

export type EndpointSortKey = 'requests' | 'p95' | 'errors' | 'route';
export type SortDirection = 'asc' | 'desc';

/** Routes hit only once or twice say little about speed: one cold start dominates their p95. */
const MIN_REQUESTS_FOR_SLOW = 3;

export const splitRoute = (route: string): { method: string | null; path: string } => {
  const match = /^([A-Z]+) (\/.*)$/.exec(route);
  return match ? { method: match[1], path: match[2] } : { method: null, path: route };
};

export const endpointErrorRate = (endpoint: MetricsEndpoint): number =>
  endpoint.requests === 0 ? 0 : (endpoint.clientErrors + endpoint.serverErrors) / endpoint.requests;

export const topSlow = (endpoints: MetricsEndpoint[], limit = 5): MetricsEndpoint[] => {
  const timed = endpoints.filter((e) => e.p95Ms !== null);
  const frequent = timed.filter((e) => e.requests >= MIN_REQUESTS_FOR_SLOW);
  const pool = frequent.length > 0 ? frequent : timed;

  return [...pool].sort((a, b) => (b.p95Ms ?? 0) - (a.p95Ms ?? 0)).slice(0, limit);
};

/** 5xx are our bugs, so they rank above any amount of 4xx (bad passwords, scanners). */
const compareErrors = (a: MetricsEndpoint, b: MetricsEndpoint): number =>
  a.serverErrors - b.serverErrors || a.clientErrors - b.clientErrors;

export const topFailing = (endpoints: MetricsEndpoint[], limit = 5): MetricsEndpoint[] =>
  endpoints
    .filter((e) => e.clientErrors + e.serverErrors > 0)
    .sort((a, b) => compareErrors(b, a) || a.route.localeCompare(b.route))
    .slice(0, limit);

/** Endpoints without a latency go last in both directions. */
export const sortEndpoints = (
  endpoints: MetricsEndpoint[],
  key: EndpointSortKey,
  direction: SortDirection,
): MetricsEndpoint[] => {
  const sign = direction === 'asc' ? 1 : -1;

  const compare = (a: MetricsEndpoint, b: MetricsEndpoint): number => {
    switch (key) {
      case 'requests':
        return sign * (a.requests - b.requests);
      case 'errors':
        return sign * compareErrors(a, b);
      case 'route':
        return sign * a.route.localeCompare(b.route);
      case 'p95':
        if (a.p95Ms === null || b.p95Ms === null) {
          return (a.p95Ms === null ? 1 : 0) - (b.p95Ms === null ? 1 : 0);
        }
        return sign * (a.p95Ms - b.p95Ms);
    }
  };

  return [...endpoints].sort((a, b) => compare(a, b) || a.route.localeCompare(b.route));
};
