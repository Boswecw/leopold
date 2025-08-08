/// <reference types="vitest" />
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
  plugins: [
    sveltekit(),
    SvelteKitPWA({
      srcDir: './src',
      mode: 'development',
      scope: '/',
      base: '/',
      manifest: {
        short_name: 'Leopold',
        name: 'Leopold Nature Observer',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: "#2F5D50",
        background_color: "#FAFAF9",
        icons: [
          {
            src: '/leopold-logo.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff,woff2}']
      },
      devOptions: {
        enabled: false,
        type: 'module'
      }
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{js,ts}']
  },
  define: {
    __DATE__: `'${new Date().toISOString()}'`,
    __RELOAD_SW__: false,
  }
});