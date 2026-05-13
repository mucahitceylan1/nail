// src/types/index.ts
// Nail Lab. by İldem — Type Definitions

/** Per-locale strings for dynamic content (services, CMS). */
export type LocalizedStringMap = Partial<Record<'tr' | 'en' | 'ru' | 'ar', string>>;

export type ServiceCategory =
  | 'kalici_oje'
  | 'protez_tirnak'
  | 'protez_bakim'
  | 'manikur'
  | 'pedikur'
  | 'jel_guclendirme'
  | 'tirnak_yeme_tedavisi'
  | 'kas_sekillendirme'
  | 'artlar'
  | 'tirnak_tamiri'
  | 'diger';

export interface Service {
  id: string;
  name: string;
  /** Optional CMS-style translations; falls back to `name` / `description`. */
  nameI18n?: LocalizedStringMap;
  category: ServiceCategory;
  price: number;
  duration: number;
  description?: string;
  descriptionI18n?: LocalizedStringMap;
  image?: string;
  isActive: boolean;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  createdAt: string;
  notes?: string;
  photos: ClientPhoto[];
}

export interface ClientPhoto {
  id: string;
  clientId: string;
  type: 'before' | 'after';
  imageData: string;
  /** Supabase Storage nesne yolu (silme için) */
  storagePath?: string;
  storageBucket?: string;
  appointmentId?: string;
  serviceId?: string;
  date: string;
  notes?: string;
  isPublic?: boolean;
}

export const BOOKING_TIME_SLOTS = [
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
] as const;
export type TimeSlot = (typeof BOOKING_TIME_SLOTS)[number];

export type AppointmentSource = 'web' | 'phone' | 'walk_in' | 'admin';

/** Seed UUID migration `003_staff_hours_gallery_complete.sql` ile aynı olmalı. */
export const STAFF_ILDEM_ID = '019bd1e2-1d45-4888-9520-40f2d5dabb01';
export const STAFF_TUGBA_ID = '019bd1e2-1d45-4888-9520-40f2d5dabb02';

export interface Staff {
  id: string;
  displayName: string;
  sortOrder: number;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  serviceIds: string[];
  date: string;
  timeSlot: TimeSlot;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  /** Katalog toplamı (liste fiyatı) */
  listTotalPrice: number;
  /** Tahsil edilen; tamamlanınca doldurulur */
  collectedAmount?: number;
  /** Randevu satırı (geriye dönük); genelde listTotalPrice ile aynı tutulur */
  totalPrice: number;
  notes?: string;
  completionNotes?: string;
  createdAt: string;
  staffId: string;
  source: AppointmentSource;
  allowOverlap?: boolean;
}

export interface GalleryAsset {
  id: string;
  storagePath: string;
  sortOrder: number;
  altText?: string;
  imageUrl: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  appointmentId?: string;
}

export type IncomeCategory = 'randevu' | 'bahsis' | 'urun_satisi';
export type ExpenseCategory = 'malzeme' | 'kira' | 'fatura' | 'diger';

export interface MonthSummary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  byCategory: Record<string, number>;
}

export const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  kalici_oje: 'Kalıcı Oje',
  protez_tirnak: 'Protez Tırnak',
  protez_bakim: 'Protez Bakım',
  manikur: 'Manikür',
  pedikur: 'Pedikür',
  jel_guclendirme: 'Jel Güçlendirme',
  tirnak_yeme_tedavisi: 'Tırnak Yeme Tedavisi',
  kas_sekillendirme: 'Kaş Şekillendirme',
  artlar: 'Artlar (Nail Art)',
  tirnak_tamiri: 'Tırnak Tamiri (Kırık)',
  diger: 'Diğer',
};

export const TIME_SLOT_LABELS: Record<TimeSlot, string> = {
  '10:00': '10:00',
  '11:00': '11:00',
  '12:00': '12:00',
  '13:00': '13:00',
  '14:00': '14:00',
  '15:00': '15:00',
  '16:00': '16:00',
  '17:00': '17:00',
  '18:00': '18:00',
  '19:00': '19:00',
};

export const INITIAL_SERVICES: Service[] = [
  {
    id: '1',
    name: 'Kalıcı Oje',
    nameI18n: { tr: 'Kalıcı Oje', en: 'Gel polish', ru: 'Гель-лак', ar: 'طلاء جل دائم' },
    description: 'Profesyonel hazırlık ve uzun süre kalıcı renk.',
    descriptionI18n: {
      tr: 'Profesyonel hazırlık ve uzun süre kalıcı renk.',
      en: 'Professional prep and long-lasting colour.',
      ru: 'Профессиональная подготовка и стойкий цвет.',
      ar: 'تحضير احترافي ولون يدوم طويلاً.',
    },
    category: 'kalici_oje',
    price: 650,
    duration: 45,
    isActive: true,
  },
  {
    id: '2',
    name: 'Protez Tırnak',
    nameI18n: {
      tr: 'Protez Tırnak',
      en: 'Nail extensions',
      ru: 'Наращивание ногтей',
      ar: 'أظافر صناعية',
    },
    category: 'protez_tirnak',
    price: 1200,
    duration: 90,
    isActive: true,
  },
  {
    id: '3',
    name: 'Protez Bakım',
    nameI18n: {
      tr: 'Protez Bakım',
      en: 'Extension maintenance',
      ru: 'Коррекция наращивания',
      ar: 'صيانة الأظافر الصناعية',
    },
    category: 'protez_bakim',
    price: 900,
    duration: 60,
    isActive: true,
  },
  {
    id: '4',
    name: 'Manikür',
    nameI18n: { tr: 'Manikür', en: 'Manicure', ru: 'Маникюр', ar: 'مناكير' },
    category: 'manikur',
    price: 450,
    duration: 45,
    isActive: true,
  },
  {
    id: '5',
    name: 'Pedikür',
    nameI18n: { tr: 'Pedikür', en: 'Pedicure', ru: 'Педикюр', ar: 'بديكير' },
    category: 'pedikur',
    price: 600,
    duration: 60,
    isActive: true,
  },
  {
    id: '6',
    name: 'Jel Güçlendirme',
    nameI18n: {
      tr: 'Jel Güçlendirme',
      en: 'Gel strengthening',
      ru: 'Укрепление гелем',
      ar: 'تقوية الجل',
    },
    category: 'jel_guclendirme',
    price: 800,
    duration: 60,
    isActive: true,
  },
  {
    id: '7',
    name: 'Tırnak Yeme Tedavisi',
    nameI18n: {
      tr: 'Tırnak Yeme Tedavisi',
      en: 'Nail biting treatment',
      ru: 'Лечение привычки кусать ногти',
      ar: 'علاج قضم الأظافر',
    },
    category: 'tirnak_yeme_tedavisi',
    price: 750,
    duration: 75,
    isActive: true,
  },
  {
    id: '8',
    name: 'Kaş Şekillendirme',
    nameI18n: {
      tr: 'Kaş Şekillendirme',
      en: 'Brow shaping',
      ru: 'Коррекция бровей',
      ar: 'تشكيل الحواجب',
    },
    category: 'kas_sekillendirme',
    price: 350,
    duration: 30,
    isActive: true,
  },
  {
    id: '9',
    name: 'Artlar (Nail Art)',
    nameI18n: {
      tr: 'Artlar (Nail Art)',
      en: 'Nail art',
      ru: 'Нейл-арт',
      ar: 'فن الأظافر',
    },
    category: 'artlar',
    price: 250,
    duration: 30,
    isActive: true,
  },
  {
    id: '10',
    name: 'Tırnak Tamiri',
    nameI18n: {
      tr: 'Tırnak Tamiri',
      en: 'Nail repair',
      ru: 'Ремонт ногтя',
      ar: 'إصلاح الظفر',
    },
    category: 'tirnak_tamiri',
    price: 150,
    duration: 20,
    isActive: true,
  },
];
