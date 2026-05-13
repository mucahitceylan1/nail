import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_STORE_SECRET || 'nail-lab-secret-2026';

export const encrypt = (data: string): string => {
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
};

export const decrypt = (ciphertext: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    console.error('Decryption failed:', e);
    return '';
  }
};
