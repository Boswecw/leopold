import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  
  resolve: {
    alias: {
      $lib: './src/lib'
    }
  },

  server: {
    port: 5173,
    host: true
  },

  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,ts}']
  }
});