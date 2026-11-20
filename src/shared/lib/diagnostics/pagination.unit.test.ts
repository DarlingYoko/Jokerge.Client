import { describe, expect, it } from 'vitest';

import { clampPage, getPageCount } from './pagination';

describe('getPageCount', () => {
  it('rounds up and never returns less than one page', () => {
    expect(getPageCount(0, 20)).toBe(1);
    expect(getPageCount(20, 20)).toBe(1);
    expect(getPageCount(21, 20)).toBe(2);
    expect(getPageCount(40, 20)).toBe(2);
  });
});

describe('clampPage', () => {
  it('keeps a page that exists', () => {
    expect(clampPage(1, 41, 20)).toBe(1);
  });

  it('steps back when the last page emptied out (e.g. after a delete)', () => {
    expect(clampPage(2, 40, 20)).toBe(1);
    expect(clampPage(5, 0, 20)).toBe(0);
  });

  it('never goes below the first page', () => {
    expect(clampPage(-3, 100, 20)).toBe(0);
  });
});
