/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1944F1',
          blueHover: '#1335C4',
          electric: '#2563EB',
          darkBg: '#05070F',
          cardBg: '#0F172A',
          borderDark: '#1E293B',
          accent: '#38BDF8'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 50px -10px rgba(25, 68, 241, 0.6)',
        'glow-lg': '0 0 80px -5px rgba(25, 68, 241, 0.7)',
        'button-glow': '0 4px 20px -2px rgba(25, 68, 241, 0.5)'
      },
      backgroundImage: {
        'skeleton-gradient': 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 37%, #F1F5F9 63%)',
      },
      keyframes: {
        'skeleton-loading': {
          '0%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0 50%' },
        },
      },
      animation: {
        'skeleton-loading': 'skeleton-loading 1.4s ease infinite',
      }
    },
  },
  plugins: [],
}
