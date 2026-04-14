import { describe, it, expect, vi, afterEach } from 'vitest';
import { isWithin30Days } from '../dates';

describe('isWithin30Days', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns false for null', () => {
    expect(isWithin30Days(null)).toBe(false);
  });

  it('returns true for today', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-13'));
    expect(isWithin30Days('2026-04-13')).toBe(true);
  });

  it('returns true for a date 15 days from now', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-13'));
    expect(isWithin30Days('2026-04-28')).toBe(true);
  });

  it('returns true for a date exactly 30 days from now', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-13'));
    expect(isWithin30Days('2026-05-13')).toBe(true);
  });

  it('returns false for a date 31 days from now', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-13'));
    expect(isWithin30Days('2026-05-14')).toBe(false);
  });

  it('returns false for a date in the past', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-13'));
    expect(isWithin30Days('2026-04-12')).toBe(false);
  });

  it('returns true for tomorrow', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-13'));
    expect(isWithin30Days('2026-04-14')).toBe(true);
  });
});
