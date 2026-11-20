import { describe, expect, it } from 'vitest';

import {
  describeCoverage,
  formatCpu,
  formatMs,
  formatPercent,
  formatRpm,
  formatUptime,
} from './format';

describe('formatMs', () => {
  it('shows a dash when there is no value', () => {
    expect(formatMs(null)).toBe('—');
    expect(formatMs(undefined)).toBe('—');
  });

  it('keeps milliseconds under a second and switches to seconds above', () => {
    expect(formatMs(0)).toBe('0 мс');
    expect(formatMs(0.4)).toBe('<1 мс');
    expect(formatMs(87.6)).toBe('88 мс');
    expect(formatMs(1250)).toBe('1,25 с');
    expect(formatMs(12_340)).toBe('12,3 с');
  });
});

describe('formatPercent', () => {
  it('formats a 0..1 rate', () => {
    expect(formatPercent(null)).toBe('—');
    expect(formatPercent(0)).toBe('0%');
    expect(formatPercent(0.0004)).toBe('<0,1%');
    expect(formatPercent(0.1534)).toBe('15,3%');
    expect(formatPercent(1)).toBe('100%');
  });
});

describe('formatRpm', () => {
  it('rounds to one decimal, small values stay visible', () => {
    expect(formatRpm(null)).toBe('—');
    expect(formatRpm(0)).toBe('0');
    expect(formatRpm(0.04)).toBe('<0,1');
    expect(formatRpm(12.345)).toBe('12,3');
    // Same digit grouping as the rest of the panel (toLocaleString('ru-RU')).
    expect(formatRpm(12_345)).toMatch(/^12\s345$/);
  });
});

describe('formatCpu', () => {
  it('formats a percentage that is already 0..100', () => {
    expect(formatCpu(null)).toBe('—');
    expect(formatCpu(3.14)).toBe('3,1%');
  });
});

describe('formatUptime', () => {
  it('uses the two largest units', () => {
    expect(formatUptime(20)).toBe('<1 мин');
    expect(formatUptime(7 * 60 + 5)).toBe('7 мин');
    expect(formatUptime(5 * 3600 + 12 * 60)).toBe('5 ч 12 мин');
    expect(formatUptime(3 * 86400 + 4 * 3600 + 59 * 60)).toBe('3 д 4 ч');
  });
});

describe('describeCoverage', () => {
  it('is silent when the whole period is covered', () => {
    expect(describeCoverage(60, 60)).toBeNull();
    // The current minute has no sample for its first few seconds.
    expect(describeCoverage(59, 60)).toBeNull();
  });

  it('says how much of the period has data', () => {
    expect(describeCoverage(37, 60)).toBe(
      'Данные за 37 мин из 1 ч — API запущен недавно или был недоступен',
    );
    expect(describeCoverage(0, 1440)).toBe('Пока нет данных за этот период');
    expect(describeCoverage(150, 360)).toBe(
      'Данные за 2 ч 30 мин из 6 ч — API запущен недавно или был недоступен',
    );
  });
});
