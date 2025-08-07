// tailwind.config.js - UPDATED VERSION
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        // Map your CSS variables to Tailwind classes
        'primary': {
          forest: '#2F5D50',
          earth: '#5C4033',
          sky: '#76B4BD',
        },
        'secondary': {
          moss: '#A3B18A',
          goldenrod: '#DAA520',
          sand: '#F3E9DC',
        },
        'neutral': {
          'off-white': '#FAFAF9',
          'stone-gray': '#4B4B4B',
          'soft-black': '#1C1C1C',
        },
        'audio': {
          waveform: '#76B4BD',
          spectrogram: '#2F5D50',
          recording: '#dc2626',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'nature': '0 4px 6px -1px rgba(47, 93, 80, 0.1), 0 2px 4px -1px rgba(47, 93, 80, 0.06)',
        'nature-lg': '0 10px 15px -3px rgba(47, 93, 80, 0.1), 0 4px 6px -2px rgba(47, 93, 80, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-recording': 'pulse-recording 1.5s infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}