import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-ibm-plex)', 'IBM Plex Sans', 'sans-serif'],
      },
      colors: {
        gold: { DEFAULT: '#F59E0B', light: '#FBBF24', dim: 'rgba(245,158,11,0.15)' },
        purple: { DEFAULT: '#8B5CF6', light: '#A78BFA', dim: 'rgba(139,92,246,0.15)' },
        navy: { DEFAULT: '#0F172A', light: '#1E293B', surface: 'rgba(30,41,59,0.6)' },
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
};
export default config;
