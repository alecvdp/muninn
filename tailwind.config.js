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
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
