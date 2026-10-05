import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import oxlint from 'vite-plugin-oxlint';
import { VitePWA } from 'vite-plugin-pwa';

// the background of the app (`theme.ts`)
const THEME_COLOR = '#111619';

export default defineConfig({
  define: {
    'import.meta.env.VERSION': JSON.stringify(process.env.VERSION || process.env.RENDER_GIT_COMMIT)
  },
  // reachable from the local network too, e.g. from a phone (`vite preview` takes it over)
  server: {
    host: true
  },
  worker: {
    format: 'es'
  },
  plugins: [
    react(),
    oxlint(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // of the font only its latin subset, the others are cached when a text needs them (e.g. a place name)
        globPatterns: ['**/*.{js,css,html,png,ico,svg,webmanifest}', '**/inter-latin-wght-normal-*.woff2'],
        runtimeCaching: [
          {
            urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.endsWith('.woff2'),
            handler: 'CacheFirst',
            options: { cacheName: 'fonts', expiration: { maxEntries: 20 } }
          },
          {
            // the preview images are served without any cache headers, so the service worker keeps them instead
            urlPattern: ({ url }) =>
              url.origin === 'https://alasky.cds.unistra.fr' &&
              url.pathname.startsWith('/hips-image-services/hips2fits'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'previews',
              expiration: { maxEntries: 2000, maxAgeSeconds: 365 * 24 * 3600 },
              cacheableResponse: { statuses: [200] }
            }
          }
        ]
      },
      manifest: {
        name: 'Astroffers',
        short_name: 'Astroffers',
        description: 'Take offers to watch at given nights by the NGC 2000 and the Messier catalogs',
        start_url: '.',
        display: 'standalone',
        theme_color: THEME_COLOR,
        background_color: THEME_COLOR,
        icons: [
          ...[48, 72, 96, 144, 192, 512].map(size => ({
            src: `/icons/icon-${size}x${size}.png`,
            sizes: `${size}x${size}`,
            type: 'image/png'
          })),
          { src: '/icons/icon-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ]
});
