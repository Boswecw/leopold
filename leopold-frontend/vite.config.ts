// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    sveltekit(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      manifest: {
        name: 'Leopold Nature Observer',
        short_name: 'Leopold',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2F5D50',
        icons: [
          {
            src: '/icons/icon-144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}']
      }
    })
  ]
});
