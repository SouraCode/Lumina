/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          400: '#ff9b57',
          500: '#FD802E', /* Requested Orange */
          600: '#e06b23',
        },
        brand: '#233D4C', /* Requested Teal */
        'brand-dark': '#1e323f',
        'brand-light': '#2e5063',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
