/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#DBEAFE',
        },
        success: {
          DEFAULT: '#16A34A',
          hover: '#15803D',
          light: '#DCFCE7',
        },
        warning: {
          DEFAULT: '#F59E0B',
          hover: '#D97706',
          light: '#FEF3C7',
        },
        danger: {
          DEFAULT: '#DC2626',
          hover: '#B91C1C',
          light: '#FEE2E2',
        },
        govbg: '#F8FAFC',
        govcard: '#FFFFFF',
        govtext: {
          dark: '#111827',
          muted: '#4B5563',
          light: '#9CA3AF',
        },
        govborder: '#E5E7EB',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        none: '0',
        sm: '0.375rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      },
      fontSize: {
        xs: '0.8125rem', // ~13px
        sm: '0.9375rem', // ~15px
        base: '1.0625rem', // ~17px
        lg: '1.25rem', // ~20px
        xl: '1.5rem', // ~24px
        '2xl': '1.75rem', // ~28px
        '3xl': '2.25rem', // ~36px
      }
    },
  },
  plugins: [],
}
