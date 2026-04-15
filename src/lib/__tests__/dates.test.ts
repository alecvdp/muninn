import { describe, it, expect, vi, afterEach } from 'vitest';
import { isWithin30Days, nextRenewalDate } from '../dates';

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

  it('accepts a Date object', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-13'));
    expect(isWithin30Days(new Date('2026-04-20'))).toBe(true);
  });
});

describe('nextRenewalDate', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null when no renewal info', () => {
    expect(nextRenewalDate({ billing_cycle: 'monthly', bill_day: null, renewal_date: null })).toBeNull();
  });

  it('returns renewal_date for annual billing', () => {
    const result = nextRenewalDate({ billing_cycle: 'annual', bill_day: null, renewal_date: '2027-03-15' });
    expect(result).toEqual(new Date('2027-03-15'));
  });

  it('returns this month for monthly if bill day has not passed', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-10'));
    const result = nextRenewalDate({ billing_cycle: 'monthly', bill_day: 17, renewal_date: null });
    expect(result).toEqual(new Date(2026, 3, 17)); // April 17
  });

  it('returns next month for monthly if bill day has passed', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-20'));
    const result = nextRenewalDate({ billing_cycle: 'monthly', bill_day: 17, renewal_date: null });
    expect(result).toEqual(new Date(2026, 4, 17)); // May 17
  });

  it('returns today if bill day is today', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-17'));
    const result = nextRenewalDate({ billing_cycle: 'monthly', bill_day: 17, renewal_date: null });
    expect(result).toEqual(new Date(2026, 3, 17)); // April 17
  });

  it('clamps bill_day 31 to last day of short months', () => {
    vi.useFakeTimers();
    // Feb 15 — bill day 31 should clamp to Feb 28
    vi.setSystemTime(new Date('2026-02-15'));
    const result = nextRenewalDate({ billing_cycle: 'monthly', bill_day: 31, renewal_date: null });
    expect(result).toEqual(new Date(2026, 1, 28)); // Feb 28
  });

  it('returns renewal_date for one-time billing', () => {
    const result = nextRenewalDate({ billing_cycle: 'one-time', bill_day: null, renewal_date: '2026-06-01' });
    expect(result).toEqual(new Date('2026-06-01'));
  });

  it('returns null for monthly with no bill_day', () => {
    expect(nextRenewalDate({ billing_cycle: 'monthly', bill_day: null, renewal_date: null })).toBeNull();
  });
});
