import { describe, expect, it } from 'vitest';

import { endpointErrorRate, sortEndpoints, splitRoute, topFailing, topSlow } from './endpoints';

import { MetricsEndpoint } from '@/shared/api/contracts/metrics/schemas';

const endpoint = (route: string, patch: Partial<MetricsEndpoint> = {}): MetricsEndpoint => ({
  route,
  requests: 10,
  requestsPerMinute: 1,
  p50Ms: 10,
  p95Ms: 20,
  maxMs: 30,
  clientErrors: 0,
  serverErrors: 0,
  ...patch,
});

describe('splitRoute', () => {
  it('separates the HTTP method from the template', () => {
    expect(splitRoute('GET /api/v1/profiles/{profileName}')).toEqual({
      method: 'GET',
      path: '/api/v1/profiles/{profileName}',
    });
  });

  it('keeps special rows whole', () => {
    expect(splitRoute('(нет маршрута)')).toEqual({ method: null, path: '(нет маршрута)' });
  });
});

describe('endpointErrorRate', () => {
  it('counts 4xx and 5xx together', () => {
    expect(endpointErrorRate(endpoint('GET /a', { clientErrors: 2, serverErrors: 1 }))).toBeCloseTo(
      0.3,
    );
    expect(endpointErrorRate(endpoint('GET /a', { requests: 0 }))).toBe(0);
  });
});

describe('topSlow', () => {
  it('orders by p95 and ignores routes hit only once or twice', () => {
    const list = [
      endpoint('GET /fast', { p95Ms: 10 }),
      endpoint('GET /slow', { p95Ms: 900 }),
      endpoint('GET /rare-but-slow', { p95Ms: 5000, requests: 1 }),
      endpoint('GET /medium', { p95Ms: 200 }),
    ];

    expect(topSlow(list, 2).map((e) => e.route)).toEqual(['GET /slow', 'GET /medium']);
  });

  it('falls back to rare routes when nothing else has traffic', () => {
    const list = [endpoint('GET /rare', { p95Ms: 50, requests: 1 })];

    expect(topSlow(list).map((e) => e.route)).toEqual(['GET /rare']);
  });
});

describe('topFailing', () => {
  it('puts server errors first, then client errors, and skips clean routes', () => {
    const list = [
      endpoint('GET /clean'),
      endpoint('POST /signin', { clientErrors: 40 }),
      endpoint('POST /restore', { serverErrors: 2 }),
      endpoint('GET /broken', { serverErrors: 5, clientErrors: 1 }),
    ];

    expect(topFailing(list).map((e) => e.route)).toEqual([
      'GET /broken',
      'POST /restore',
      'POST /signin',
    ]);
  });
});

describe('sortEndpoints', () => {
  const list = [
    endpoint('GET /b', { requests: 5, p95Ms: 300, serverErrors: 1 }),
    endpoint('GET /a', { requests: 50, p95Ms: null }),
    endpoint('GET /c', { requests: 20, p95Ms: 100, clientErrors: 4 }),
  ];

  it('sorts by traffic, latency, errors or name', () => {
    expect(sortEndpoints(list, 'requests', 'desc').map((e) => e.route)).toEqual([
      'GET /a',
      'GET /c',
      'GET /b',
    ]);
    expect(sortEndpoints(list, 'p95', 'desc').map((e) => e.route)).toEqual([
      'GET /b',
      'GET /c',
      'GET /a',
    ]);
    expect(sortEndpoints(list, 'errors', 'desc').map((e) => e.route)).toEqual([
      'GET /b',
      'GET /c',
      'GET /a',
    ]);
    expect(sortEndpoints(list, 'route', 'asc').map((e) => e.route)).toEqual([
      'GET /a',
      'GET /b',
      'GET /c',
    ]);
  });

  it('does not mutate the input', () => {
    const copy = [...list];
    sortEndpoints(list, 'route', 'desc');
    expect(list).toEqual(copy);
  });
});
