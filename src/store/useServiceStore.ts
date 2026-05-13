// src/store/useServiceStore.ts
import { create, type StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';
import * as ops from '../api/supabase/ops';
import { isSupabaseConfigured } from '../lib/supabase';
import { useAppointmentStore } from './useAppointmentStore';
import type { Service } from '../types';
import { INITIAL_SERVICES } from '../types';

interface ServiceStore {
  services: Service[];
  hydrateServices: (services: Service[]) => void;
  reset: () => void;
  updateService: (id: string, data: Partial<Service>) => Promise<void>;
  addService: (data: Omit<Service, 'id'>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  getService: (id: string) => Service | undefined;
  getActiveServices: () => Service[];
  getServicesByCategory: (category: string) => Service[];
  reorderServices: (activeId: string, overId: string) => Promise<void>;
}

const serviceSlice: StateCreator<ServiceStore> = (set, get) => ({
  services: INITIAL_SERVICES,

  hydrateServices: (services) => set({ services }),

  reset: () => set({ services: INITIAL_SERVICES }),

  updateService: async (id, data) => {
    if (isSupabaseConfigured()) {
      await ops.dbUpdateService(id, data);
    }
    set((state) => ({
      services: state.services.map((s) => (s.id === id ? { ...s, ...data } : s)),
    }));
  },

  addService: async (data) => {
    let newService: Service;
    if (isSupabaseConfigured()) {
      newService = await ops.dbInsertService(data);
    } else {
      newService = {
        ...data,
        id: Math.random().toString(36).slice(2, 9),
      };
    }
    set((state) => ({
      services: [...state.services, newService],
    }));
  },

  deleteService: async (id) => {
    const linkedAppointments = useAppointmentStore.getState().appointments.filter((a) =>
      a.serviceIds.includes(id)
    );
    if (linkedAppointments.length > 0) {
      throw new Error('Bu hizmet aktif veya geÃ§miÅŸ randevularda kullanÄ±ldÄ±ÄŸÄ± iÃ§in silinemez.');
    }

    if (isSupabaseConfigured()) {
      await ops.dbDeleteService(id);
    }
    set((state) => ({
      services: state.services.filter((s) => s.id !== id),
    }));
  },

  getService: (id) => get().services.find((s) => s.id === id),

  getActiveServices: () => get().services.filter((s) => s.isActive),

  getServicesByCategory: (category) =>
    get().services.filter((s) => s.category === category && s.isActive),

  reorderServices: async (activeId, overId) => {
    let orderedIds: string[] = [];
    set((state) => {
      const newServices = [...state.services];
      const oldIndex = newServices.findIndex((s) => s.id === activeId);
      const newIndex = newServices.findIndex((s) => s.id === overId);
      if (oldIndex === -1 || newIndex === -1) return state;
      const [movedItem] = newServices.splice(oldIndex, 1);
      newServices.splice(newIndex, 0, movedItem);
      orderedIds = newServices.map((s) => s.id);
      return { services: newServices };
    });
    if (isSupabaseConfigured() && orderedIds.length > 0) {
      await ops.dbReorderServices(orderedIds);
    }
  },
});

export const useServiceStore = isSupabaseConfigured()
  ? create<ServiceStore>()(serviceSlice)
  : create<ServiceStore>()(persist(serviceSlice, { name: 'naillab_services' }));
