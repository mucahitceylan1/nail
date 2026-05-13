// src/utils/appointmentRules.ts — studio (Europe/Istanbul) booking rules shared by UI, store, and API.
import { BOOKING_TIME_SLOTS, type TimeSlot } from '../types';
import { compareStudioYmd, getTodayYmdInStudio, isStudioBookingDayYmd } from './studioTime';

const YMD = /^\d{4}-\d{2}-\d{2}$/;

export type StudioBookingViolation = 'invalid_date' | 'past' | 'sunday' | 'slot';

export function checkStudioAppointmentBooking(
  date: string,
  timeSlot: string,
  opts?: { allowPast?: boolean }
): StudioBookingViolation | null {
  if (!YMD.test(date.trim())) return 'invalid_date';
  const d = date.trim();
  if (!opts?.allowPast && compareStudioYmd(d, getTodayYmdInStudio()) < 0) return 'past';
  if (!isStudioBookingDayYmd(d)) return 'sunday';
  if (!BOOKING_TIME_SLOTS.includes(timeSlot as TimeSlot)) return 'slot';
  return null;
}

/** Throws `Error` with message `BOOKING:<code>` for callers that catch uniformly. */
export function ensureStudioAppointmentBookable(
  date: string,
  timeSlot: TimeSlot,
  opts?: { allowPast?: boolean }
): void {
  const v = checkStudioAppointmentBooking(date, timeSlot, opts);
  if (v) throw new Error(`BOOKING:${v}`);
}
