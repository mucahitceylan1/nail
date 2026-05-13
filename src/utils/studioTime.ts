/**
 * Nail Lab. — business calendar and “today” follow Turkey (Europe/Istanbul),
 * regardless of UI language or visitor timezone.
 *
 * Turkey uses permanent UTC+3 (no DST since 2016). For civil `YYYY-MM-DD` we use
 * 12:00 local Istanbul ≈ `09:00Z` as a stable instant for weekday / Intl formatting.
 */
export const STUDIO_TIMEZONE = 'Europe/Istanbul';

const YMD_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Parse `YYYY-MM-DD` as a studio civil date and return a `Date` at ~noon Istanbul
 * (stable for `Intl` + `timeZone: Europe/Istanbul` and for Monday-based weekday math).
 */
export function studioYmdToUtcNoonDate(ymd: string): Date {
  const m = YMD_RE.exec(ymd.trim());
  if (!m) return new Date(NaN);
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return new Date(NaN);
  return new Date(Date.UTC(y, mo - 1, d, 9, 0, 0));
}

/** Current calendar date in Istanbul as YYYY-MM-DD. */
export function getTodayYmdInStudio(now = new Date()): string {
  return now.toLocaleDateString('en-CA', { timeZone: STUDIO_TIMEZONE });
}

/** Istanbul wall-calendar parts for initializing month/year pickers. `month0` is 0–11 (Date-style). */
export function getStudioWallCalendarParts(now = new Date()): { year: number; month0: number; day: number } {
  const f = new Intl.DateTimeFormat('en-US', {
    timeZone: STUDIO_TIMEZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  const parts = f.formatToParts(now);
  const n = (t: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return { year: n('year'), month0: n('month') - 1, day: n('day') };
}

/** Add signed days to a YYYY-MM-DD (Gregorian; not tied to visitor TZ). */
export function addCalendarDaysYmd(ymd: string, deltaDays: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  dt.setUTCDate(dt.getUTCDate() + deltaDays);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

/** Lexicographic compare for `YYYY-MM-DD` strings (same calendar ordering as Istanbul wall dates). */
export function compareStudioYmd(a: string, b: string): number {
  return a.localeCompare(b);
}

/** Monday = 0 … Sunday = 6 for the given studio civil calendar day. */
export function weekdayMonday0FromYmd(ymd: string): number {
  const inst = studioYmdToUtcNoonDate(ymd);
  if (Number.isNaN(inst.getTime())) return 0;
  const dow = inst.getUTCDay();
  return dow === 0 ? 6 : dow - 1;
}

/** First-of-month weekday (Monday = 0) for a studio wall month. */
export function weekdayMonday0FirstOfMonth(year: number, month0: number): number {
  const ymd = `${year}-${String(month0 + 1).padStart(2, '0')}-01`;
  return weekdayMonday0FromYmd(ymd);
}

/** Calendar navigation: true when the viewed month is the studio’s current month (cannot go to past month). */
export function isStudioMonthAtMinimum(calYear: number, calMonth0: number, todayYmd = getTodayYmdInStudio()): boolean {
  const p = YMD_RE.exec(todayYmd);
  if (!p) return false;
  const ty = Number(p[1]);
  const tm = Number(p[2]);
  return calYear === ty && calMonth0 === tm - 1;
}

/**
 * Calendar navigation: true when the viewed month is at or beyond “today + monthsAhead”
 * (cannot advance further). `monthsAhead` counts whole months from the first of the current studio month.
 */
export function isStudioMonthAtOrPastMaximum(
  calYear: number,
  calMonth0: number,
  monthsAhead = 12,
  todayYmd = getTodayYmdInStudio()
): boolean {
  const p = YMD_RE.exec(todayYmd);
  if (!p) return false;
  const ty = Number(p[1]);
  const tm = Number(p[2]);
  const last = new Date(Date.UTC(ty, tm - 1, 1));
  last.setUTCMonth(last.getUTCMonth() + monthsAhead);
  const maxY = last.getUTCFullYear();
  const maxM0 = last.getUTCMonth();
  const viewIndex = calYear * 12 + calMonth0;
  const maxIndex = maxY * 12 + maxM0;
  return viewIndex >= maxIndex;
}

/** Monday-start week: YYYY-MM-DD of the Monday of the week containing `ymd`. */
export function startOfWeekMondayYmd(ymd: string): string {
  return addCalendarDaysYmd(ymd, -weekdayMonday0FromYmd(ymd));
}

/** Pazar — `ymd` hafta içi indeksinde 6 = Pazar (Pzt=0). */
export function isSundayYmd(ymd: string): boolean {
  return weekdayMonday0FromYmd(ymd) === 6;
}

/** Pazartesi–Cumartesi açık; Pazar kapalı. */
export function isStudioBookingDayYmd(ymd: string): boolean {
  return !isSundayYmd(ymd);
}
