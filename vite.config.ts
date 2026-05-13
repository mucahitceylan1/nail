// vite.config.ts
// Nail Lab. by İldem — Build Configuration
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { seoBuildArtifactsPlugin } from './vite-plugin-seo-build';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    seoBuildArtifactsPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      /** Dev’de `/manifest.webmanifest` JSON üretilir; aksi halde SPA HTML dönüp “Manifest syntax error” olur. */
      devOptions: { enabled: false },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'logo.svg', 'og-image.png'],
      manifest: {
        name: 'Nail Lab. by İldem',
        short_name: 'Nail Lab.',
        description: 'Premium Nail Studio by İldem',
        theme_color: '#0A0A0A',
        background_color: '#0A0A0A',
        display: 'standalone',
        icons: [
          {
            src: 'logo.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'logo.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
});
