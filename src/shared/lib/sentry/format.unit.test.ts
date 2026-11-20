import { describe, expect, it } from 'vitest';

import {
  describeChange,
  formatBucketLabel,
  formatBytes,
  parseViewerDate,
  shortExceptionName,
} from './format';

describe('shortExceptionName', () => {
  it('drops the namespace', () => {
    expect(shortExceptionName('System.Net.Http.HttpRequestException')).toBe('HttpRequestException');
    expect(shortExceptionName('Plain')).toBe('Plain');
  });
});

describe('parseViewerDate', () => {
  it('reads date-only labels as local midnight, not UTC', () => {
    const date = parseViewerDate('2026-11-20');

    expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()]).toEqual([
      2026, 10, 20, 0,
    ]);
  });

  it('reads hour labels as local wall clock', () => {
    expect(parseViewerDate('2026-11-20T15:00').getHours()).toBe(15);
  });
});

describe('formatBucketLabel', () => {
  it('formats in Russian', () => {
    expect(formatBucketLabel('2026-11-20', 'day')).toBe('20 нояб.');
    expect(formatBucketLabel('2026-11-20T15:00', 'hour')).toBe('20 нояб., 15:00');
    expect(formatBucketLabel('2026-11-16', 'week')).toBe('неделя с 16 нояб.');
  });
});

describe('describeChange', () => {
  it('explains the comparison instead of a bare percentage', () => {
    expect(describeChange(0, 0, 'вчера')).toBe('вчера тоже 0');
    expect(describeChange(5, 0, 'вчера')).toBe('вчера: 0');
    expect(describeChange(15, 10, 'вчера')).toBe('+50% (вчера: 10)');
    expect(describeChange(0, 4, 'прошлые 7 дней')).toBe('−100% (прошлые 7 дней: 4)');
  });
});

describe('formatBytes', () => {
  it('uses binary units', () => {
    expect(formatBytes(0)).toBe('0 Б');
    expect(formatBytes(1536)).toBe('1.5 КБ');
    expect(formatBytes(8 * 1024 ** 3)).toBe('8 ГБ');
  });
});
