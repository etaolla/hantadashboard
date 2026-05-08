/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          900: '#080b0f',
          800: '#0f1419',
          700: '#161d26',
          600: '#1e2a38',
          500: '#263548',
        },
        accent: {
          red:   '#e8313a',
          amber: '#e8a231',
          green: '#39d353',
          cyan:  '#22d3ee',
          muted: '#64748b',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'grid-overlay':
          'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-sm': '32px 32px',
      },
    },
  },
  plugins: [],
}
