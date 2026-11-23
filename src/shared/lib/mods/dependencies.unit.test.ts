import { describe, expect, it } from 'vitest';

import { dependencyOptions, modKey, requiredBy } from './dependencies';

import { ModBaseEntity, ModDetailsEntity } from '@/shared/api/contracts/mods/schemas';
import { ModType } from '@/shared/enums';

const mod = (name: string): ModBaseEntity => ({
  name,
  description: '',
  iconUrl: '',
  type: ModType.LOCAL,
});

const details = (
  entries: Record<string, { title?: string; dependencies?: string[] }>,
): Record<string, ModDetailsEntity> =>
  Object.fromEntries(
    Object.entries(entries).map(([key, value]) => [
      key,
      { key, title: value.title ?? '', description: '', dependencies: value.dependencies },
    ]),
  );

describe('modKey', () => {
  it('is the jar file name the details are stored under', () => {
    expect(modKey('sodium-optional-mod')).toBe('sodium-optional-mod.jar');
  });
});

describe('dependencyOptions', () => {
  const mods = [mod('a-optional-mod'), mod('b-optional-mod'), mod('c-optional-mod')];

  it('offers the other optional mods, named by their title when there is one', () => {
    const options = dependencyOptions(
      mods,
      details({ 'b-optional-mod.jar': { title: 'Мод B' } }),
      'a-optional-mod.jar',
    );

    expect(options).toEqual([
      { label: 'Мод B', value: 'b-optional-mod.jar' },
      { label: 'c-optional-mod', value: 'c-optional-mod.jar' },
    ]);
  });

  it('leaves out mods that already need this one, directly or through others', () => {
    // c needs b, b needs a: picking b or c for a would make a loop.
    const options = dependencyOptions(
      mods,
      details({
        'b-optional-mod.jar': { dependencies: ['a-optional-mod.jar'] },
        'c-optional-mod.jar': { dependencies: ['b-optional-mod.jar'] },
      }),
      'a-optional-mod.jar',
    );

    expect(options).toEqual([]);
  });

  it('does not hang on a loop saved before the check existed', () => {
    const options = dependencyOptions(
      mods,
      details({
        'b-optional-mod.jar': { dependencies: ['c-optional-mod.jar'] },
        'c-optional-mod.jar': { dependencies: ['b-optional-mod.jar'] },
      }),
      'a-optional-mod.jar',
    );

    expect(options.map((o) => o.value)).toEqual(['b-optional-mod.jar', 'c-optional-mod.jar']);
  });
});

describe('requiredBy', () => {
  it('lists the optional mods of this profile that need the mod directly', () => {
    const mods = [mod('a-optional-mod'), mod('b-optional-mod'), mod('c-optional-mod')];
    const all = details({
      'b-optional-mod.jar': { title: 'Мод B', dependencies: ['a-optional-mod.jar'] },
      'c-optional-mod.jar': { dependencies: ['a-optional-mod.jar'] },
      'gone-optional-mod.jar': { dependencies: ['a-optional-mod.jar'] },
    });

    expect(requiredBy(mods, all, 'a-optional-mod.jar')).toEqual(['Мод B', 'c-optional-mod']);
  });
});
