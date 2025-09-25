/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pink': {
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
        },
        'purple': {
          500: '#a855f7',
        },
        'gray': {
          900: '#111827',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
        }
      },
    },
  },
  plugins: [],
}

