// src/utils/formatters.ts
// Nail Lab. by İldem — Formatting Utilities
import i18n from '../i18n/config';
import {
  STUDIO_TIMEZONE,
  getTodayYmdInStudio,
  startOfWeekMondayYmd,
  studioYmdToUtcNoonDate,
} from './studioTime';

export { STUDIO_TIMEZONE } from './studioTime';

const getLocale = () => {
  const base = (i18n.language || 'tr').split('-')[0]?.toLowerCase() ?? 'tr';
  switch (base) {
    case 'tr':
      return 'tr-TR';
    case 'en':
      return 'en-US';
    case 'ru':
      return 'ru-RU';
    case 'ar':
      return 'ar-SA';
    default:
      return 'tr-TR';
  }
};

export const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat(getLocale(), { style: 'currency', currency: 'TRY' }).format(amount);
};

/** Display calendar date in the active UI language; `YYYY-MM-DD` is the studio civil day (Istanbul). */
export const formatDate = (dateStr: string): string => {
  const ref = studioYmdToUtcNoonDate(dateStr);
  if (Number.isNaN(ref.getTime())) return dateStr;
  return new Intl.DateTimeFormat(getLocale(), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: STUDIO_TIMEZONE,
  }).format(ref);
};

export const formatDateShort = (dateStr: string): string => {
  const ref = studioYmdToUtcNoonDate(dateStr);
  if (Number.isNaN(ref.getTime())) return dateStr;
  return new Intl.DateTimeFormat(getLocale(), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: STUDIO_TIMEZONE,
  }).format(ref);
};

export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 4)}) ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9, 11)}`;
  }
  if (cleaned.length === 10) {
    return `(0${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
  }
  return phone;
};

export const formatDuration = (minutes: number): string => {
  const lang = (i18n.language || 'tr').split('-')[0]?.toLowerCase() ?? 'tr';
  if (minutes < 60) {
    if (lang === 'tr') return `${minutes} dk`;
    if (lang === 'ru') return `${minutes} мин`;
    if (lang === 'ar') return `${minutes} د`;
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remaining = Math.floor(minutes % 60);

  const hLabel = lang === 'tr' ? 'sa' : lang === 'ru' ? 'ч' : lang === 'ar' ? 'س' : 'hr';
  const mLabel = lang === 'tr' ? 'dk' : lang === 'ru' ? 'мин' : lang === 'ar' ? 'د' : 'min';

  return remaining > 0 ? `${hours} ${hLabel} ${remaining} ${mLabel}` : `${hours} ${hLabel}`;
};

/** Business “today” = current calendar date in Turkey (Europe/Istanbul). */
export const getToday = (): string => getTodayYmdInStudio();

export const generateId = (): string =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const normalizePhoneDigits = (phone: string): string => phone.replace(/\D/g, '');

export const getStartOfWeek = (dateStr: string): string => startOfWeekMondayYmd(dateStr);

export const getStartOfMonth = (ymd: string): string => {
  const [y, mo] = ymd.split('-').map(Number);
  return `${y}-${String(mo).padStart(2, '0')}-01`;
};

export const getEndOfMonth = (ymd: string): string => {
  const [y, mo] = ymd.split('-').map(Number);
  const last = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  return `${y}-${String(mo).padStart(2, '0')}-${String(last).padStart(2, '0')}`;
};

export const getDaysInMonth = (year: number, month: number): number =>
  new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

export const getMonthName = (month: number): string => {
  const date = new Date(Date.UTC(2026, month, 15, 9, 0, 0));
  return new Intl.DateTimeFormat(getLocale(), { month: 'long', timeZone: STUDIO_TIMEZONE }).format(date);
};

/** Short weekday labels in UI order Monday → Sunday (aligned with studio week, not visitor TZ). */
export const getDayName = (dayIndex: number): string => {
  const baseDate = new Date(Date.UTC(2024, 0, 1, 9, 0, 0));
  baseDate.setUTCDate(baseDate.getUTCDate() + dayIndex);
  return new Intl.DateTimeFormat(getLocale(), { weekday: 'short', timeZone: STUDIO_TIMEZONE }).format(baseDate);
};
