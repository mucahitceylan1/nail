// src/utils/validators.ts
// Nail Lab. by İldem — Form Validation Utilities

import { getToday } from './formatters';
import { compareStudioYmd } from './studioTime';

export interface ValidationResult {
  isValid: boolean;
  message: string;
}

const OK: ValidationResult = { isValid: true, message: '' };

export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  if (!value.trim()) {
    return { isValid: false, message: `${fieldName} zorunludur.` };
  }
  return OK;
};

export const validatePhone = (phone: string): ValidationResult => {
  const cleaned = phone.replace(/\D/g, '');
  if (!cleaned) {
    return { isValid: false, message: 'Telefon numarası zorunludur.' };
  }
  if (cleaned.length < 10 || cleaned.length > 11) {
    return { isValid: false, message: 'Geçerli bir telefon numarası girin.' };
  }
  if (cleaned.length === 11 && !cleaned.startsWith('0')) {
    return { isValid: false, message: 'Telefon numarası 0 ile başlamalıdır.' };
  }
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return { isValid: false, message: 'Geçerli bir telefon numarası girin.' };
  }
  return OK;
};

export const validateName = (name: string): ValidationResult => {
  if (!name.trim()) {
    return { isValid: false, message: 'Ad soyad zorunludur.' };
  }
  if (name.trim().length < 2) {
    return { isValid: false, message: 'Ad soyad en az 2 karakter olmalıdır.' };
  }
  return OK;
};

export const validateAmount = (amount: number): ValidationResult => {
  if (isNaN(amount) || amount <= 0) {
    return { isValid: false, message: 'Geçerli bir tutar girin.' };
  }
  return OK;
};

export const validateDate = (date: string): ValidationResult => {
  if (!date) {
    return { isValid: false, message: 'Tarih seçimi zorunludur.' };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
    return { isValid: false, message: 'Geçerli bir tarih seçin.' };
  }
  const [y, m, d] = date.split('-').map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) {
    return { isValid: false, message: 'Geçerli bir tarih seçin.' };
  }
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  if (d > last) {
    return { isValid: false, message: 'Geçerli bir tarih seçin.' };
  }
  return OK;
};

export const validateFutureDate = (date: string): ValidationResult => {
  const dateValidation = validateDate(date);
  if (!dateValidation.isValid) return dateValidation;

  const today = getToday();
  if (compareStudioYmd(date, today) < 0) {
    return { isValid: false, message: 'Geçmiş bir tarih seçemezsiniz.' };
  }
  return OK;
};
