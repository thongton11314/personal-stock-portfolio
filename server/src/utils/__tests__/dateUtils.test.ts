import { describe, it, expect } from 'vitest';
import {
  isWeekend,
  formatDate,
  parseDate,
  getNextTradingDay,
  getPreviousTradingDay,
  isTradingDay,
  getTradingDaysInRange,
} from '../dateUtils';

describe('isWeekend', () => {
  it('returns true for Saturday', () => {
    expect(isWeekend(new Date('2026-04-18T00:00:00Z'))).toBe(true); // Saturday
  });

  it('returns true for Sunday', () => {
    expect(isWeekend(new Date('2026-04-19T00:00:00Z'))).toBe(true); // Sunday
  });

  it('returns false for Monday', () => {
    expect(isWeekend(new Date('2026-04-13T00:00:00Z'))).toBe(false); // Monday
  });

  it('returns false for Friday', () => {
    expect(isWeekend(new Date('2026-04-17T00:00:00Z'))).toBe(false); // Friday
  });
});

describe('formatDate', () => {
  it('formats date as YYYY-MM-DD', () => {
    expect(formatDate(new Date('2026-04-18T15:30:00Z'))).toBe('2026-04-18');
  });

  it('pads single-digit month and day', () => {
    expect(formatDate(new Date('2026-01-05T00:00:00Z'))).toBe('2026-01-05');
  });
});

describe('parseDate', () => {
  it('parses YYYY-MM-DD to UTC date', () => {
    const date = parseDate('2026-04-18');
    expect(date.getUTCFullYear()).toBe(2026);
    expect(date.getUTCMonth()).toBe(3); // April = 3
    expect(date.getUTCDate()).toBe(18);
  });
});

describe('isTradingDay', () => {
  it('returns true for weekday', () => {
    expect(isTradingDay(new Date('2026-04-13T00:00:00Z'))).toBe(true); // Monday
  });

  it('returns false for weekend', () => {
    expect(isTradingDay(new Date('2026-04-18T00:00:00Z'))).toBe(false); // Saturday
  });
});

describe('getNextTradingDay', () => {
  it('returns same day if already a trading day', () => {
    const monday = new Date('2026-04-13T00:00:00Z');
    const result = getNextTradingDay(monday);
    expect(formatDate(result)).toBe('2026-04-13');
  });

  it('skips Saturday to Monday', () => {
    const saturday = new Date('2026-04-18T00:00:00Z');
    const result = getNextTradingDay(saturday);
    expect(formatDate(result)).toBe('2026-04-20'); // Monday
  });

  it('skips Sunday to Monday', () => {
    const sunday = new Date('2026-04-19T00:00:00Z');
    const result = getNextTradingDay(sunday);
    expect(formatDate(result)).toBe('2026-04-20'); // Monday
  });
});

describe('getPreviousTradingDay', () => {
  it('returns previous Friday from Monday', () => {
    const monday = new Date('2026-04-13T00:00:00Z');
    const result = getPreviousTradingDay(monday);
    expect(formatDate(result)).toBe('2026-04-10'); // Friday
  });

  it('returns Friday from Saturday', () => {
    const saturday = new Date('2026-04-18T00:00:00Z');
    const result = getPreviousTradingDay(saturday);
    expect(formatDate(result)).toBe('2026-04-17'); // Friday
  });

  it('returns Friday from Sunday', () => {
    const sunday = new Date('2026-04-19T00:00:00Z');
    const result = getPreviousTradingDay(sunday);
    expect(formatDate(result)).toBe('2026-04-17'); // Friday
  });

  it('returns Thursday from Friday', () => {
    const friday = new Date('2026-04-17T00:00:00Z');
    const result = getPreviousTradingDay(friday);
    expect(formatDate(result)).toBe('2026-04-16'); // Thursday
  });
});

describe('getTradingDaysInRange', () => {
  it('returns only weekdays in range', () => {
    // Mon Apr 13 to Fri Apr 17, 2026
    const result = getTradingDaysInRange('2026-04-13', '2026-04-17');
    expect(result).toEqual([
      '2026-04-13',
      '2026-04-14',
      '2026-04-15',
      '2026-04-16',
      '2026-04-17',
    ]);
  });

  it('excludes weekends', () => {
    // Thu Apr 16 to Mon Apr 20, 2026 (includes Sat 18, Sun 19)
    const result = getTradingDaysInRange('2026-04-16', '2026-04-20');
    expect(result).toEqual([
      '2026-04-16',
      '2026-04-17',
      '2026-04-20',
    ]);
  });

  it('returns empty for weekend-only range', () => {
    const result = getTradingDaysInRange('2026-04-18', '2026-04-19');
    expect(result).toEqual([]);
  });

  it('returns single day for same start and end on weekday', () => {
    const result = getTradingDaysInRange('2026-04-13', '2026-04-13');
    expect(result).toEqual(['2026-04-13']);
  });
});
