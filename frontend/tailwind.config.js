/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        prism: {
          gold: '#F59E0B',
          'gold-light': '#FBBF24',
          'gold-dark': '#D97706',
          cyan: '#38BDF8',
          'cyan-deep': '#0EA5E9',
          'cyan-dark': '#0284C7',
          cobalt: '#2563EB',
          'cobalt-deep': '#1D4ED8',
          'cobalt-dark': '#1E3A8A',
          rose: '#F43F5E',
          'rose-dark': '#E11D48',
          emerald: '#10B981',
          'emerald-dark': '#059669',
        },
      },
      fontFamily: {
        sans: [
          'Plus Jakarta Sans',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'PingFang SC',
          'Noto Sans SC',
          'Microsoft YaHei',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'Roboto Mono',
          'monospace',
        ],
      },
      boxShadow: {
        'prism-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.08)',
        'prism-card': '0 4px 16px -2px rgba(0, 0, 0, 0.06)',
        'prism-card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.35)',
      },
    },
  },
  plugins: [],
}
