import type { Config } from 'tailwindcss';

/**
 * Auto Loan Pro — Brand Option A: Trust & Authority
 * Tailwind CSS Configuration Extension
 *
 * Conservative fintech brand with banking heritage.
 * Serif typography, navy + gold palette, premium positioning.
 */

export const brandOptionA: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        // Primary Colors
        navy: {
          DEFAULT: '#1E3A5F',
          50: '#E8EDF4',
          100: '#D1DBE9',
          200: '#A3B7D3',
          300: '#7593BD',
          400: '#476FA7',
          500: '#1E3A5F',
          600: '#182E4C',
          700: '#122339',
          800: '#0C1726',
          900: '#060B13',
        },
        gold: {
          DEFAULT: '#D4A843',
          50: '#FAF6EC',
          100: '#F5EDD9',
          200: '#EBDBB3',
          300: '#E1C98D',
          400: '#D7B767',
          500: '#D4A843',
          600: '#AA8636',
          700: '#7F6528',
          800: '#55431B',
          900: '#2A220D',
        },

        // Neutral Colors
        charcoal: '#2D3142',
        slate: '#6B7280',
        'warm-gray': '#F5F3F0',
        'light-gray': '#E5E7EB',

        // Semantic Colors
        success: {
          DEFAULT: '#065F46',
          50: '#D1FAE5',
          100: '#A7F3D0',
          200: '#6EE7B7',
          300: '#34D399',
          400: '#10B981',
          500: '#059669',
          600: '#065F46',
          700: '#064E3B',
          800: '#022C22',
          900: '#011716',
        },
        warning: {
          DEFAULT: '#92400E',
          50: '#FEF3C7',
          100: '#FDE68A',
          200: '#FCD34D',
          300: '#FBBF24',
          400: '#F59E0B',
          500: '#D97706',
          600: '#B45309',
          700: '#92400E',
          800: '#78350F',
          900: '#451A03',
        },
        error: {
          DEFAULT: '#991B1B',
          50: '#FEE2E2',
          100: '#FECACA',
          200: '#FCA5A5',
          300: '#F87171',
          400: '#EF4444',
          500: '#DC2626',
          600: '#B91C1C',
          700: '#991B1B',
          800: '#7F1D1D',
          900: '#450A0A',
        },

        // Dark Mode Colors
        'navy-dark': '#3B5998',
        'gold-dark': '#E6B952',
        'bg-dark': '#0F1419',
        'surface-dark': '#1A1F26',
        'text-primary-dark': '#E8EAED',
        'text-secondary-dark': '#9CA3AF',
        'border-dark': '#2D3748',
      },

      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },

      fontSize: {
        // Display & Headings
        'display': ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h1': ['36px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h2': ['30px', { lineHeight: '1.25', fontWeight: '500' }],
        'h3': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'h4': ['20px', { lineHeight: '1.4', fontWeight: '500' }],
        'h5': ['16px', { lineHeight: '1.5', fontWeight: '500' }],

        // Body Text
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'body': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.4', fontWeight: '400' }],
      },

      spacing: {
        // 4px base grid
        '0.5': '2px',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
        '32': '128px',
      },

      borderRadius: {
        'sm': '4px',
        'DEFAULT': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        'full': '9999px',
      },

      boxShadow: {
        'sm': '0 1px 3px rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'md': '0 6px 16px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 24px rgba(0, 0, 0, 0.12)',
        'gold': '0 4px 12px rgba(212, 168, 67, 0.15)',
        'gold-lg': '0 8px 24px rgba(212, 168, 67, 0.2)',
        'navy': '0 4px 12px rgba(30, 58, 95, 0.2)',
      },

      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },

  plugins: [],
};

/**
 * Usage Example:
 *
 * import { brandOptionA } from './brand-guidelines/option-a/tailwind-config';
 *
 * export default {
 *   ...brandOptionA,
 *   content: ['./src/**\/*.{js,jsx,ts,tsx}'],
 * } satisfies Config;
 *
 *
 * Component Examples:
 *
 * // Logo
 * <h1 className="font-serif text-h1 text-navy">Auto Loan Pro</h1>
 *
 * // Primary Button
 * <button className="bg-navy text-white px-6 py-3 rounded font-medium hover:shadow-navy transition-all">
 *   Get Pre-Approved
 * </button>
 *
 * // Gold CTA Button
 * <button className="bg-gold text-navy px-6 py-3 rounded font-medium hover:shadow-gold transition-all">
 *   View Offers
 * </button>
 *
 * // Card
 * <div className="bg-white border border-light-gray rounded-md p-6 hover:shadow transition-all">
 *   <h3 className="font-serif text-h3 text-navy mb-3">Card Title</h3>
 *   <p className="text-slate text-body">Card content goes here.</p>
 * </div>
 *
 * // Premium Card
 * <div className="bg-white border-2 border-gold rounded-md p-6 shadow-gold">
 *   <span className="inline-block bg-gold text-navy text-caption px-3 py-1 rounded-full font-medium">
 *     Featured
 *   </span>
 * </div>
 *
 * // Form Input
 * <input
 *   type="text"
 *   className="w-full px-4 py-3 border border-light-gray rounded bg-white text-charcoal focus:border-navy focus:ring-2 focus:ring-gold/10 transition-all"
 *   placeholder="Enter amount"
 * />
 *
 * // Success Badge
 * <span className="inline-block bg-success text-white text-caption px-3 py-1 rounded-full font-medium">
 *   Approved
 * </span>
 *
 * // Dark Mode
 * <div className="dark:bg-bg-dark dark:text-text-primary-dark">
 *   <h1 className="text-navy dark:text-navy-dark">Heading</h1>
 * </div>
 */

export default brandOptionA;
