import { describe, expect, it } from 'vitest';

import { filterPlayersByName, markWhitelisted } from './whitelist';

const p = (name: string, uuid = name) => ({ name, uuid });

describe('markWhitelisted', () => {
  it('flags players already in the profile whitelist', () => {
    const result = markWhitelisted([p('a'), p('b')], [p('b')]);

    expect(result.map((r) => [r.player.name, r.inWhitelist])).toEqual([
      ['a', false],
      ['b', true],
    ]);
  });
});

describe('filterPlayersByName', () => {
  it('filters case-insensitively and sorts by name', () => {
    const players = [p('Zed'), p('alex'), p('Bob'), p('alexey')];

    expect(filterPlayersByName(players, '').map((x) => x.name)).toEqual([
      'alex',
      'alexey',
      'Bob',
      'Zed',
    ]);
    expect(filterPlayersByName(players, 'ALE').map((x) => x.name)).toEqual(['alex', 'alexey']);
  });
});
