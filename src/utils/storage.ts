// src/utils/storage.ts
// Nail Lab. by İldem — localStorage Abstraction

export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Storage error for key: ${key}`, error);
      alert('Hafıza dolu (5MB sınırı). Lütfen gereksiz fotoğrafları veya kayıtları silerek yer açın.');
    }
  },
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      console.error(`Storage remove error for key: ${key}`);
    }
  },
};

export const STORAGE_KEYS = {
  CLIENTS: 'naillab_clients',
  APPOINTMENTS: 'naillab_appointments',
  TRANSACTIONS: 'naillab_transactions',
  SERVICES: 'naillab_services',
} as const;
