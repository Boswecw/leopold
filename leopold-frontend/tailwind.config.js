/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'primary-forest': '#2F5D50',
        'primary-earth': '#5C4033', 
        'primary-sky': '#76B4BD',
        'secondary-moss': '#A3B18A',
        'accent-gold': '#DAA520',
        'neutral-sand': '#F3E9DC'
      }
    }
  },
  plugins: []
};