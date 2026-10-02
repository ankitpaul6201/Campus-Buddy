/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#0860E8',
          deepBlue: '#0751C6',
          dark: '#191D25',
          secondary: '#89919E',
          paleBlue: '#F5FAFE',
          lightLine: '#9DD6FA',
          orange: '#FF874B',
          border: '#E8EBF0',
          btnDark: '#191C24',
        }
      },
      fontFamily: {
        sans: ['"Google Sans"', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 8px 30px rgba(8, 96, 232, 0.08)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'float': '0 20px 40px -15px rgba(25, 29, 37, 0.12)',
        'pill': '0 4px 14px rgba(25, 29, 37, 0.1)',
      }
    },
  },
  plugins: [],
}
