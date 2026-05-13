// src/store/useClientStore.ts
import { create, type StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as ops from '../api/supabase/ops';
import { isSupabaseConfigured } from '../lib/supabase';
import { useAppointmentStore } from './useAppointmentStore';
import { useFinanceStore } from './useFinanceStore';
import type { Client, ClientPhoto } from '../types';
import { generateId } from '../utils/formatters';
import { encrypt, decrypt } from '../utils/crypto';

interface ClientStore {
  clients: Client[];
  /** Anon vitrin galerisi; null = clients üzerinden türet */
  publicGalleryOverride: ClientPhoto[] | null;
  hydrateFromServer: (clients: Client[]) => void;
  setPublicGalleryOverride: (photos: ClientPhoto[]) => void;
  reset: () => void;
  addClient: (data: Omit<Client, 'id' | 'createdAt' | 'photos'>) => Promise<Client>;
  updateClient: (id: string, data: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addPhoto: (
    clientId: string,
    photo: Omit<ClientPhoto, 'id'>,
    appointmentCtx?: { appointmentId: string; appointmentDate: string; appointmentTimeSlot: string }
  ) => Promise<void>;
  deletePhoto: (clientId: string, photoId: string) => Promise<void>;
  togglePhotoPublic: (clientId: string, photoId: string) => Promise<void>;
  getClient: (id: string) => Client | undefined;
  searchClients: (query: string) => Client[];
  getAllPhotos: () => ClientPhoto[];
  getPublicPhotos: () => ClientPhoto[];
}

const clientSlice: StateCreator<ClientStore> = (set, get) => ({
  clients: [],
  publicGalleryOverride: null,

  hydrateFromServer: (clients) => set({ clients, publicGalleryOverride: null }),

  setPublicGalleryOverride: (photos) => set({ publicGalleryOverride: photos }),

  reset: () => set({ clients: [], publicGalleryOverride: null }),

  addClient: async (data) => {
    if (isSupabaseConfigured()) {
      const client = await ops.dbInsertClient({
        name: data.name,
        phone: data.phone,
        notes: data.notes,
      });
      set((state) => ({ clients: [...state.clients, client] }));
      return client;
    }
    const newClient: Client = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      photos: [],
    };
    set((state) => ({
      clients: [...state.clients, newClient],
    }));
    return newClient;
  },

  updateClient: async (id, data) => {
    if (isSupabaseConfigured()) {
      const current = get().clients.find((c) => c.id === id);
      if (current) {
        await ops.dbUpdateClient(id, {
          name: data.name ?? current.name,
          phone: data.phone ?? current.phone,
          notes: data.notes !== undefined ? data.notes : current.notes,
        });
      }
    }
    set((state) => ({
      clients: state.clients.map((c) => (c.id === id ? { ...c, ...data } : c)),
    }));
  },

  deleteClient: async (id) => {
    const relatedAppointmentIds = useAppointmentStore.getState()
      .appointments
      .filter((a) => a.clientId === id)
      .map((a) => a.id);

    if (isSupabaseConfigured()) {
      await ops.dbDeleteClient(id);
    }

    set((state) => ({
      clients: state.clients.filter((c) => c.id !== id),
    }));

    useAppointmentStore.setState((state) => ({
      appointments: state.appointments.filter((a) => a.clientId !== id),
    }));

    if (relatedAppointmentIds.length > 0) {
      const deletedIds = new Set(relatedAppointmentIds);
      useFinanceStore.setState((state) => ({
        transactions: state.transactions.map((t) =>
          t.appointmentId && deletedIds.has(t.appointmentId)
            ? { ...t, appointmentId: undefined }
            : t
        ),
      }));
    }
  },

  addPhoto: async (clientId, photo, appointmentCtx) => {
    if (isSupabaseConfigured()) {
      const newPhoto = await ops.dbInsertPhoto({
        clientId,
        type: photo.type,
        imageData: photo.imageData,
        serviceId: photo.serviceId,
        date: photo.date,
        notes: photo.notes,
        isPublic: photo.isPublic,
        appointmentId: appointmentCtx?.appointmentId,
        appointmentDate: appointmentCtx?.appointmentDate,
        appointmentTimeSlot: appointmentCtx?.appointmentTimeSlot,
      });
      set((state) => ({
        clients: state.clients.map((c) =>
          c.id === clientId ? { ...c, photos: [...c.photos, newPhoto] } : c
        ),
      }));
      return;
    }
    const newPhoto: ClientPhoto = {
      ...photo,
      id: generateId(),
    };
    set((state) => ({
      clients: state.clients.map((c) =>
        c.id === clientId ? { ...c, photos: [...c.photos, newPhoto] } : c
      ),
    }));
  },

  deletePhoto: async (clientId, photoId) => {
    const client = get().clients.find((c) => c.id === clientId);
    const photo = client?.photos.find((p) => p.id === photoId);
    if (isSupabaseConfigured() && photo) {
      await ops.dbDeletePhoto(photo);
    }
    set((state) => ({
      clients: state.clients.map((c) =>
        c.id === clientId
          ? { ...c, photos: c.photos.filter((p) => p.id !== photoId) }
          : c
      ),
    }));
  },

  togglePhotoPublic: async (clientId, photoId) => {
    const client = get().clients.find((c) => c.id === clientId);
    const photo = client?.photos.find((p) => p.id === photoId);
    const next = !photo?.isPublic;
    if (isSupabaseConfigured()) {
      await ops.dbSetPhotoPublic(photoId, next);
    }
    set((state) => ({
      clients: state.clients.map((c) =>
        c.id === clientId
          ? {
              ...c,
              photos: c.photos.map((p) =>
                p.id === photoId ? { ...p, isPublic: next } : p
              ),
            }
          : c
      ),
    }));
    if (isSupabaseConfigured() && get().publicGalleryOverride !== null) {
      const { refreshPublicData } = await import('../api/supabase/sync');
      await refreshPublicData();
    }
  },

  getClient: (id) => get().clients.find((c) => c.id === id),

  searchClients: (query) => {
    const q = query.toLowerCase().trim();
    if (!q) return get().clients;
    return get().clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q)
    );
  },

  getAllPhotos: () => get().clients.flatMap((c) => c.photos),

  getPublicPhotos: () => {
    const override = get().publicGalleryOverride;
    if (override !== null) return override;
    return get().clients.flatMap((c) => c.photos.filter((p) => p.isPublic));
  },
});

export const useClientStore = isSupabaseConfigured()
  ? create<ClientStore>()(clientSlice)
  : create<ClientStore>()(
      persist(clientSlice, {
        name: 'naillab_clients',
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
