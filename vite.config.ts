import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import oxlint from 'vite-plugin-oxlint';
import { VitePWA } from 'vite-plugin-pwa';

// the background of the app (`theme.ts`)
const THEME_COLOR = '#000000';

/**
 * Of the About dialog (`import.meta.env.DESCRIPTION`), the manifest and `index.html` (`%DESCRIPTION%`: the meta
 * description, Open Graph and JSON-LD)
 */
const DESCRIPTION =
  'Finds what to observe on a given night: deep-sky objects of the NGC 2000 / Messier catalogs, and the bodies of the Solar System.';

export default defineConfig({
  define: {
    'import.meta.env.VERSION': JSON.stringify(process.env.VERSION || process.env.RENDER_GIT_COMMIT),
    'import.meta.env.DESCRIPTION': JSON.stringify(DESCRIPTION)
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
    { name: 'description', transformIndexHtml: html => html.replaceAll('%DESCRIPTION%', DESCRIPTION) },
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // of the font only its latin subset, the others are cached when a text needs them (e.g. a place name); the
        // star layers of the map too (`bin`, under the default 2 MiB limit of a file), for offline use
        globPatterns: ['**/*.{js,css,html,png,ico,svg,webmanifest,bin}', '**/inter-latin-wght-normal-*.woff2'],
        runtimeCaching: [
          {
            urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.endsWith('.woff2'),
            handler: 'CacheFirst',
            options: { cacheName: 'fonts', expiration: { maxEntries: 20 } }
          },
          {
            // the preview images, kept for offline use too (and beyond the HTTP cache, which may evict them sooner)
            urlPattern: ({ url }) => url.origin === 'https://images.astroffers.hasyee.com',
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
        description: DESCRIPTION,
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
