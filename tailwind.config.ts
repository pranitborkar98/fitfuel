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
        // ── Brand ──
        bg:          '#0a0a0a',
        surface:     '#111111',
        elevated:    '#1a1a1a',
        muted:       '#222222',
        accent:      '#84cc16',   // lime-500
        'accent-dark':'#65a30d',  // lime-600
        border:      '#2a2a2a',

        // ── Diet ──
        veg:    '#22c55e',
        egg:    '#f59e0b',
        nonveg: '#ef4444',

        // ── Semantic ──
        success: '#22c55e',
        warning: '#f59e0b',
        error:   '#ef4444',
        info:    '#3b82f6',
      },

      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Raleway', 'Inter', 'sans-serif'],
      },

      fontSize: {
        '7xl': ['4.5rem',  { lineHeight: '1.1' }],
        '6xl': ['3.75rem', { lineHeight: '1.1' }],
        '5xl': ['3rem',    { lineHeight: '1.15' }],
      },

      borderRadius: {
        DEFAULT: '0.5rem',
        'xl':    '1rem',
        '2xl':   '1.5rem',
      },

      boxShadow: {
        lime: '0 0 20px #84cc1633',
        dark: '0 10px 15px -3px rgb(0 0 0 / 0.7)',
      },

      animation: {
        'fade-in':    'fadeIn 0.3s ease forwards',
        'slide-up':   'slideUp 0.4s ease forwards',
        'pulse-lime': 'pulseLime 2s ease-in-out infinite',
        'shimmer':    'shimmer 1.5s infinite',
      },

      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        pulseLime: {
          '0%, 100%': { boxShadow: '0 0 0 0 #84cc1633' },
          '50%':      { boxShadow: '0 0 0 8px transparent' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },

      screens: {
        xs:  '375px',
        sm:  '640px',
        md:  '768px',
        lg:  '1024px',
        xl:  '1280px',
        '2xl':'1536px',
      },
    },
  },
  plugins: [],
}

export default config
