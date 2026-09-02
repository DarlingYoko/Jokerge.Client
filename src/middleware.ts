import { NextRequest, NextResponse } from 'next/server';

import { AUTH_PAGES, DASHBOARD_PAGES } from '@/shared/routes';
import { getTokenExpiredTime, isTokenExpired } from '@/shared/lib/utils';

// Bounds the server-side refresh call so a slow/unreachable API doesn't stall every protected
// page navigation for the whole fetch timeout — fail fast to sign-in instead.
const REFRESH_FETCH_TIMEOUT_MS = 5000;

function accessTokenCookieOptions(newToken: string) {
  const expSeconds = getTokenExpiredTime(newToken);
  return {
    path: '/' as const,
    sameSite: 'lax' as const,
    ...(expSeconds ? { expires: new Date(expSeconds * 1000) } : {}),
  };
}

const protectedRoutes = [
  DASHBOARD_PAGES.HOME,
  DASHBOARD_PAGES.ACCOUNT,
  DASHBOARD_PAGES.SETTINGS,
  DASHBOARD_PAGES.SERVERS,
  DASHBOARD_PAGES.INTEGRATIONS,
  DASHBOARD_PAGES.PROFILES,
  DASHBOARD_PAGES.PROFILE,
];
const publicRoutes = ['/', AUTH_PAGES.HOME, AUTH_PAGES.SIGN_IN];

async function attemptRefresh(request: NextRequest): Promise<string | null> {
  try {
    // Call backend refresh using existing HttpOnly cookies
    const refreshUrl = new URL('/api/v1/users/refresh', request.url);
    const res = await fetch(refreshUrl, {
      method: 'GET',
      headers: { cookie: request.headers.get('cookie') ?? '' },
      signal: AbortSignal.timeout(REFRESH_FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const json: any = await res.json();
    const token = json?.data?.accessToken ?? json?.accessToken;
    return typeof token === 'string' && token.length > 0 ? token : null;
  } catch {
    return null;
  }
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

  const isProtectedRoute = protectedRoutes.includes(pathname);
  const isPublicRoute = publicRoutes.includes(pathname);

  const accessToken = cookies.get('accessToken')?.value;
  const hasRefresh = Boolean(cookies.get('refreshToken'));

  // 1) Protected routes: try server-side refresh before redirecting to sign-in
  if (isProtectedRoute && safeIsExpired(accessToken)) {
    const newToken = hasRefresh ? await attemptRefresh(request) : null;
    if (newToken) {
      const response = NextResponse.next();
      response.cookies.set('accessToken', newToken, accessTokenCookieOptions(newToken));
      return response;
    }

    // No refresh possible → clean and redirect to sign-in
    const redirect = NextResponse.redirect(new URL(AUTH_PAGES.SIGN_IN, request.nextUrl));
    redirect.cookies.delete('accessToken');
    return redirect;
  }

  // 2) Public routes (auth pages): if we can refresh, redirect into app
  if (isPublicRoute && safeIsExpired(accessToken)) {
    const newToken = hasRefresh ? await attemptRefresh(request) : null;
    if (newToken) {
      const redirect = NextResponse.redirect(new URL(DASHBOARD_PAGES.HOME, request.nextUrl));
      redirect.cookies.set('accessToken', newToken, accessTokenCookieOptions(newToken));
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
