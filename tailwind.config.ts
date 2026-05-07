import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#FEF0F5',
          100: '#FCDDE7',
          200: '#F9CADC',
          300: '#F5B8C8',
          400: '#EE96AC',
          500: '#E37490',
          600: '#CC5272',
        },
        terracotta: {
          50:  '#FBF0EE',
          100: '#F5D6D1',
          200: '#EAAAA0',
          300: '#E08B7F',
          400: '#D97A6C',
          500: '#C45E50',
          600: '#A84338',
        },
        mauve: {
          50:  '#F7F0F5',
          100: '#EED9E9',
          200: '#D9BECE',
          300: '#C2A1B8',
          400: '#A87F9C',
          500: '#8E5E82',
        },
        nude: {
          50:  '#FDF5EF',
          100: '#F5E8DA',
          200: '#EDD5C1',
          300: '#E8C7B3',
          400: '#D9AA8F',
        },
        cocoa: {
          700: '#5C4550',
          800: '#3C2A33',
          900: '#2A1B22',
        },
        charcoal: {
          600: '#4A3F55',
          700: '#3D3347',
          800: '#2D2533',
          900: '#1F1A24',
        },
        rosegold: {
          100: '#FDE8E0',
          200: '#FAD0C4',
          300: '#F7B8A8',
          400: '#F39E8A',
          500: '#EF8670',
          600: '#D96B55',
        },
        taupe: {
          400: '#A8888F',
          500: '#8B6F76',
          600: '#6E5560',
        },
        offwhite: '#FFF7F4',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(160deg, #FFF7F4 0%, #FCDDE7 60%, #F5B8C8 100%)',
        'card-gradient': 'linear-gradient(180deg, transparent 0%, rgba(245,184,200,0.06) 100%)',
        'rose-gradient': 'linear-gradient(160deg, #FFF7F4 0%, #FCDDE7 100%)',
      },
      boxShadow: {
        'pink':      '0 4px 24px rgba(245,184,200,0.25)',
        'terra':     '0 4px 20px rgba(217,122,108,0.25)',
        'card':      '0 2px 16px rgba(60,42,51,0.06)',
        'card-hover':'0 8px 32px rgba(245,184,200,0.28)',
      },
      animation: {
        'fade-in':       'fadeIn 0.4s ease-out',
        'slide-up':      'slideUp 0.4s ease-out',
        'slide-in-right':'slideInRight 0.35s ease-out',
        'pulse-slow':    'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
