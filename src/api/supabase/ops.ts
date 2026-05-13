import { supabase } from '../../lib/supabase';
import { uploadWithSignOrSupabase, publicUrlForBucketPath } from '../../lib/mediaUpload';
import { normalizePhoneDigits } from '../../utils/formatters';
import type { Appointment, Client, ClientPhoto, GalleryAsset, Service, Staff, Transaction } from '../../types';
import { INITIAL_SERVICES } from '../../types';
import {
  mapAppointmentRow,
  mapClientRow,
  mapGalleryAssetRow,
  mapPhotoRow,
  mapServiceRow,
  mapStaffRow,
  mapTransactionRow,
  type AppointmentRow,
  type ClientRow,
  type GalleryAssetRow,
  type PhotoRow,
  type ServiceRow,
  type StaffRow,
  type TransactionRow,
} from './mappers';
import { ensureStudioAppointmentBookable } from '../../utils/appointmentRules';

export const APPOINTMENT_MEDIA_BUCKET = 'appointment-media';
export const SITE_GALLERY_BUCKET = 'site-gallery';
const LEGACY_PHOTO_BUCKET = 'client-photos';

export async function dbCheckIsAdmin(): Promise<boolean> {
  const c = requireClient();
  const { data, error } = await c.rpc('is_admin');
  if (error) throw error;
  return Boolean(data);
}

function requireClient() {
  const c = supabase;
  if (!c) throw new Error('Supabase yapılandırılmadı');
  return c;
}

export async function dbFetchServices(): Promise<Service[]> {
  const c = requireClient();
  const { data, error } = await c
    .from('services')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => mapServiceRow(r as ServiceRow));
}

export async function dbSeedServicesIfEmpty(): Promise<void> {
  const c = requireClient();
  const { count, error: countErr } = await c
    .from('services')
    .select('*', { count: 'exact', head: true });
  if (countErr) throw countErr;
  if ((count ?? 0) > 0) return;
  const rows = INITIAL_SERVICES.map((s, i) => ({
    id: s.id,
    name: s.name,
    category: s.category,
    price: s.price,
    duration: s.duration,
    description: s.description ?? null,
    is_active: s.isActive,
    sort_order: i,
  }));
  const { error } = await c.from('services').insert(rows);
  if (error) throw error;
}

export async function dbUpdateService(id: string, patch: Partial<Service>): Promise<void> {
  const c = requireClient();
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.category !== undefined) row.category = patch.category;
  if (patch.price !== undefined) row.price = patch.price;
  if (patch.duration !== undefined) row.duration = patch.duration;
  if (patch.description !== undefined) row.description = patch.description ?? null;
  if (patch.isActive !== undefined) row.is_active = patch.isActive;
  row.updated_at = new Date().toISOString();
  const { error } = await c.from('services').update(row).eq('id', id);
  if (error) throw error;
}

export async function dbInsertService(data: Omit<Service, 'id'>): Promise<Service> {
  const c = requireClient();
  const id = crypto.randomUUID();
  
  // Get max sort_order to append to the end
  const { data: maxRow } = await c
    .from('services')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();
    
  const sort_order = (maxRow?.sort_order ?? -1) + 1;

  const { error } = await c
    .from('services')
    .insert({
      id,
      name: data.name,
      category: data.category,
      price: data.price,
      duration: data.duration,
      description: data.description ?? null,
      is_active: data.isActive,
      sort_order,
    });
    
  if (error) throw error;
  
  return {
    ...data,
    id,
  };
}

export async function dbDeleteService(id: string): Promise<void> {
  const c = requireClient();
  const { error } = await c.from('services').delete().eq('id', id);
  if (error) throw error;
}

export async function dbReorderServices(orderedIds: string[]): Promise<void> {
  const c = requireClient();
  await Promise.all(
    orderedIds.map((id, sort_order) =>
      c.from('services').update({ sort_order, updated_at: new Date().toISOString() }).eq('id', id)
    )
  );
}

export async function dbFetchStaff(): Promise<Staff[]> {
  const c = requireClient();
  const { data, error } = await c.from('staff').select('*').order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => mapStaffRow(r as StaffRow));
}

export async function dbFetchGalleryAssets(): Promise<GalleryAsset[]> {
  const c = requireClient();
  const { data, error } = await c
    .from('public_gallery_assets')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => {
    const r = row as GalleryAssetRow;
    return mapGalleryAssetRow(r, publicUrlForBucketPath(SITE_GALLERY_BUCKET, r.storage_path));
  });
}

export async function dbInsertGalleryAsset(params: {
  storagePath: string;
  sortOrder?: number;
  altText?: string;
}): Promise<GalleryAsset> {
  const c = requireClient();
  const { data: row, error } = await c
    .from('public_gallery_assets')
    .insert({
      storage_path: params.storagePath,
      sort_order: params.sortOrder ?? 0,
      alt_text: params.altText ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  const r = row as GalleryAssetRow;
  return mapGalleryAssetRow(r, publicUrlForBucketPath(SITE_GALLERY_BUCKET, r.storage_path));
}

export async function dbDeleteGalleryAsset(id: string): Promise<void> {
  const c = requireClient();
  const { data: row, error: selErr } = await c.from('public_gallery_assets').select('storage_path').eq('id', id).maybeSingle();
  if (selErr) throw selErr;
  const storagePath = (row as { storage_path?: string } | null)?.storage_path;
  if (storagePath) {
    const { error: rmErr } = await c.storage.from(SITE_GALLERY_BUCKET).remove([storagePath]);
    if (rmErr) console.warn('dbDeleteGalleryAsset storage remove', rmErr);
  }
  const { error } = await c.from('public_gallery_assets').delete().eq('id', id);
  if (error) throw error;
}

export async function dbUpdateGalleryAssetAltText(id: string, altText: string): Promise<void> {
  const c = requireClient();
  const { error } = await c.from('public_gallery_assets').update({ alt_text: altText }).eq('id', id);
  if (error) throw error;
}

export async function dbReorderGalleryAssets(orderedIds: string[]): Promise<void> {
  const c = requireClient();
  await Promise.all(
    orderedIds.map((id, i) => c.from('public_gallery_assets').update({ sort_order: i }).eq('id', id))
  );
}

export async function dbFetchClientsWithPhotos(): Promise<Client[]> {
  const c = requireClient();
  const { data: clients, error: e1 } = await c
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });
  if (e1) throw e1;
  const { data: photos, error: e2 } = await c.from('client_photos').select('*');
  if (e2) throw e2;
  const photoMap = new Map<string, ClientPhoto[]>();
  for (const p of photos ?? []) {
    const cp = mapPhotoRow(p as PhotoRow);
    const list = photoMap.get(cp.clientId) ?? [];
    list.push(cp);
    photoMap.set(cp.clientId, list);
  }
  return (clients ?? []).map((row) =>
    mapClientRow(row as ClientRow, photoMap.get((row as ClientRow).id) ?? [])
  );
}

export async function dbFetchPublicPhotos(): Promise<ClientPhoto[]> {
  const c = requireClient();
  const { data, error } = await c.from('client_photos').select('*').eq('is_public', true);
  if (error) throw error;
  return (data ?? []).map((p) => mapPhotoRow(p as PhotoRow));
}

export async function dbFindClientByPhone(phone: string): Promise<Client | null> {
  const norm = normalizePhoneDigits(phone);
  if (!norm) return null;
  const c = requireClient();
  const { data: row, error } = await c
    .from('clients')
    .select('*')
    .eq('phone_normalized', norm)
    .maybeSingle();
  if (error) throw error;
  if (!row) return null;
  const { data: photos } = await c.from('client_photos').select('*').eq('client_id', (row as ClientRow).id);
  const mapped = (photos ?? []).map((p) => mapPhotoRow(p as PhotoRow));
  return mapClientRow(row as ClientRow, mapped);
}

export async function dbInsertClient(data: {
  name: string;
  phone: string;
  notes?: string;
  email?: string;
}): Promise<Client> {
  const c = requireClient();
  const phone_normalized = normalizePhoneDigits(data.phone);
  const id = crypto.randomUUID();
  const { error } = await c
    .from('clients')
    .insert({
      id,
      name: data.name,
      phone: data.phone,
      phone_normalized,
      notes: data.notes ?? null,
      email: data.email ?? null,
    });
  if (error) throw error;
  return {
    id,
    name: data.name,
    phone: data.phone,
    createdAt: new Date().toISOString(),
    notes: data.notes,
    photos: []
  };
}

export async function dbUpdateClient(
  id: string,
  patch: Partial<{ name: string; phone: string; notes?: string; email?: string }>
): Promise<void> {
  const c = requireClient();
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.phone !== undefined) {
    row.phone = patch.phone;
    row.phone_normalized = normalizePhoneDigits(patch.phone);
  }
  if (patch.notes !== undefined) row.notes = patch.notes ?? null;
  if (patch.email !== undefined) row.email = patch.email ?? null;
  const { error } = await c.from('clients').update(row).eq('id', id);
  if (error) throw error;
}

export async function dbDeleteClient(id: string): Promise<void> {
  const c = requireClient();
  const { error } = await c.from('clients').delete().eq('id', id);
  if (error) throw error;
}

function storagePathForAppointmentPhoto(
  appointmentDate: string,
  timeSlot: string,
  clientId: string,
  photoId: string,
  ext: string
): string {
  const hm = timeSlot.replace(':', '-');
  return `appointments/${appointmentDate}/${hm}/${clientId}/${photoId}.${ext}`;
}

export async function dbInsertPhoto(params: {
  clientId: string;
  type: 'before' | 'after';
  imageData: string;
  serviceId?: string;
  date: string;
  notes?: string;
  isPublic?: boolean;
  appointmentId?: string;
  appointmentDate?: string;
  appointmentTimeSlot?: string;
}): Promise<ClientPhoto> {
  const c = requireClient();
  const id = crypto.randomUUID();
  const ext = params.imageData.startsWith('data:image/png') ? 'png' : 'jpg';
  const bucket = APPOINTMENT_MEDIA_BUCKET;
  const path =
    params.appointmentId && params.appointmentDate && params.appointmentTimeSlot
      ? storagePathForAppointmentPhoto(
          params.appointmentDate,
          params.appointmentTimeSlot,
          params.clientId,
          id,
          ext
        )
      : `${params.clientId}/${id}.${ext}`;

  let uploadBody: Blob;
  if (params.imageData.startsWith('data:')) {
    const res = await fetch(params.imageData);
    uploadBody = await res.blob();
  } else {
    throw new Error('Geçersiz görüntü verisi');
  }

  const contentType = uploadBody.type || 'image/jpeg';
  await uploadWithSignOrSupabase(bucket, path, uploadBody, contentType);

  const image_url = publicUrlForBucketPath(bucket, path);

  const { data: row, error } = await c
    .from('client_photos')
    .insert({
      id,
      client_id: params.clientId,
      photo_type: params.type,
      storage_path: path,
      image_url,
      service_id: params.serviceId ?? null,
      photo_date: params.date,
      notes: params.notes ?? null,
      is_public: params.isPublic ?? false,
      appointment_id: params.appointmentId ?? null,
      storage_bucket: bucket,
    })
    .select()
    .single();
  if (error) throw error;
  return mapPhotoRow(row as PhotoRow);
}

export async function dbDeletePhoto(photo: ClientPhoto): Promise<void> {
  const c = requireClient();
  if (photo.storagePath) {
    const b = photo.storageBucket ?? LEGACY_PHOTO_BUCKET;
    await c.storage.from(b).remove([photo.storagePath]);
  }
  const { error } = await c.from('client_photos').delete().eq('id', photo.id);
  if (error) throw error;
}

export async function dbFetchPhotosForAppointment(appointmentId: string): Promise<ClientPhoto[]> {
  const c = requireClient();
  const { data, error } = await c.from('client_photos').select('*').eq('appointment_id', appointmentId);
  if (error) throw error;
  return (data ?? []).map((p) => mapPhotoRow(p as PhotoRow));
}

export async function dbSetPhotoPublic(photoId: string, isPublic: boolean): Promise<void> {
  const c = requireClient();
  const { error } = await c.from('client_photos').update({ is_public: isPublic }).eq('id', photoId);
  if (error) throw error;
}

export async function dbFetchAppointments(): Promise<Appointment[]> {
  const c = requireClient();
  const { data, error } = await c
    .from('appointments')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => mapAppointmentRow(r as AppointmentRow));
}

export async function dbInsertAppointment(
  data: Omit<Appointment, 'id' | 'createdAt'>
): Promise<Appointment> {
  const c = requireClient();
  ensureStudioAppointmentBookable(data.date, data.timeSlot, { allowPast: data.source === 'admin' });
  const id = crypto.randomUUID();
  const list = data.listTotalPrice ?? data.totalPrice;
  const { error } = await c.from('appointments').insert({
    id,
    client_id: data.clientId,
    client_name: data.clientName,
    client_phone: data.clientPhone,
    service_ids: data.serviceIds,
    date: data.date,
    time_slot: data.timeSlot,
    status: data.status,
    total_price: data.totalPrice,
    list_total_price: list,
    collected_amount: data.collectedAmount ?? null,
    notes: data.notes ?? null,
    staff_id: data.staffId,
    source: data.source,
    allow_overlap: data.allowOverlap ?? false,
  });
  if (error) throw error;
  return {
    ...data,
    id,
    listTotalPrice: list,
    createdAt: new Date().toISOString(),
  };
}

export async function dbCompleteAppointment(params: {
  appointmentId: string;
  collectedAmount?: number;
  completionNotes?: string;
}): Promise<void> {
  const c = requireClient();
  const { error } = await c.rpc('complete_appointment', {
    p_appointment_id: params.appointmentId,
    p_collected_amount: params.collectedAmount ?? null,
    p_completion_notes: params.completionNotes ?? '',
  });
  if (error) throw error;
}

export async function dbUpdateAppointmentStatus(id: string, status: Appointment['status']): Promise<void> {
  const c = requireClient();
  const { error } = await c.from('appointments').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function dbDeleteAppointment(id: string): Promise<void> {
  const c = requireClient();
  const { error } = await c.from('appointments').delete().eq('id', id);
  if (error) throw error;
}

export async function dbFetchTransactions(): Promise<Transaction[]> {
  const c = requireClient();
  const { data, error } = await c.from('transactions').select('*').order('date', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => mapTransactionRow(r as TransactionRow));
}

export async function dbInsertTransaction(data: Omit<Transaction, 'id'>): Promise<Transaction> {
  const c = requireClient();
  const { data: row, error } = await c
    .from('transactions')
    .insert({
      type: data.type,
      amount: data.amount,
      category: data.category,
      description: data.description,
      date: data.date,
      appointment_id: data.appointmentId ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return mapTransactionRow(row as TransactionRow);
}

export async function dbDeleteTransaction(id: string): Promise<void> {
  const c = requireClient();
  const { error } = await c.from('transactions').delete().eq('id', id);
  if (error) throw error;
}
