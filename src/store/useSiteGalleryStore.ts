import { create, type StateCreator } from 'zustand';
import type { GalleryAsset } from '../types';

interface SiteGalleryStore {
  assets: GalleryAsset[];
  hydrateFromServer: (rows: GalleryAsset[]) => void;
  reset: () => void;
}

const slice: StateCreator<SiteGalleryStore> = (set) => ({
  assets: [],
  hydrateFromServer: (rows) => set({ assets: rows }),
  reset: () => set({ assets: [] }),
});

export const useSiteGalleryStore = create<SiteGalleryStore>()(slice);
