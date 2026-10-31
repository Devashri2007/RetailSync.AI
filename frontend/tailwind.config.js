/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#829AB1',
          500: '#627D98',
          600: '#486581',
          700: '#334E68',
          800: '#102A43',
          900: '#0B192C',
          950: '#060D17',
        },
        brand: {
          teal: '#0D9488',
          lightTeal: '#14B8A6',
          softGreen: '#10B981',
          darkNavy: '#0B192C',
        },
      },
    },
  },
  plugins: [],
};
