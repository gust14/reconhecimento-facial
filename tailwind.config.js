/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'custom-color': '#020617', 
      },
      fontFamily: {
        display: ['Roboto Condensed', 'sans-serif'],
        secondary: ['Fresca', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
