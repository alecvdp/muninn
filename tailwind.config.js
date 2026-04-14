/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: 'hsl(var(--bg-surface) / <alpha-value>)',
        muted: 'hsl(var(--bg-muted) / <alpha-value>)',
        elevated: 'hsl(var(--bg-elevated) / <alpha-value>)',
        high: 'hsl(var(--text-high) / <alpha-value>)',
        normal: 'hsl(var(--text-normal) / <alpha-value>)',
        low: 'hsl(var(--text-low) / <alpha-value>)',
        border: 'hsl(var(--border) / <alpha-value>)',
        brand: 'hsl(var(--brand) / <alpha-value>)',
        'brand-hover': 'hsl(var(--brand-hover) / <alpha-value>)',
        success: 'hsl(var(--success) / <alpha-value>)',
        error: 'hsl(var(--error) / <alpha-value>)',
        info: 'hsl(var(--info) / <alpha-value>)',
        warning: 'hsl(var(--warning) / <alpha-value>)',
        'status-idea': 'hsl(var(--status-idea) / <alpha-value>)',
        'status-todo': 'hsl(var(--status-todo) / <alpha-value>)',
        'status-in-progress': 'hsl(var(--status-in-progress) / <alpha-value>)',
        'status-paused': 'hsl(var(--status-paused) / <alpha-value>)',
        'status-done': 'hsl(var(--status-done) / <alpha-value>)',
        'category-using': 'hsl(var(--category-using) / <alpha-value>)',
        'category-watching': 'hsl(var(--category-watching) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
