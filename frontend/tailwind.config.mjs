/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ops: {
          bg: '#090d16',
          panel: '#0f172a',
          border: '#1e293b',
        },
        accent: {
          cyan: '#06b6d4',
          blue: '#3b82f6',
        },
        hazard: {
          amber: '#f59e0b',
          crimson: '#ef4444',
        },
        safe: '#10b981',
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      animation: {
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-ring': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.08)' },
        },
      },
      boxShadow: {
        glow: '0 0 24px rgba(6, 182, 212, 0.25)',
        hazard: '0 0 32px rgba(239, 68, 68, 0.35)',
      },
    },
  },
  plugins: [],
};
