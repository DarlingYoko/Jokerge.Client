import Cookies from 'js-cookie';

import { ApiUserBaseEntity, UserBaseEntity } from '@/shared/api/contracts';
import { getTokenExpiredTime } from '@/shared/lib/utils';

export const getStorageProfile = () => {
  const profile = Cookies.get('profile');

  return profile ? (JSON.parse(profile) as UserBaseEntity) : null;
};

export const setStorageProfile = (apiProfile: ApiUserBaseEntity) => {
  const profile: UserBaseEntity = {
    name: apiProfile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
    email: apiProfile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
    role: apiProfile['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
    exp: apiProfile.exp,
    perm: apiProfile.perm,
  };

  Cookies.set('profile', JSON.stringify(profile), {
    path: '/',
    sameSite: 'lax',
    expires: 1,
  });
};

export const removeStorageProfile = () => Cookies.remove('profile');

export const getStorageAccessToken = () => Cookies.get('accessToken') || null;

export const setStorageAccessToken = (token: string) => {
  // Match the cookie's lifetime to the JWT's actual exp claim (~15 min) instead of a flat 1 day,
  // so an already-expired access token doesn't keep sitting in storage for hours afterward.
  const expSeconds = getTokenExpiredTime(token);
  const expires = expSeconds ? new Date(expSeconds * 1000) : 1;

  Cookies.set('accessToken', token, {
    path: '/',
    sameSite: 'lax',
    expires,
  });
};

export const removeStorageTokens = () => Cookies.remove('accessToken');

// RecloudID specific token storage
export const getStorageRecloudIDAccessToken = () => Cookies.get('recloudIDAccessToken') || null;
export const setStorageRecloudIDAccessToken = (token: string) => {
  Cookies.set('recloudIDAccessToken', token, {
    path: '/',
    sameSite: 'lax',
    expires: 1,
  });
};

export const removeStorageRecloudIDAccessToken = () => Cookies.remove('recloudIDAccessToken');
