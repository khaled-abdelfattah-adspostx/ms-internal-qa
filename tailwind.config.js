/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },      colors: {
        // MomentScience brand colors - based on their website
        brand: {
          primary: '#FF4B1F', // MomentScience orange
          secondary: '#FF6B35', // MomentScience red-orange
          tertiary: '#1a1a2e', // Dark navy from their site
          gray: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a',
          }
        },
        // Extended gradient colors for MomentScience branding
        orange: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
        },
        red: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
