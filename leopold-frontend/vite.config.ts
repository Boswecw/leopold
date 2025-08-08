import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  
  // Test configuration for Vitest
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,ts}']
  },

  // Ensure proper module resolution
  resolve: {
    alias: {
      $lib: './src/lib'
    }
  },

  // Build optimization
  build: {
    target: 'ES2022'
  }
});