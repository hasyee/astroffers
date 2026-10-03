import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import oxlint from 'vite-plugin-oxlint';
import { VitePWA } from 'vite-plugin-pwa';
import packageJson from './package.json' with { type: 'json' };

const THEME_COLOR = '#111418';

export default defineConfig({
  define: {
    'import.meta.env.VERSION': JSON.stringify(process.env.VERSION || process.env.RENDER_GIT_COMMIT),
    'import.meta.env.APP_VERSION': JSON.stringify(packageJson.version)
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
        globPatterns: ['**/*.{js,css,html,png,ico,svg,webmanifest}']
      },
      manifest: {
        name: 'Astroffers',
        short_name: 'Astroffers',
        description: 'Take offers to watch at given nights by the NGC2000 catalog',
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
