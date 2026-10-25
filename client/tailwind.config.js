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
        transit: {
          void: '#FAFCFF',
          card: '#FFFFFF',
          border: '#E2E8F0',
          cyan: '#0284C7',
          blue: '#2563EB',
          emerald: '#059669',
          crimson: '#E11D48',
          amber: '#D97706',
          ice: '#0F172A',
          muted: '#64748B'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      animation: {
        'sonar': 'sonar-wave 1.8s infinite cubic-bezier(0.2, 0.8, 0.2, 1)',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
};
