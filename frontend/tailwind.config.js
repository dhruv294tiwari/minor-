/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mait: {
          navy: {
            50: '#F0F4F8',
            100: '#D9E2EC',
            200: '#BCCCDC',
            300: '#9FB3C8',
            400: '#627D98',
            500: '#334E68',
            600: '#243B53',
            700: '#102A43',
            800: '#0B2545',
            900: '#06162A',
          },
          crimson: {
            50: '#FDF2F4',
            100: '#FBE8EB',
            200: '#F5C6CE',
            300: '#EE9BA9',
            400: '#E05D75',
            500: '#C92A4B',
            600: '#9B1B30',
            700: '#7A1324',
            800: '#5A0B18',
            900: '#3B040D',
          },
          gold: {
            400: '#F6AD55',
            500: '#ED8936',
            600: '#DD6B20',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 0 0 1px rgba(0, 0, 0, 0.05), 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'glow-verified': '0 0 15px -3px rgba(16, 185, 129, 0.25)',
        'glow-ai': '0 0 15px -3px rgba(139, 92, 246, 0.25)',
      }
    },
  },
  plugins: [],
}
