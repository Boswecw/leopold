// tailwind.config.js - Leopold Design System
/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme: {
      extend: {
        colors: {
          // Leopold Nature-Inspired Palette
          primary: {
            forest: '#2F5D50',      // Forest Green - Primary buttons, headers
            earth: '#5C4033',       // Earth Brown - Navigation, footer, accents
            sky: '#76B4BD',         // Sky Blue - Links, highlights, hover states
          },
          secondary: {
            moss: '#A3B18A',        // Moss Green - Backgrounds, cards, passive UI
            goldenrod: '#DAA520',   // Goldenrod - Alerts, badges, call-to-action
            sand: '#F3E9DC',        // Sand Beige - Backgrounds, contrast for text
          },
          neutral: {
            'off-white': '#FAFAF9', // Off-White - Page backgrounds
            'stone-gray': '#4B4B4B', // Stone Gray - Body text
            'soft-black': '#1C1C1C', // Soft Black - Headlines, strong contrast
          },
          // Audio visualization colors
          audio: {
            waveform: '#76B4BD',    // Sky blue for waveforms
            spectrogram: '#2F5D50', // Forest green for spectrograms
            recording: '#dc2626',   // Red for recording state
          }
        },
        fontFamily: {
          'nature': ['Inter', 'system-ui', 'sans-serif'],
          'mono': ['JetBrains Mono', 'monospace'],
        },
        animation: {
          'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          'bounce-gentle': 'bounce 1s ease-in-out infinite',
          'fade-in': 'fadeIn 0.5s ease-in-out',
          'slide-up': 'slideUp 0.3s ease-out',
          'recording-pulse': 'recordingPulse 1.5s ease-in-out infinite',
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
          slideUp: {
            '0%': { transform: 'translateY(10px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
          },
          recordingPulse: {
            '0%, 100%': { opacity: '1' },
            '50%': { opacity: '0.7' },
          },
        },
        boxShadow: {
          'nature': '0 4px 6px -1px rgba(47, 93, 80, 0.1), 0 2px 4px -1px rgba(47, 93, 80, 0.06)',
          'nature-lg': '0 10px 15px -3px rgba(47, 93, 80, 0.1), 0 4px 6px -2px rgba(47, 93, 80, 0.05)',
        }
      },
    },
    plugins: [
      require('@tailwindcss/forms'),
      require('@tailwindcss/typography'),
      require('@tailwindcss/aspect-ratio'),
    ],
  }
  
  // vite.config.js - Enhanced for audio processing
  import { sveltekit } from '@sveltejs/kit/vite';
  import { defineConfig } from 'vite';
  import { SvelteKitPWA } from '@vite-pwa/sveltekit';
  
  export default defineConfig({
    plugins: [
      sveltekit(),
      SvelteKitPWA({
        srcDir: './src',
        mode: 'development',
        strategies: 'injectManifest',
        filename: 'prompt-sw.ts',
        registerType: 'autoUpdate',
        manifest: {
          short_name: 'Leopold',
          name: 'Leopold Nature Observer',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          theme_color: '#2F5D50',
          background_color: '#FAFAF9',
          icons: [
            {
              src: '/icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/icons/icon-512.png',
              sizes: '512x512', 
              type: 'image/png'
            }
          ]
        },
        injectManifest: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,webp,woff,woff2}']
        },
        devOptions: {
          enabled: true,
          type: 'module',
          navigateFallback: '/'
        }
      })
    ],
    define: {
      global: 'globalThis',
    },
    server: {
      fs: {
        allow: ['..']
      }
    },
    optimizeDeps: {
      include: ['leaflet', 'wavesurfer.js']
    },
    build: {
      target: 'esnext',
      rollupOptions: {
        output: {
          manualChunks: {
            'audio-processing': ['wavesurfer.js', 'recordrtc'],
            'mapping': ['leaflet'],
            'ui-components': ['lucide-svelte'],
          }
        }
      }
    }
  });
  
  // svelte.config.js
  import adapter from '@sveltejs/adapter-auto';
  import { vitePreprocess } from '@sveltejs/kit/vite';
  
  /** @type {import('@sveltejs/kit').Config} */
  const config = {
    preprocess: vitePreprocess(),
  
    kit: {
      adapter: adapter(),
      alias: {
        $components: './src/lib/components',
        $stores: './src/lib/stores', 
        $utils: './src/lib/utils',
        $types: './src/lib/types',
        $api: './src/lib/api'
      },
      serviceWorker: {
        register: false
      },
      files: {
        serviceWorker: 'src/prompt-sw.ts'
      }
    }
  };
  
  export default config;
  
  // package.json scripts section
  {
    "scripts": {
      "dev": "vite dev",
      "build": "vite build",
      "preview": "vite preview",
      "test": "vitest",
      "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
      "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
      "lint": "eslint .",
      "format": "prettier --write .",
      "audio:test": "node scripts/test-audio.js"
    }
  }
  
  // .eslintrc.cjs
  module.exports = {
    root: true,
    extends: [
      'eslint:recommended',
      '@typescript-eslint/recommended',
      'prettier'
    ],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    parserOptions: {
      sourceType: 'module',
      ecmaVersion: 2020,
      extraFileExtensions: ['.svelte']
    },
    env: {
      browser: true,
      es2017: true,
      node: true
    },
    overrides: [
      {
        files: ['*.svelte'],
        processor: 'svelte3/svelte3'
      }
    ],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn'
    }
  };
  
  // .prettierrc
  {
    "useTabs": false,
    "singleQuote": true,
    "trailingComma": "es5",
    "printWidth": 100,
    "plugins": ["prettier-plugin-svelte"],
    "overrides": [
      {
        "files": "*.svelte",
        "options": {
          "parser": "svelte"
        }
      }
    ]
  }