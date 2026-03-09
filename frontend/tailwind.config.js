/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#FF6B35', 50: '#FFF3EE', 100: '#FFE4D5', 500: '#FF6B35', 600: '#E85A24', 700: '#CC4A16' },
        secondary: { DEFAULT: '#2D3748', 500: '#2D3748' },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
