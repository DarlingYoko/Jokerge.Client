import { describe, expect, it } from 'vitest';

import { hasPermission } from './hasPermission';

describe('hasPermission', () => {
  it('denies without a profile', () => {
    expect(hasPermission(null, 'diagnostics.delete')).toBe(false);
  });

  it('lets Admin through like the API does', () => {
    expect(hasPermission({ role: 'Admin', perm: [] }, 'diagnostics.delete')).toBe(true);
    expect(hasPermission({ role: ['Player', 'Admin'] }, 'diagnostics.delete')).toBe(true);
  });

  it('matches the permission name case-insensitively', () => {
    expect(hasPermission({ role: 'Mod', perm: ['Diagnostics.Delete'] }, 'diagnostics.delete')).toBe(
      true,
    );
  });

  it('accepts a single-permission claim serialized as a string', () => {
    expect(hasPermission({ role: 'Mod', perm: 'diagnostics.view' }, 'diagnostics.view')).toBe(true);
  });

  it('denies when the permission is missing', () => {
    expect(hasPermission({ role: 'Mod', perm: ['diagnostics.view'] }, 'diagnostics.delete')).toBe(
      false,
    );
    expect(hasPermission({ role: 'Mod' }, 'diagnostics.view')).toBe(false);
  });
});
