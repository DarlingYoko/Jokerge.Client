import { describe, expect, it } from 'vitest';

import {
  PING_THRESHOLDS,
  formatPing,
  formatServerAddress,
  getOnlinePercent,
  getPingColorClass,
  getPingLevel,
} from './status';

describe('getPingLevel', () => {
  it('splits online pings by the thresholds', () => {
    expect(getPingLevel(true, 0)).toBe('good');
    expect(getPingLevel(true, PING_THRESHOLDS.good - 1)).toBe('good');
    expect(getPingLevel(true, PING_THRESHOLDS.good)).toBe('fair');
    expect(getPingLevel(true, PING_THRESHOLDS.fair - 1)).toBe('fair');
    expect(getPingLevel(true, PING_THRESHOLDS.fair)).toBe('poor');
    expect(getPingLevel(true, 900)).toBe('poor');
  });

  it('is unknown when the server is offline, whatever the stale ping says', () => {
    expect(getPingLevel(false, 20)).toBe('unknown');
    expect(getPingLevel(false, null)).toBe('unknown');
  });

  it('is unknown when the ping was not measured', () => {
    expect(getPingLevel(true, null)).toBe('unknown');
    expect(getPingLevel(true, Number.NaN)).toBe('unknown');
    expect(getPingLevel(true, -1)).toBe('unknown');
  });
});

describe('getPingColorClass', () => {
  it('maps every level to a distinct text colour', () => {
    const classes = (['good', 'fair', 'poor', 'unknown'] as const).map(getPingColorClass);

    expect(new Set(classes).size).toBe(4);
    expect(getPingColorClass('good')).toContain('green');
    expect(getPingColorClass('fair')).toContain('yellow');
    expect(getPingColorClass('poor')).toContain('red');
    expect(getPingColorClass('unknown')).toContain('gray');
  });
});

describe('formatPing', () => {
  it('renders rounded milliseconds', () => {
    expect(formatPing(true, 42)).toBe('42 мс');
    expect(formatPing(true, 41.6)).toBe('42 мс');
    expect(formatPing(true, 0)).toBe('0 мс');
  });

  it('renders a dash when there is nothing to show', () => {
    expect(formatPing(false, 42)).toBe('—');
    expect(formatPing(true, null)).toBe('—');
    expect(formatPing(true, Number.NaN)).toBe('—');
  });
});

describe('formatServerAddress', () => {
  it('joins host and port', () => {
    expect(formatServerAddress('fra.jokerge.com', 25565)).toBe('fra.jokerge.com:25565');
  });

  it('brackets bare IPv6 hosts', () => {
    expect(formatServerAddress('2001:db8::1', 25565)).toBe('[2001:db8::1]:25565');
    expect(formatServerAddress('[2001:db8::1]', 25565)).toBe('[2001:db8::1]:25565');
  });

  it('omits a missing port and trims the host', () => {
    expect(formatServerAddress('  play.jokerge.com ', 0)).toBe('play.jokerge.com');
    expect(formatServerAddress('play.jokerge.com', Number.NaN)).toBe('play.jokerge.com');
  });
});

describe('getOnlinePercent', () => {
  it('returns the share of occupied slots', () => {
    expect(getOnlinePercent(5, 20)).toBe(25);
    expect(getOnlinePercent(20, 20)).toBe(100);
  });

  it('never returns NaN or Infinity for unknown capacity', () => {
    expect(getOnlinePercent(5, 0)).toBe(0);
    expect(getOnlinePercent(5, null)).toBe(0);
    expect(getOnlinePercent(null, 20)).toBe(0);
    expect(getOnlinePercent(null, null)).toBe(0);
  });

  it('clamps to 0..100', () => {
    expect(getOnlinePercent(30, 20)).toBe(100);
    expect(getOnlinePercent(-3, 20)).toBe(0);
  });
});
