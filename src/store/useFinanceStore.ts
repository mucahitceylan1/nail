// src/store/useFinanceStore.ts
import { create, type StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as ops from '../api/supabase/ops';
import { isSupabaseConfigured } from '../lib/supabase';
import type { MonthSummary, Transaction } from '../types';
import { generateId } from '../utils/formatters';
import { encrypt, decrypt } from '../utils/crypto';

interface FinanceStore {
  transactions: Transaction[];
  hydrateFromServer: (rows: Transaction[]) => void;
  reset: () => void;
  addTransaction: (data: Omit<Transaction, 'id'>) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  getByDateRange: (start: string, end: string) => Transaction[];
  getByType: (type: 'income' | 'expense') => Transaction[];
  getMonthSummary: (year: number, month: number) => MonthSummary;
}

const financeSlice: StateCreator<FinanceStore> = (set, get) => ({
  transactions: [],

  hydrateFromServer: (transactions) => set({ transactions }),

  reset: () => set({ transactions: [] }),

  addTransaction: async (data) => {
    if (isSupabaseConfigured()) {
      const row = await ops.dbInsertTransaction(data);
      set((state) => ({ transactions: [...state.transactions, row] }));
      return row;
    }
    const newTransaction: Transaction = {
      ...data,
      id: generateId(),
    };
    set((state) => ({
      transactions: [...state.transactions, newTransaction],
    }));
    return newTransaction;
  },

  deleteTransaction: async (id) => {
    if (isSupabaseConfigured()) {
      await ops.dbDeleteTransaction(id);
    }
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    }));
  },

  getByDateRange: (start, end) =>
    get().transactions.filter((t) => t.date >= start && t.date <= end),

  getByType: (type) => get().transactions.filter((t) => t.type === type),

  getMonthSummary: (year, month) => {
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const monthTransactions = get().transactions.filter(
      (t) => t.date >= startDate && t.date <= endDate
    );

    const totalIncome = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const byCategory: Record<string, number> = {};
    monthTransactions.forEach((t) => {
      const key = `${t.type}_${t.category}`;
      byCategory[key] = (byCategory[key] ?? 0) + t.amount;
    });

    return {
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
      byCategory,
    };
  },
});

export const useFinanceStore = isSupabaseConfigured()
  ? create<FinanceStore>()(financeSlice)
  : create<FinanceStore>()(
      persist(financeSlice, {
        name: 'naillab_transactions',
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
