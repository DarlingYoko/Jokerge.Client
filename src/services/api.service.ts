import axios, { AxiosError, CreateAxiosDefaults, HttpStatusCode, InternalAxiosRequestConfig } from 'axios';

import { removeStorageProfile, removeStorageRecloudIDAccessToken } from '@/shared/services';
import { authService } from '@/shared/services';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin + '/api/v1';
  }
  // SSR or build time fallback: use relative path so browser will resolve current origin
  return '/api/v1';
};

const OPTIONS: CreateAxiosDefaults = {
  baseURL: getBaseUrl(),
  withCredentials: true,
};

// Both accessToken and refreshToken are httpOnly cookies the browser attaches automatically
// (withCredentials above) — this client never reads or sets the Authorization header itself.
export const $api = axios.create(OPTIONS);

// Single-flight guard so concurrent 401s trigger one refresh call, not one each.
let tokenRefreshPromise: Promise<void> | null = null;

$api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status;
    const originalRequest = axiosError.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (status === HttpStatusCode.Unauthorized && originalRequest && !originalRequest._retry) {
      // Avoid infinite loop
      originalRequest._retry = true;

      const url = (originalRequest.url || '').toString();
      const isAuthEndpoint = url.endsWith('/users/refresh') || url.endsWith('/users/signin') || url.endsWith('/users/signup');
      try {
        if (!isAuthEndpoint) {
          // Attempt refresh (single-flight guarded) — the server rotates the accessToken/
          // refreshToken cookies on success, so simply retrying picks up the new session.
          if (!tokenRefreshPromise) {
            tokenRefreshPromise = authService
              .refresh()
              .then(() => {})
              .finally(() => {
                tokenRefreshPromise = null;
              });
          }
          await tokenRefreshPromise;

          return $api.request(originalRequest);
        }
      } catch (_) {
        // Refresh failed → clear auth and propagate 401
        removeStorageProfile();
        removeStorageRecloudIDAccessToken();
      }
    }

    return Promise.reject(error);
  }
);
