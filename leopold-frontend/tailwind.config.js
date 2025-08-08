// tailwind.config.js - COMPLETE CONFIGURATION FOR LEOPOLD
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        // Primary Colors - Your Nature Palette
        'primary': {
          forest: '#2F5D50',
          earth: '#5C4033',
          sky: '#76B4BD',
          DEFAULT: '#2F5D50', // Makes `bg-primary` work
        },
        // Secondary Colors
        'secondary': {
          moss: '#A3B18A',
          goldenrod: '#DAA520',
          sand: '#F3E9DC',
          DEFAULT: '#A3B18A',
        },
        // Neutral Colors - Extended Scale
        'neutral': {
          'off-white': '#FAFAF9',
          'stone-gray': '#4B4B4B',
          'soft-black': '#1C1C1C',
          // Standard scale for consistency with Tailwind
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1C1C',
        },
        // Audio Specific Colors
        'audio': {
          waveform: '#76B4BD',
          spectrogram: '#2F5D50',
          recording: '#dc2626',
        },
        // Semantic Colors for UI States
        'success': '#10b981',
        'error': '#ef4444',
        'warning': '#f59e0b',
        'info': '#3b82f6',
      },
      
      // Typography
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Consolas', 'Courier New', 'monospace'],
      },
      
      // Custom Shadows
      boxShadow: {
        'nature': '0 4px 6px -1px rgba(47, 93, 80, 0.1), 0 2px 4px -1px rgba(47, 93, 80, 0.06)',
        'nature-lg': '0 10px 15px -3px rgba(47, 93, 80, 0.1), 0 4px 6px -2px rgba(47, 93, 80, 0.05)',
        'nature-xl': '0 20px 25px -5px rgba(47, 93, 80, 0.1), 0 10px 10px -5px rgba(47, 93, 80, 0.04)',
      },
      
      // Custom Animations
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-recording': 'pulse 1.5s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      
      // Keyframes for Custom Animations
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      
      // Additional Spacing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      // Additional Border Radius
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      
      // Z-Index Scale
      zIndex: {
        'dropdown': '1000',
        'sticky': '1020', 
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
        'toast': '1080',
      },
    },
  },
  
  // Plugins - Your current setup looks good
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/container-queries'), // You have this installed
  ],
}