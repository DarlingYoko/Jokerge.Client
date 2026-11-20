import { describe, expect, it } from 'vitest';

import {
  connectivityLabel,
  describeProfileRam,
  formatLatency,
  formatMegabytes,
  parseUtcDate,
} from './format';

describe('formatMegabytes', () => {
  it('keeps small values in МБ and switches to ГБ from 1024', () => {
    expect(formatMegabytes(0)).toBe('0 МБ');
    expect(formatMegabytes(512)).toBe('512 МБ');
    expect(formatMegabytes(1023)).toBe('1023 МБ');
    expect(formatMegabytes(1024)).toBe('1 ГБ');
    expect(formatMegabytes(6144)).toBe('6 ГБ');
    expect(formatMegabytes(16_000)).toBe('15.6 ГБ');
  });

  it('shows a dash for unknown (negative) values', () => {
    expect(formatMegabytes(-1)).toBe('—');
  });
});

describe('formatLatency', () => {
  it('formats milliseconds and handles a missing value', () => {
    expect(formatLatency(42)).toBe('42 мс');
    expect(formatLatency(0)).toBe('0 мс');
    expect(formatLatency(null)).toBe('—');
  });
});

describe('parseUtcDate', () => {
  it('reads an instant with an explicit zone as is', () => {
    expect(parseUtcDate('2026-11-20T10:00:00Z').toISOString()).toBe('2026-11-20T10:00:00.000Z');
    expect(parseUtcDate('2026-11-20T13:00:00+03:00').toISOString()).toBe(
      '2026-11-20T10:00:00.000Z',
    );
  });

  it('reads a zone-less timestamp as UTC, not as the viewer local time', () => {
    expect(parseUtcDate('2026-11-20T10:00:00').toISOString()).toBe('2026-11-20T10:00:00.000Z');
    expect(parseUtcDate('2026-11-20T10:00:00.1234567').toISOString()).toBe(
      '2026-11-20T10:00:00.123Z',
    );
  });
});

describe('connectivityLabel', () => {
  it('translates known probes and keeps unknown names', () => {
    expect(connectivityLabel('api')).toBe('API');
    expect(connectivityLabel('Files')).toBe('Файловый сервер');
    expect(connectivityLabel('ping')).toBe('Пинг');
    expect(connectivityLabel('textures')).toBe('textures');
  });
});

describe('describeProfileRam', () => {
  const base = { isDynamicRam: false, ramMb: 4096, recommendedRamMb: null };

  it('describes a fixed amount', () => {
    expect(describeProfileRam(base)).toBe('4 ГБ (вручную)');
  });

  it('describes automatic RAM with and without a recommendation', () => {
    expect(describeProfileRam({ ...base, isDynamicRam: true, recommendedRamMb: 6144 })).toBe(
      '4 ГБ (автоматически, рекомендовано 6 ГБ)',
    );
    expect(describeProfileRam({ ...base, isDynamicRam: true })).toBe('4 ГБ (автоматически)');
  });
});
