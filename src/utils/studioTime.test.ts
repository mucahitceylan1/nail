import { describe, expect, it } from 'vitest';
import {
  addCalendarDaysYmd,
  compareStudioYmd,
  isStudioMonthAtMinimum,
  isStudioMonthAtOrPastMaximum,
  startOfWeekMondayYmd,
  studioYmdToUtcNoonDate,
  weekdayMonday0FromYmd,
  weekdayMonday0FirstOfMonth,
} from './studioTime';

describe('studioTime (Europe/Istanbul civil dates)', () => {
  it('studioYmdToUtcNoonDate parses YYYY-MM-DD', () => {
    const d = studioYmdToUtcNoonDate('2024-06-15');
    expect(d.getUTCFullYear()).toBe(2024);
    expect(d.getUTCMonth()).toBe(5);
    expect(d.getUTCDate()).toBe(15);
    expect(d.getUTCHours()).toBe(9);
  });

  it('rejects invalid YMD', () => {
    expect(Number.isNaN(studioYmdToUtcNoonDate('').getTime())).toBe(true);
    expect(Number.isNaN(studioYmdToUtcNoonDate('2024-13-01').getTime())).toBe(true);
  });

  it('weekdayMonday0FromYmd: 2024-01-01 is Monday', () => {
    expect(weekdayMonday0FromYmd('2024-01-01')).toBe(0);
  });

  it('weekdayMonday0FirstOfMonth matches first-of-month YMD', () => {
    expect(weekdayMonday0FirstOfMonth(2024, 0)).toBe(weekdayMonday0FromYmd('2024-01-01'));
  });

  it('startOfWeekMondayYmd returns Monday of same week', () => {
    expect(startOfWeekMondayYmd('2024-01-03')).toBe('2024-01-01');
  });

  it('addCalendarDaysYmd adds civil days', () => {
    expect(addCalendarDaysYmd('2024-01-31', 1)).toBe('2024-02-01');
  });

  it('compareStudioYmd orders lexicographically', () => {
    expect(compareStudioYmd('2024-01-01', '2024-01-02')).toBeLessThan(0);
    expect(compareStudioYmd('2024-02-01', '2024-01-31')).toBeGreaterThan(0);
  });

  it('isStudioMonthAtMinimum detects current month view', () => {
    expect(isStudioMonthAtMinimum(2024, 5, '2024-06-15')).toBe(true);
    expect(isStudioMonthAtMinimum(2024, 4, '2024-06-15')).toBe(false);
  });

  it('isStudioMonthAtOrPastMaximum caps months ahead from studio today', () => {
    expect(isStudioMonthAtOrPastMaximum(2025, 5, 12, '2024-06-15')).toBe(true);
    expect(isStudioMonthAtOrPastMaximum(2025, 4, 12, '2024-06-15')).toBe(false);
  });
});
