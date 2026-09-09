import Cookies from 'js-cookie';

import { ApiUserBaseEntity, UserBaseEntity } from '@/shared/api/contracts';

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

// accessToken is now an httpOnly cookie set exclusively by the Api (see AuthHandler) and by
// this app's own middleware.ts (server-side refresh) — this getter is kept only because
// GmlContextInitializer still wires it up for legacy plugin scripts; it always returns null
// now, since httpOnly cookies aren't visible to JS by design.
export const getStorageAccessToken = () => Cookies.get('accessToken') || null;

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
