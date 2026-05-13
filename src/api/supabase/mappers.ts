import type {
  Appointment,
  AppointmentSource,
  Client,
  ClientPhoto,
  GalleryAsset,
  Service,
  ServiceCategory,
  Staff,
  TimeSlot,
  Transaction,
} from '../../types';
import { BOOKING_TIME_SLOTS } from '../../types';

export type ServiceRow = {
  id: string;
  name: string;
  category: string;
  price: number | string;
  duration: number;
  description: string | null;
  is_active: boolean;
  sort_order: number;
};

export type ClientRow = {
  id: string;
  name: string;
  phone: string;
  phone_normalized: string;
  notes: string | null;
  email: string | null;
  created_at: string;
};

export type PhotoRow = {
  id: string;
  client_id: string;
  photo_type: string;
  storage_path: string;
  image_url: string;
  service_id: string | null;
  photo_date: string;
  notes: string | null;
  is_public: boolean;
  appointment_id: string | null;
  storage_bucket: string | null;
};

export type AppointmentRow = {
  id: string;
  client_id: string;
  client_name: string;
  client_phone: string;
  service_ids: unknown;
  date: string;
  time_slot: string;
  status: string;
  total_price: number | string;
  list_total_price?: number | string | null;
  collected_amount?: number | string | null;
  notes: string | null;
  completion_notes?: string | null;
  created_at: string;
  staff_id?: string | null;
  source?: string | null;
  allow_overlap?: boolean | null;
};

export type StaffRow = {
  id: string;
  display_name: string;
  sort_order: number;
};

export type GalleryAssetRow = {
  id: string;
  storage_path: string;
  sort_order: number;
  alt_text: string | null;
  created_at: string;
};

export type TransactionRow = {
  id: string;
  type: string;
  amount: number | string;
  category: string;
  description: string;
  date: string;
  appointment_id: string | null;
};

export function mapServiceRow(row: ServiceRow): Service {
  return {
    id: row.id,
    name: row.name,
    category: row.category as ServiceCategory,
    price: Number(row.price),
    duration: row.duration,
    description: row.description ?? undefined,
    isActive: row.is_active,
  };
}

export function mapClientRow(row: ClientRow, photos: ClientPhoto[]): Client {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email ?? undefined,
    createdAt: row.created_at,
    notes: row.notes ?? undefined,
    photos,
  };
}

export function mapPhotoRow(row: PhotoRow): ClientPhoto {
  return {
    id: row.id,
    clientId: row.client_id,
    type: row.photo_type as 'before' | 'after',
    imageData: row.image_url,
    storagePath: row.storage_path,
    storageBucket: row.storage_bucket ?? undefined,
    appointmentId: row.appointment_id ?? undefined,
    serviceId: row.service_id ?? undefined,
    date: row.photo_date,
    notes: row.notes ?? undefined,
    isPublic: row.is_public,
  };
}

function coerceTimeSlot(raw: string): TimeSlot {
  return (BOOKING_TIME_SLOTS as readonly string[]).includes(raw) ? (raw as TimeSlot) : '10:00';
}

export function mapAppointmentRow(row: AppointmentRow): Appointment {
  const ids = Array.isArray(row.service_ids)
    ? (row.service_ids as string[])
    : typeof row.service_ids === 'string'
      ? (JSON.parse(row.service_ids) as string[])
      : [];

  const list = Number(row.list_total_price ?? row.total_price);
  const collected =
    row.collected_amount === null || row.collected_amount === undefined
      ? undefined
      : Number(row.collected_amount);

  return {
    id: row.id,
    clientId: row.client_id,
    clientName: row.client_name,
    clientPhone: row.client_phone,
    serviceIds: ids,
    date: row.date,
    timeSlot: coerceTimeSlot(row.time_slot),
    status: row.status as Appointment['status'],
    listTotalPrice: list,
    collectedAmount: collected,
    totalPrice: Number(row.total_price),
    notes: row.notes ?? undefined,
    completionNotes: row.completion_notes ?? undefined,
    createdAt: row.created_at,
    staffId: row.staff_id ?? '',
    source: (row.source ?? 'web') as AppointmentSource,
    allowOverlap: Boolean(row.allow_overlap),
  };
}

export function mapStaffRow(row: StaffRow): Staff {
  return {
    id: row.id,
    displayName: row.display_name,
    sortOrder: row.sort_order,
  };
}

export function mapGalleryAssetRow(row: GalleryAssetRow, publicUrl: string): GalleryAsset {
  return {
    id: row.id,
    storagePath: row.storage_path,
    sortOrder: row.sort_order,
    altText: row.alt_text ?? undefined,
    imageUrl: publicUrl,
  };
}

export function mapTransactionRow(row: TransactionRow): Transaction {
  return {
    id: row.id,
    type: row.type as Transaction['type'],
    amount: Number(row.amount),
    category: row.category,
    description: row.description,
    date: row.date,
    appointmentId: row.appointment_id ?? undefined,
  };
}
