import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const dev = process.env.NODE_ENV !== 'production';
const base = dev ? '' : '/leopold';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    // Use static adapter for GitHub Pages
    adapter: adapter(),

    // Set base path for GH Pages
    paths: {
      base
    },

    // Always use trailing slash on URLs
    trailingSlash: 'always',

    // Configure path aliases
    alias: {
      $lib: 'src/lib',
      '$lib/*': 'src/lib/*'
    },

    // Configure CSP for security
    csp: {
      directives: {
        'script-src': ['self'],
        'style-src': ['self', 'unsafe-inline'],
        'img-src': ['self', 'data:', 'https:'],
        'font-src': ['self'],
        'connect-src': ['self'],
        'media-src': ['self', 'blob:']
      }
    },

    // Enable service worker for PWA
    serviceWorker: {
      register: true
    },

    // Prerender everything for static hosting
    prerender: {
      entries: ['*']
    }
  }
};

export default config;
