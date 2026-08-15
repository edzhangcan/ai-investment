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
        canvas: 'var(--bg-canvas)',
        surface: {
          DEFAULT: 'var(--bg-surface)',
          subtle: 'var(--bg-surface-subtle)',
          hover: 'var(--bg-surface-hover)',
        },
        border: {
          subtle: 'var(--border-subtle)',
          strong: 'var(--border-strong)',
        },
        content: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        brand: {
          DEFAULT: 'var(--accent-brand)',
          hover: 'var(--accent-brand-hover)',
          bg: 'var(--accent-brand-bg)',
          border: 'var(--accent-brand-border)',
        },
        positive: {
          DEFAULT: 'var(--accent-positive)',
          bg: 'var(--accent-positive-bg)',
          border: 'var(--accent-positive-border)',
        },
        negative: {
          DEFAULT: 'var(--accent-negative)',
          bg: 'var(--accent-negative-bg)',
          border: 'var(--accent-negative-border)',
        },
        warning: {
          DEFAULT: 'var(--accent-warning)',
          bg: 'var(--accent-warning-bg)',
          border: 'var(--accent-warning-border)',
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
        'prism-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'prism-card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}
