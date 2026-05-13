import 'i18next';
import type tr from './locales/tr.json';

type NavNs = typeof tr.nav;
type CommonNs = typeof tr.common;
type HeroNs = typeof tr.hero;
type HomeNs = typeof tr.home;
type ServicesNs = typeof tr.services;
type GalleryNs = typeof tr.gallery;
type AppointmentNs = typeof tr.appointment;
type CareNs = typeof tr.care;
type FooterNs = typeof tr.footer;
type PageHomeNs = typeof tr.pageHome;
type AdminNs = typeof tr.admin;

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      nav: NavNs;
      common: CommonNs;
      hero: HeroNs;
      home: HomeNs;
      services: ServicesNs;
      gallery: GalleryNs;
      appointment: AppointmentNs;
      care: CareNs;
      footer: FooterNs;
      pageHome: PageHomeNs;
      admin: AdminNs;
    };
  }
}
