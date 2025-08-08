/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  
  theme: {
    extend: {
      // Leopold Nature-Inspired Color Palette
      colors: {
        // Primary Colors
        'primary-forest': '#2F5D50',
        'primary-earth': '#5C4033', 
        'primary-sky': '#76B4BD',
        
        // Secondary Colors
        'secondary-moss': '#A3B18A',
        'secondary-goldenrod': '#DAA520',
        'secondary-sand': '#F3E9DC',
        
        // Neutrals
        'neutral-off-white': '#FAFAF9',
        'neutral-stone-gray': '#4B4B4B',
        'neutral-soft-black': '#1C1C1C',
        
        // Audio Visualization
        'audio-waveform': '#76B4BD',
        'audio-spectrogram': '#2F5D50', 
        'audio-recording': '#dc2626',
        
        // Nature semantic colors
        forest: {
          50: '#f0f7f4',
          100: '#dcebe3',
          200: '#bbd8ca',
          300: '#8fbfa8',
          400: '#649f85',
          500: '#47846b',
          600: '#2F5D50', // Primary forest
          700: '#2a4a42',
          800: '#243d37',
          900: '#1f322e',
        },
        
        sky: {
          50: '#f0f9fa',
          100: '#daf1f4',
          200: '#b8e3ea',
          300: '#8bd0db',
          400: '#76B4BD', // Primary sky
          500: '#4ea5b1',
          600: '#398695',
          700: '#2f6d7a',
          800: '#285965',
          900: '#244a55',
        },
        
        moss: {
          50: '#f4f6f2',
          100: '#e6eade',
          200: '#ced6c0',
          300: '#A3B18A', // Secondary moss
          400: '#8ea372',
          500: '#778a58',
          600: '#5d6d44',
          700: '#495537',
          800: '#3d462f',
          900: '#343c29',
        }
      },
      
      // Typography
      fontFamily: {
        'nature': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'mono': ['JetBrains Mono', 'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Consolas', 'Courier New', 'monospace'],
      },
      
      // Box Shadows
      boxShadow: {
        'nature': '0 4px 6px -1px rgba(47, 93, 80, 0.1), 0 2px 4px -1px rgba(47, 93, 80, 0.06)',
        'nature-lg': '0 10px 15px -3px rgba(47, 93, 80, 0.1), 0 4px 6px -2px rgba(47, 93, 80, 0.05)',
        'nature-xl': '0 20px 25px -5px rgba(47, 93, 80, 0.1), 0 10px 10px -5px rgba(47, 93, 80, 0.04)',
      },
      
      // Animation
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
      
      // Container queries for responsive design
      screens: {
        'xs': '475px',
        '3xl': '1920px',
      },
      
      // Custom utilities for Leopold
      backdropBlur: {
        'xs': '2px',
      },
      
      // Aspect ratios for media content
      aspectRatio: {
        'audio': '16 / 3',
        'spectrogram': '4 / 1',
      },
    },
  },
  
  // Plugins
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class', // Use class-based forms
    }),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/container-queries'),
    
    // Custom plugin for Leopold-specific utilities
    function({ addUtilities, addComponents, theme }) {
      // Add custom components
      addComponents({
        '.btn-nature': {
          '@apply inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200': {},
          '&:focus': {
            '@apply outline-none ring-2 ring-primary-forest ring-offset-2': {},
          },
        },
        
        '.card-nature': {
          '@apply bg-white rounded-lg shadow-nature overflow-hidden transition-shadow duration-200': {},
          '&:hover': {
            '@apply shadow-nature-lg': {},
          },
        },
        
        '.input-nature': {
          '@apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-primary-forest transition-colors duration-200': {},
        },
      });
      
      // Add custom utilities
      addUtilities({
        '.text-balance': {
          'text-wrap': 'balance',
        },
        '.bg-gradient-nature': {
          'background': `linear-gradient(135deg, ${theme('colors.primary-forest')} 0%, ${theme('colors.primary-sky')} 100%)`,
        },
        '.bg-gradient-moss': {
          'background': `linear-gradient(135deg, ${theme('colors.secondary-moss')} 0%, ${theme('colors.secondary-sand')} 100%)`,
        },
      });
    },
  ],
  
  // Ensure Tailwind processes all files correctly
  future: {
    hoverOnlyWhenSupported: true,
  },
}