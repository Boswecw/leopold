// svelte.config.js
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: preprocess(),

  kit: {
    alias: {
      $lib: 'src/lib',
      $components: 'src/lib/components',
      $stores: 'src/lib/stores',
      $types: 'src/lib/types',
      $utils: 'src/lib/utils',
    }
  }
};

export default config;
