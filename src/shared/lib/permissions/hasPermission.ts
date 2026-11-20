/**
 * Claims as they land in the `profile` cookie. A JWT claim with a single value is serialized as
 * a string rather than an array, so both shapes are accepted.
 */
export type PermissionClaims = {
  role?: string | string[] | null;
  perm?: string | string[] | null;
};

const toArray = (value: string | string[] | null | undefined): string[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

/**
 * Mirrors the API's PermissionAuthorizationHandler (Admin bypass, case-insensitive name). Only
 * for hiding controls — the API still enforces the permission.
 */
export const hasPermission = (claims: PermissionClaims | null, permission: string): boolean => {
  if (!claims) return false;
  if (toArray(claims.role).includes('Admin')) return true;

  const wanted = permission.toLowerCase();
  return toArray(claims.perm).some((name) => name.toLowerCase() === wanted);
};
