// src/store/useAppointmentStore.ts
import { create, type StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as ops from '../api/supabase/ops';
import { isSupabaseConfigured } from '../lib/supabase';
import type { Appointment, TimeSlot } from '../types';
import { STAFF_ILDEM_ID } from '../types';
import { generateId, getToday, getStartOfWeek, getStartOfMonth, getEndOfMonth } from '../utils/formatters';
import { addCalendarDaysYmd } from '../utils/studioTime';
import { ensureStudioAppointmentBookable } from '../utils/appointmentRules';
import { encrypt, decrypt } from '../utils/crypto';
import { useFinanceStore } from './useFinanceStore';

interface AppointmentStore {
  appointments: Appointment[];
  hydrateFromServer: (rows: Appointment[]) => void;
  reset: () => void;
  addAppointment: (data: Omit<Appointment, 'id' | 'createdAt'>) => Promise<Appointment>;
  updateStatus: (id: string, status: Appointment['status']) => Promise<void>;
  completeAppointment: (
    id: string,
    payload: { collectedAmount?: number; completionNotes?: string }
  ) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  getByDate: (date: string) => Appointment[];
  getByClient: (clientId: string) => Appointment[];
  isSlotTaken: (date: string, slot: TimeSlot, staffId: string) => boolean;
  getTodayAppointments: () => Appointment[];
  getUpcomingAppointments: (days?: number) => Appointment[];
  getTodayRevenue: () => number;
  getWeekRevenue: () => number;
  getMonthRevenue: () => number;
}

function randevuIncomeSum(start: string, end: string): number {
  return useFinanceStore
    .getState()
    .transactions.filter(
      (t) =>
        t.type === 'income' &&
        t.category === 'randevu' &&
        t.date >= start &&
        t.date <= end
    )
    .reduce((s, t) => s + t.amount, 0);
}

const appointmentSlice: StateCreator<AppointmentStore> = (set, get) => ({
  appointments: [],

  hydrateFromServer: (appointments) => set({ appointments }),

  reset: () => set({ appointments: [] }),

  addAppointment: async (data) => {
    const rowData = {
      ...data,
      staffId: data.staffId || STAFF_ILDEM_ID,
      source: data.source ?? 'web',
      listTotalPrice: data.listTotalPrice ?? data.totalPrice,
      allowOverlap: data.allowOverlap ?? false,
    };
    ensureStudioAppointmentBookable(rowData.date, rowData.timeSlot, {
      allowPast: rowData.source === 'admin',
    });
    if (isSupabaseConfigured()) {
      const row = await ops.dbInsertAppointment(rowData);
      set((state) => ({ appointments: [...state.appointments, row] }));
      return row;
    }
    const newAppointment: Appointment = {
      ...rowData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      appointments: [...state.appointments, newAppointment],
    }));
    return newAppointment;
  },

  updateStatus: async (id, status) => {
    if (isSupabaseConfigured()) {
      await ops.dbUpdateAppointmentStatus(id, status);
    }
    set((state) => ({
      appointments: state.appointments.map((a) => (a.id === id ? { ...a, status } : a)),
    }));
  },

  completeAppointment: async (id, payload) => {
    if (isSupabaseConfigured()) {
      await ops.dbCompleteAppointment({
        appointmentId: id,
        collectedAmount: payload.collectedAmount,
        completionNotes: payload.completionNotes,
      });
      const [apps, txs] = await Promise.all([ops.dbFetchAppointments(), ops.dbFetchTransactions()]);
      set({ appointments: apps });
      useFinanceStore.getState().hydrateFromServer(txs);
      return;
    }
    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'completed' as const,
              collectedAmount: payload.collectedAmount ?? a.listTotalPrice,
              completionNotes: payload.completionNotes,
            }
          : a
      ),
    }));
    const a = get().appointments.find((x) => x.id === id);
    if (a) {
      await useFinanceStore.getState().addTransaction({
        type: 'income',
        amount: payload.collectedAmount ?? a.listTotalPrice,
        category: 'randevu',
        description: `Randevu: ${a.clientName}`,
        date: a.date,
        appointmentId: id,
      });
    }
  },

  deleteAppointment: async (id) => {
    if (isSupabaseConfigured()) {
      await ops.dbDeleteAppointment(id);
    }
    set((state) => ({
      appointments: state.appointments.filter((a) => a.id !== id),
    }));
  },

  getByDate: (date) => get().appointments.filter((a) => a.date === date),

  getByClient: (clientId) => get().appointments.filter((a) => a.clientId === clientId),

  isSlotTaken: (date, slot, staffId) =>
    get().appointments.some(
      (a) =>
        a.date === date &&
        a.timeSlot === slot &&
        a.staffId === staffId &&
        a.status !== 'cancelled' &&
        !a.allowOverlap
    ),

  getTodayAppointments: () => {
    const today = getToday();
    return get()
      .appointments.filter((a) => a.date === today)
      .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
  },

  getUpcomingAppointments: (days = 7) => {
    const today = getToday();
    const futureDateStr = addCalendarDaysYmd(today, days);

    return get()
      .appointments.filter((a) => a.date >= today && a.date <= futureDateStr && a.status !== 'cancelled')
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.timeSlot.localeCompare(b.timeSlot);
      });
  },

  getTodayRevenue: () => {
    const today = getToday();
    if (isSupabaseConfigured()) {
      return randevuIncomeSum(today, today);
    }
    return get()
      .appointments.filter((a) => a.date === today && a.status === 'completed')
      .reduce((sum, a) => sum + (a.collectedAmount ?? a.listTotalPrice), 0);
  },

  getWeekRevenue: () => {
    const today = getToday();
    const weekStart = getStartOfWeek(today);
    if (isSupabaseConfigured()) {
      return randevuIncomeSum(weekStart, today);
    }
    return get()
      .appointments.filter(
        (a) => a.date >= weekStart && a.date <= today && a.status === 'completed'
      )
      .reduce((sum, a) => sum + (a.collectedAmount ?? a.listTotalPrice), 0);
  },

  getMonthRevenue: () => {
    const today = getToday();
    const monthStart = getStartOfMonth(today);
    const monthEnd = getEndOfMonth(today);
    if (isSupabaseConfigured()) {
      return randevuIncomeSum(monthStart, monthEnd);
    }
    return get()
      .appointments.filter(
        (a) =>
          a.date >= monthStart && a.date <= monthEnd && a.status === 'completed'
      )
      .reduce((sum, a) => sum + (a.collectedAmount ?? a.listTotalPrice), 0);
  },
});

export const useAppointmentStore = isSupabaseConfigured()
  ? create<AppointmentStore>()(appointmentSlice)
  : create<AppointmentStore>()(
      persist(appointmentSlice, {
        name: 'naillab_appointments',
        storage: createJSONStorage(() => ({
          getItem: (name) => {
            const val = localStorage.getItem(name);
            return val ? decrypt(val) : null;
          },
          setItem: (name, val) => localStorage.setItem(name, encrypt(val)),
          removeItem: (name) => localStorage.removeItem(name),
        })),
      })
    );
