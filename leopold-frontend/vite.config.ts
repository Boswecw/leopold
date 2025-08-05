// vite.config.ts - Correct configuration for SvelteKit + Tailwind
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    alias: {
      '$lib': path.resolve('./src/lib'),
      '$stores': path.resolve('./src/lib/stores'),
      '$components': path.resolve('./src/lib/components'),
      '$types': path.resolve('./src/lib/types'),
      '$utils': path.resolve('./src/lib/utils')
    }
  },
  server: {
    host: true,
    port: 5173
  },
  preview: {
    host: true,
    port: 4173
  }
 });