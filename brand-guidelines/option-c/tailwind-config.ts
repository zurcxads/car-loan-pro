import type { Config } from 'tailwindcss';

/**
 * Auto Loan Pro — Brand Option C: Bold & Disruptive
 * Tailwind CSS Configuration Extension
 *
 * Challenger brand positioning. Dark-first, neon accents, glow effects.
 * Electric blue + neon green + purple palette. Outfit/Sora for headlines.
 */

export const brandOptionC: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        // Primary Colors
        'electric-blue': {
          DEFAULT: '#3B82F6',
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

        'neon-green': {
          DEFAULT: '#22C55E',
          50: '#D1FAE5',
          100: '#A7F3D0',
          200: '#6EE7B7',
          300: '#34D399',
          400: '#10B981',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },

        purple: {
          DEFAULT: '#8B5CF6',
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },

        cyan: {
          DEFAULT: '#06B6D4',
          50: '#ECFEFF',
          100: '#CFFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
          700: '#0E7490',
          800: '#155E75',
          900: '#164E63',
        },

        // Dark Neutrals (Zinc scale)
        'near-black': '#0A0A0A',

        zinc: {
          50: '#F4F4F5',
          100: '#E4E4E7',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
          950: '#09090B',
        },

        // Semantic Colors
        success: '#22C55E',
        warning: '#FBBF24',
        error: '#F43F5E',
        info: '#06B6D4',
      },

      fontFamily: {
        display: ['Outfit', 'Sora', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },

      fontSize: {
        // Display & Headings (Outfit/Sora)
        'display': ['64px', { lineHeight: '1.0', letterSpacing: '-0.03em', fontWeight: '800' }],
        'h1': ['48px', { lineHeight: '1.05', letterSpacing: '-0.025em', fontWeight: '700' }],
        'h2': ['36px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h3': ['28px', { lineHeight: '1.2', fontWeight: '600' }],
        'h4': ['22px', { lineHeight: '1.3', fontWeight: '600' }],
        'h5': ['18px', { lineHeight: '1.4', fontWeight: '600' }],

        // Body Text (Inter)
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '500' }],
        'body': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.03em' }],
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
        '2xl': '24px',
        'full': '9999px',
      },

      boxShadow: {
        'sm': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'DEFAULT': '0 4px 16px rgba(0, 0, 0, 0.4)',
        'md': '0 6px 20px rgba(0, 0, 0, 0.5)',
        'lg': '0 10px 30px rgba(0, 0, 0, 0.6)',

        // Glow effects
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.5)',
        'glow-blue-lg': '0 0 30px rgba(59, 130, 246, 0.6)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.5)',
        'glow-green-lg': '0 0 30px rgba(34, 197, 94, 0.6)',
        'glow-purple': '0 0 24px rgba(139, 92, 246, 0.3)',
        'glow-purple-lg': '0 0 30px rgba(139, 92, 246, 0.6)',
        'glow-cyan': '0 0 16px rgba(6, 182, 212, 0.4)',

        // Featured card glow
        'featured': '0 0 24px rgba(59, 130, 246, 0.3)',
      },

      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
        'gradient-secondary': 'linear-gradient(90deg, #3B82F6, #06B6D4)',
        'gradient-success': 'linear-gradient(135deg, #22C55E, #10B981)',
      },

      animation: {
        'fade-in': 'fadeIn 0.15s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
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
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)' },
        },
      },

      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
      },

      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'DEFAULT': '10px',
      },
    },
  },

  plugins: [],
};

/**
 * Usage Example:
 *
 * import { brandOptionC } from './brand-guidelines/option-c/tailwind-config';
 *
 * export default {
 *   ...brandOptionC,
 *   content: ['./src/**\/*.{js,jsx,ts,tsx}'],
 * } satisfies Config;
 *
 *
 * Component Examples:
 *
 * // Logo
 * <h1 className="font-display text-4xl font-extrabold uppercase tracking-tight bg-gradient-primary bg-clip-text text-transparent">
 *   AUTO LOAN PRO
 * </h1>
 *
 * // Primary Button (Electric Blue)
 * <button className="bg-electric-blue text-white px-7 py-3.5 rounded-lg font-display font-semibold hover:scale-102 hover:shadow-glow-blue transition-all duration-200">
 *   Get Pre-Approved
 * </button>
 *
 * // Secondary Button (Neon Green)
 * <button className="bg-neon-green text-near-black px-7 py-3.5 rounded-lg font-display font-semibold hover:scale-102 hover:shadow-glow-green transition-all duration-200">
 *   Start Now
 * </button>
 *
 * // Gradient Premium Button
 * <button className="bg-gradient-primary text-white px-8 py-3.5 rounded-lg font-display font-bold hover:scale-102 hover:shadow-glow-purple-lg transition-all duration-200">
 *   Premium Action
 * </button>
 *
 * // Outline Button
 * <button className="bg-transparent text-electric-blue border-2 border-electric-blue px-6 py-3 rounded-lg font-display font-semibold hover:bg-electric-blue hover:text-white hover:shadow-glow-blue transition-all">
 *   Learn More
 * </button>
 *
 * // Dark Card (Standard)
 * <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow hover:-translate-y-1 hover:border-electric-blue hover:shadow-featured transition-all">
 *   <h3 className="font-display text-h4 text-white mb-3">Card Title</h3>
 *   <p className="text-zinc-400 text-body">Card content goes here.</p>
 * </div>
 *
 * // Featured Card
 * <div className="bg-zinc-900 border-2 border-electric-blue rounded-lg p-8 shadow-featured">
 *   <span className="inline-block bg-purple/20 text-purple text-caption px-3 py-1.5 rounded-md border border-purple font-display font-semibold uppercase">
 *     Featured
 *   </span>
 *   <h3 className="font-display text-h3 text-white mt-4 mb-2">Best Offer</h3>
 *   <p className="text-zinc-400">Top rated with lowest APR.</p>
 * </div>
 *
 * // Glass Card
 * <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-6">
 *   <h3 className="font-display text-h4 text-white mb-2">Glass Morphism</h3>
 *   <p className="text-zinc-400">Modern transparent effect.</p>
 * </div>
 *
 * // Form Input
 * <input
 *   type="text"
 *   className="w-full px-4 py-3.5 border border-zinc-700 rounded-lg bg-zinc-900 text-white placeholder:text-zinc-400 focus:border-electric-blue focus:shadow-glow-cyan focus:outline-none transition-all"
 *   placeholder="Enter amount"
 * />
 *
 * // Success Badge
 * <span className="inline-block bg-neon-green/20 text-neon-green text-caption px-3 py-1.5 rounded-md border border-neon-green font-display font-semibold uppercase">
 *   Approved
 * </span>
 *
 * // Pill Badge
 * <span className="inline-block bg-zinc-800 text-cyan text-caption px-3.5 py-1.5 rounded-full font-display font-medium uppercase">
 *   Premium
 * </span>
 *
 * // Hero Section
 * <div className="text-center bg-zinc-900 border border-zinc-800 rounded-lg p-20 relative overflow-hidden">
 *   <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-electric-blue via-purple to-cyan"></div>
 *   <h1 className="font-display text-display font-extrabold uppercase text-white mb-6 tracking-tight">
 *     BEAT THE SYSTEM
 *   </h1>
 *   <p className="text-body-lg font-medium text-zinc-400 max-w-2xl mx-auto mb-10">
 *     Stop getting screwed. Get your money first.
 *   </p>
 *   <button className="bg-gradient-primary text-white px-10 py-4 rounded-lg font-display font-bold text-lg hover:shadow-glow-purple-lg hover:scale-102 transition-all">
 *     Get Pre-Approved Now
 *   </button>
 * </div>
 *
 * // Gradient Text
 * <h2 className="font-display text-h1 font-bold bg-gradient-primary bg-clip-text text-transparent">
 *   Gradient Headline
 * </h2>
 *
 * // Glow Animation
 * <div className="bg-zinc-900 border-2 border-electric-blue rounded-lg p-6 animate-glow-pulse">
 *   Pulsing glow effect
 * </div>
 */

export default brandOptionC;
