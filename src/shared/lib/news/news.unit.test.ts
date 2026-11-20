import { describe, expect, it } from 'vitest';

import {
  NO_PROFILE,
  fromDateTimeLocal,
  newsBindingLabel,
  sortNewsNewestFirst,
  toDateTimeLocal,
  toNewsFormValues,
  toNewsRequest,
} from './news';

const news = (
  id: number,
  date: string,
  extra: Partial<Parameters<typeof newsBindingLabel>[0]> = {},
) => ({
  id,
  title: `n${id}`,
  content: 'text',
  profileName: null,
  buildVersion: null,
  date,
  ...extra,
});

describe('datetime-local conversion', () => {
  it('round-trips a moment through the input value', () => {
    const moment = new Date('2026-11-20T09:45:00.000Z');

    expect(fromDateTimeLocal(toDateTimeLocal(moment))).toBe(moment.toISOString());
  });

  it('formats as yyyy-MM-ddTHH:mm', () => {
    expect(toDateTimeLocal(new Date(2026, 0, 5, 7, 3))).toBe('2026-01-05T07:03');
  });

  it('returns null for empty or broken input', () => {
    expect(fromDateTimeLocal('')).toBeNull();
    expect(fromDateTimeLocal('not a date')).toBeNull();
  });
});

describe('toNewsRequest', () => {
  it('trims fields and turns empty bindings into null', () => {
    const request = toNewsRequest({
      title: '  Вайп  ',
      content: '**текст**',
      profileName: NO_PROFILE,
      buildVersion: '   ',
      date: '',
    });

    expect(request).toEqual({
      title: 'Вайп',
      content: '**текст**',
      profileName: null,
      buildVersion: null,
      date: null,
    });
  });

  it('keeps a chosen profile and version', () => {
    const request = toNewsRequest({
      title: 't',
      content: 'c',
      profileName: 'Survival',
      buildVersion: ' 1.2.0 ',
      date: '2026-11-20T12:00',
    });

    expect(request.profileName).toBe('Survival');
    expect(request.buildVersion).toBe('1.2.0');
    expect(request.date).toBe(new Date(2026, 10, 20, 12, 0).toISOString());
  });
});

describe('toNewsFormValues', () => {
  it('starts a new post now with no profile', () => {
    const now = new Date(2026, 10, 20, 8, 30);

    expect(toNewsFormValues(undefined, now)).toEqual({
      title: '',
      content: '',
      profileName: NO_PROFILE,
      buildVersion: '',
      date: '2026-11-20T08:30',
    });
  });

  it('fills the form from an existing post', () => {
    const values = toNewsFormValues(
      news(1, '2026-11-01T10:00:00Z', { profileName: 'Survival', buildVersion: '1.0' }),
    );

    expect(values.profileName).toBe('Survival');
    expect(values.buildVersion).toBe('1.0');
    expect(fromDateTimeLocal(values.date)).toBe('2026-11-01T10:00:00.000Z');
  });
});

describe('newsBindingLabel', () => {
  it('joins profile and version', () => {
    expect(
      newsBindingLabel(news(1, '2026-01-01T00:00:00Z', { profileName: 'S', buildVersion: '2' })),
    ).toBe('Сборка: S · Версия: 2');
  });

  it('is null when the post concerns everyone', () => {
    expect(newsBindingLabel(news(1, '2026-01-01T00:00:00Z'))).toBeNull();
  });
});

describe('sortNewsNewestFirst', () => {
  it('orders by date descending, then by id', () => {
    const sorted = sortNewsNewestFirst([
      news(1, '2026-01-01T00:00:00Z'),
      news(2, '2026-03-01T00:00:00Z'),
      news(3, '2026-03-01T00:00:00Z'),
    ]);

    expect(sorted.map((n) => n.id)).toEqual([3, 2, 1]);
  });
});
