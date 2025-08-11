// svelte.config.js
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const dev = process.env.NODE_ENV !== 'production';
const base = dev ? '' : '/leopold';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  trailingSlash: 'always',
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: '404.html',
      strict: false
    }),
    paths: { base },
    prerender: { entries: ['*'] }
    // ❌ remove serviceWorker.onUpdate — not supported
    // If you want a SW later, add src/service-worker.js and (optionally) serviceWorker: { register: true }
  }
};

export default config;
