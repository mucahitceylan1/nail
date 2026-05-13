import { CONTACT } from '../constants/contact';

function isMobileOrTabletUa(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  if (/Android|iPhone|iPad|iPod|Mobile|IEMobile|WPDesktop|BlackBerry/i.test(ua)) {
    return true;
  }
  const ud = (navigator as Navigator & { userAgentData?: { mobile?: boolean } }).userAgentData;
  if (ud?.mobile === true) return true;
  if (typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches) {
    return true;
  }
  return false;
}

/** WhatsApp deep link: app/wa.me on phones, Web WhatsApp on desktop. */
export function getWhatsAppChatUrl(
  phoneDigits: string = CONTACT.phoneDigits
): string {
  const n = phoneDigits.replace(/\D/g, '');
  if (isMobileOrTabletUa()) {
    return `https://wa.me/${n}`;
  }
  return `https://web.whatsapp.com/send?phone=${n}`;
}
