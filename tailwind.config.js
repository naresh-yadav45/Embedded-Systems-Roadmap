/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0F172A',
        muted: '#64748B',
        line: '#E2E8F0',
        surface: '#F8FAFC',
        brand: { DEFAULT: '#2563EB', soft: '#EFF6FF' },
        sw: '#2563EB',
        hw: '#EA580C',
        both: '#7C3AED',
        soft: '#059669',
        req: '#DB2777',
        rec: '#0891B2',
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans Variable"', '"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,.04), 0 4px 16px rgba(15,23,42,.05)',
        float: '0 8px 30px rgba(15,23,42,.12)',
      },
    },
  },
  plugins: [],
};
