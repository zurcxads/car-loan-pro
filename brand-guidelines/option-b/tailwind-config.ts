import type { Config } from 'tailwindcss';

/**
 * Auto Loan Pro — Brand Option B: Modern Marketplace
 * Tailwind CSS Configuration Extension
 *
 * Current direction refined. Modern, fast, tech-forward fintech.
 * Blue-600 primary, Inter sans-serif, clean design system.
 */

export const brandOptionB: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        // Primary Colors
        blue: {
          DEFAULT: '#2563EB',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },

        // Extended Green for Success
        green: {
          DEFAULT: '#10B981',
          50: '#D1FAE5',
          100: '#A7F3D0',
          200: '#6EE7B7',
          300: '#34D399',
          400: '#10B981',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },

        // Semantic Colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',

        // Dark Mode Colors
        'bg-dark': '#0F172A',
        'surface-dark': '#1E293B',
        'text-primary-dark': '#F1F5F9',
        'text-secondary-dark': '#94A3B8',
        'border-dark': '#334155',
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },

      fontSize: {
        // Display & Headings
        'display': ['56px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h1': ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h2': ['36px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h3': ['30px', { lineHeight: '1.2', fontWeight: '600' }],
        'h4': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'h5': ['20px', { lineHeight: '1.4', fontWeight: '500' }],
        'h6': ['16px', { lineHeight: '1.5', fontWeight: '500' }],

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
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
      },

      borderRadius: {
        'sm': '4px',
        'DEFAULT': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        'full': '9999px',
      },

      boxShadow: {
        'xs': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'md': '0 6px 16px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 24px rgba(0, 0, 0, 0.12)',
        'xl': '0 20px 40px rgba(0, 0, 0, 0.15)',
        'blue': '0 4px 12px rgba(37, 99, 235, 0.25)',
        'blue-lg': '0 8px 24px rgba(37, 99, 235, 0.3)',
        'green': '0 4px 12px rgba(16, 185, 129, 0.25)',
      },

      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },

      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },

  plugins: [],
};

/**
 * Usage Example:
 *
 * import { brandOptionB } from './brand-guidelines/option-b/tailwind-config';
 *
 * export default {
 *   ...brandOptionB,
 *   content: ['./src/**\/*.{js,jsx,ts,tsx}'],
 * } satisfies Config;
 *
 *
 * Component Examples:
 *
 * // Logo
 * <h1 className="font-sans text-3xl font-bold text-gray-900">
 *   Auto Loan <span className="text-blue-600">Pro</span>
 * </h1>
 *
 * // Primary Button
 * <button className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 hover:shadow-blue transition-all">
 *   Get Pre-Approved
 * </button>
 *
 * // Secondary Button
 * <button className="bg-white text-gray-900 px-5 py-2.5 rounded-lg font-semibold border border-gray-200 hover:bg-gray-50 shadow-xs transition-all">
 *   Learn More
 * </button>
 *
 * // Outline Button
 * <button className="bg-transparent text-blue-600 px-4 py-2 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-all">
 *   View Details
 * </button>
 *
 * // Success Button
 * <button className="bg-green-500 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-green-600 shadow-xs transition-all">
 *   Confirm Approval
 * </button>
 *
 * // Standard Card
 * <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow transition-all hover:-translate-y-0.5">
 *   <h3 className="text-h4 text-gray-900 mb-3">Card Title</h3>
 *   <p className="text-gray-600 text-body">Card content goes here.</p>
 * </div>
 *
 * // Featured Card
 * <div className="bg-blue-50 border-2 border-blue-600 rounded-lg p-6 shadow-sm">
 *   <span className="inline-block bg-blue-50 text-blue-700 text-caption px-2.5 py-1 rounded-md border border-blue-200 font-medium">
 *     Featured
 *   </span>
 *   <h3 className="text-h4 text-gray-900 mt-3 mb-2">Best Offer</h3>
 *   <p className="text-gray-600">Top rated lender with lowest APR.</p>
 * </div>
 *
 * // Form Input
 * <input
 *   type="text"
 *   className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all"
 *   placeholder="Enter amount"
 * />
 *
 * // Success Badge
 * <span className="inline-block bg-green-50 text-green-700 text-caption px-2.5 py-1 rounded-md border border-green-200 font-medium">
 *   Approved
 * </span>
 *
 * // Hero Section
 * <div className="text-center">
 *   <h1 className="text-display text-gray-900 mb-6">
 *     Get your money first, then go shopping
 *   </h1>
 *   <p className="text-body-lg text-gray-600 max-w-2xl mx-auto mb-8">
 *     Compare rates from 15+ lenders in 2 minutes. Zero impact to your credit.
 *   </p>
 *   <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:shadow-blue transition-all">
 *     Get Pre-Approved Now
 *   </button>
 * </div>
 *
 * // Dark Mode
 * <div className="dark:bg-bg-dark dark:text-text-primary-dark">
 *   <h1 className="text-blue-600 dark:text-blue-400">Heading</h1>
 *   <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark">
 *     Card content
 *   </div>
 * </div>
 */

export default brandOptionB;
