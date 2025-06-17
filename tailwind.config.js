/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
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
      },
      animation: {
        'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-in': 'slideIn 0.6s ease-out',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-in-left': 'slideInLeft 0.6s ease-out',
        'scale-in': 'scaleIn 0.6s ease-out',
      },
      keyframes: {
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-30px)' },
          to: { opacity: '1', transform: 'translateX(0)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(30px) translateZ(0)' },
          to: { opacity: '1', transform: 'translateY(0) translateZ(0)' }
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-30px) translateZ(0)' },
          to: { opacity: '1', transform: 'translateX(0) translateZ(0)' }
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.9) translateZ(0)' },
          to: { opacity: '1', transform: 'scale(1) translateZ(0)' }
        }
      },
      backgroundImage: {
        'shimmer-gradient': 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
