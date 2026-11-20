import { NextRequest, NextResponse } from 'next/server';

import { AUTH_PAGES, DASHBOARD_PAGES } from '@/shared/routes';
import { getTokenExpiredTime, isTokenExpired } from '@/shared/lib/utils';

// Bounds the server-side refresh call so a slow/unreachable API doesn't stall every protected
// page navigation for the whole fetch timeout — fail fast to sign-in instead.
const REFRESH_FETCH_TIMEOUT_MS = 5000;

// Mirrors AuthHandler.BuildAccessCookieOptions on the Api side — this middleware runs its own
// server-side refresh (see attemptRefresh below) and must set the resulting cookie with the
// same HttpOnly/Secure/SameSite attributes the Api itself uses, or a middleware-triggered
// refresh would silently strip HttpOnly off the cookie until the next Api-driven refresh.
function accessTokenCookieOptions(newToken: string, isHttps: boolean) {
  const expSeconds = getTokenExpiredTime(newToken);
  const sameSite: 'none' | 'lax' = isHttps ? 'none' : 'lax';
  return {
    path: '/' as const,
    httpOnly: true as const,
    secure: isHttps,
    sameSite,
    ...(expSeconds ? { expires: new Date(expSeconds * 1000) } : {}),
  };
}

// Every page under /dashboard needs a session; a fixed list went stale as pages were added.
const isDashboardPath = (pathname: string): boolean =>
  pathname === DASHBOARD_PAGES.HOME || pathname.startsWith(`${DASHBOARD_PAGES.HOME}/`);
const publicRoutes = ['/', AUTH_PAGES.HOME, AUTH_PAGES.SIGN_IN];

interface RefreshResult {
  accessToken: string;
  // The backend rotates the refresh token on every successful call (old one revoked, new one
  // issued). This is a plain server-to-server fetch, so the browser never sees that Set-Cookie
  // on its own — it has to be forwarded manually onto the response we hand back, or the browser
  // keeps sending the now-revoked refresh token on its next refresh and gets bounced to sign-in
  // even though the session was never actually lost (this is the "long AFK, then blinks back to
  // login" symptom: the very first silent refresh works, but every one after it fails).
  setCookies: string[];
}

async function attemptRefresh(request: NextRequest): Promise<RefreshResult | null> {
  try {
    // Call backend refresh using existing HttpOnly cookies
    const refreshUrl = new URL('/api/v1/users/refresh', request.url);
    const res = await fetch(refreshUrl, {
      method: 'GET',
      headers: refreshHeaders(request),
      signal: AbortSignal.timeout(REFRESH_FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const json: any = await res.json();
    const token = json?.data?.accessToken ?? json?.accessToken;
    if (typeof token !== 'string' || token.length === 0) return null;

    const setCookies =
      typeof (res.headers as any).getSetCookie === 'function'
        ? (res.headers as any).getSetCookie()
        : res.headers.get('set-cookie')
          ? [res.headers.get('set-cookie')!]
          : [];

    return { accessToken: token, setCookies };
  } catch {
    return null;
  }
}

// This fetch comes from the Next server, so without the player's address the API rate-limits
// every panel user's refresh as one client (the API trusts X-Forwarded-For from private networks).
function refreshHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = { cookie: request.headers.get('cookie') ?? '' };
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) headers['x-forwarded-for'] = forwardedFor;
  return headers;
}

function safeIsExpired(token?: string | null): boolean {
  try {
    return isTokenExpired(token || undefined);
  } catch {
    // If token is malformed treat as expired
    return true;
  }
}

export async function middleware(request: NextRequest) {
  const {
    cookies,
    nextUrl: { pathname },
  } = request;

  const isProtectedRoute = isDashboardPath(pathname);
  const isPublicRoute = publicRoutes.includes(pathname);
  const isHttps = request.nextUrl.protocol === 'https:';

  const accessToken = cookies.get('accessToken')?.value;
  const hasRefresh = Boolean(cookies.get('refreshToken'));

  // The router caches a prefetch's redirect and replays it on click, even after the session is
  // restored, so an idle panel kept bouncing to sign-in until a reload. Wherever auth would
  // redirect or refresh, a prefetch gets an empty answer instead: the click then becomes a
  // full navigation and this middleware decides with the cookies of that moment.
  if (request.headers.has('next-router-prefetch')) {
    const needsAuthDecision = isPublicRoute || (isProtectedRoute && safeIsExpired(accessToken));
    return needsAuthDecision ? new NextResponse(null, { status: 204 }) : NextResponse.next();
  }

  // 1) Protected routes: try server-side refresh before redirecting to sign-in
  if (isProtectedRoute && safeIsExpired(accessToken)) {
    const refreshed = hasRefresh ? await attemptRefresh(request) : null;
    if (refreshed) {
      const response = NextResponse.next();
      response.cookies.set(
        'accessToken',
        refreshed.accessToken,
        accessTokenCookieOptions(refreshed.accessToken, isHttps),
      );
      for (const cookie of refreshed.setCookies) response.headers.append('set-cookie', cookie);
      return response;
    }

    // No refresh possible → clean and redirect to sign-in
    const redirect = NextResponse.redirect(new URL(AUTH_PAGES.SIGN_IN, request.nextUrl));
    redirect.cookies.delete('accessToken');
    return redirect;
  }

  // 2) Public routes (auth pages): if we can refresh, redirect into app
  if (isPublicRoute && safeIsExpired(accessToken)) {
    const refreshed = hasRefresh ? await attemptRefresh(request) : null;
    if (refreshed) {
      const redirect = NextResponse.redirect(new URL(DASHBOARD_PAGES.HOME, request.nextUrl));
      redirect.cookies.set(
        'accessToken',
        refreshed.accessToken,
        accessTokenCookieOptions(refreshed.accessToken, isHttps),
      );
      for (const cookie of refreshed.setCookies) redirect.headers.append('set-cookie', cookie);
      return redirect;
    }
  }

  // 3) If already authenticated, keep users away from auth pages
  if (isPublicRoute && !safeIsExpired(accessToken) && !pathname.startsWith(DASHBOARD_PAGES.HOME)) {
    return NextResponse.redirect(new URL(DASHBOARD_PAGES.HOME, request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
