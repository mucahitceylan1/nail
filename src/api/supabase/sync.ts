import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { useAppointmentStore } from '../../store/useAppointmentStore';
import { useClientStore } from '../../store/useClientStore';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useServiceStore } from '../../store/useServiceStore';
import { useSiteGalleryStore } from '../../store/useSiteGalleryStore';
import * as ops from './ops';

export async function refreshPublicData(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const services = await ops.dbFetchServices();
    useServiceStore.getState().hydrateServices(services);
    const photos = await ops.dbFetchPublicPhotos();
    useClientStore.getState().setPublicGalleryOverride(photos);
    const gallery = await ops.dbFetchGalleryAssets();
    useSiteGalleryStore.getState().hydrateFromServer(gallery);
  } catch (e) {
    console.error('refreshPublicData', e);
  }
}

export async function refreshAdminData(): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) return;
  // Caller ensures session

  await ops.dbSeedServicesIfEmpty();
  const services = await ops.dbFetchServices();
  useServiceStore.getState().hydrateServices(services);
  const clients = await ops.dbFetchClientsWithPhotos();
  const appointments = await ops.dbFetchAppointments();
  const transactions = await ops.dbFetchTransactions();
  const gallery = await ops.dbFetchGalleryAssets();
  useClientStore.getState().hydrateFromServer(clients);
  useAppointmentStore.getState().hydrateFromServer(appointments);
  useFinanceStore.getState().hydrateFromServer(transactions);
  useSiteGalleryStore.getState().hydrateFromServer(gallery);
}

export function clearLocalStores(): void {
  useClientStore.getState().reset();
  useAppointmentStore.getState().reset();
  useFinanceStore.getState().reset();
  useServiceStore.getState().reset();
  useSiteGalleryStore.getState().reset();
}
