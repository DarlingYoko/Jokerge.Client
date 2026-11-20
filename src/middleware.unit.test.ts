import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { middleware } from './middleware';

// After a long idle the access token has expired. Next prefetches the sidebar links, and the
// middleware answered each prefetch with a redirect to sign-in. The router cached those
// redirects and replayed them on every click, even after a new sign-in, so the panel kept
// bouncing to the login screen until the page was reloaded.

const ORIGIN = 'https://panel.test';

function jwt(expSeconds: number): string {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ exp: expSeconds })}.signature`;
}

const now = () => Math.floor(Date.now() / 1000);

function request(
  path: string,
  { cookies = {}, prefetch = false, forwardedFor }: {
    cookies?: Record<string, string>;
    prefetch?: boolean;
    forwardedFor?: string;
  } = {},
): NextRequest {
  const headers = new Headers();
  const cookie = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
  if (cookie) headers.set('cookie', cookie);
  if (prefetch) headers.set('next-router-prefetch', '1');
  if (forwardedFor) headers.set('x-forwarded-for', forwardedFor);
  return new NextRequest(new URL(path, ORIGIN), { headers });
}

function refreshReplies(ok: boolean, accessToken = jwt(now() + 900)) {
  const fetchMock = vi.fn(async (_url: URL | RequestInfo, _init?: RequestInit) =>
    ok
      ? new Response(JSON.stringify({ data: { accessToken } }), {
          status: 200,
          headers: { 'set-cookie': 'refreshToken=rotated; Path=/; HttpOnly' },
        })
      : new Response(null, { status: 401 }),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const isRedirectToSignIn = (response: Response) =>
  response.status === 307 && response.headers.get('location') === `${ORIGIN}/auth/signin`;

describe('middleware', () => {
  beforeEach(() => vi.unstubAllGlobals());
  afterEach(() => vi.unstubAllGlobals());

  it('does not answer a prefetch of a protected page with a redirect when the session expired', async () => {
    const fetchMock = refreshReplies(false);

    const response = await middleware(
      request('/dashboard/profiles', { cookies: { refreshToken: 'r' }, prefetch: true }),
    );

    expect(isRedirectToSignIn(response)).toBe(false);
    expect(response.status).toBe(204);
    expect(response.headers.get('set-cookie')).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not answer a prefetch of the sign-in page with a redirect', async () => {
    refreshReplies(true);

    const response = await middleware(request('/auth/signin', { cookies: { accessToken: jwt(now() + 900) }, prefetch: true }));

    expect(response.status).toBe(204);
  });

  it('lets a prefetch of a protected page through while the session is valid', async () => {
    const response = await middleware(
      request('/dashboard/profiles', { cookies: { accessToken: jwt(now() + 900) }, prefetch: true }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('x-middleware-next')).toBe('1');
  });

  it('refreshes the session on a real navigation and forwards the player IP to the API', async () => {
    const fetchMock = refreshReplies(true);

    const response = await middleware(
      request('/dashboard/profiles', { cookies: { refreshToken: 'r' }, forwardedFor: '203.0.113.7' }),
    );

    expect(response.headers.get('x-middleware-next')).toBe('1');
    expect(response.headers.get('set-cookie')).toContain('refreshToken=rotated');
    const init = fetchMock.mock.calls[0]?.[1];
    expect(new Headers(init?.headers).get('x-forwarded-for')).toBe('203.0.113.7');
  });

  it('sends a real navigation to sign-in when the refresh fails', async () => {
    refreshReplies(false);

    const response = await middleware(request('/dashboard/profiles', { cookies: { refreshToken: 'r' } }));

    expect(isRedirectToSignIn(response)).toBe(true);
  });

  it.each(['/dashboard', '/dashboard/news', '/dashboard/metrics', '/dashboard/profile/vanilla'])(
    'protects %s',
    async (path) => {
      const response = await middleware(request(path));

      expect(isRedirectToSignIn(response)).toBe(true);
    },
  );
});
