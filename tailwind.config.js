/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        high: 'hsl(var(--text-high) / <alpha-value>)',
        normal: 'hsl(var(--text-normal) / <alpha-value>)',
        low: 'hsl(var(--text-low) / <alpha-value>)',
        primary: 'hsl(var(--bg-primary) / <alpha-value>)',
        secondary: 'hsl(var(--bg-secondary) / <alpha-value>)',
        panel: 'hsl(var(--bg-panel) / <alpha-value>)',
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
