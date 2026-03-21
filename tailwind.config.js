/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Palette: warm, human, intentional
        primary: {
          50: '#f7f6f4',
          100: '#eeece8',
          200: '#ddd9d2',
          300: '#b8b1a6',
          400: '#8a8177',
          500: '#635a50',
          600: '#4d443c',
          700: '#352e28',
          800: '#1f1b17',
          900: '#110e0c',
        },
        accent: {
          50: '#fdf8ef',
          100: '#faefd9',
          200: '#f5deb0',
          300: '#ecc97a',
          400: '#dba94a',
          500: '#c8922e',
          600: '#a87624',
          700: '#885c1d',
          800: '#6d4818',
          900: '#573914',
        },
        warm: {
          50: '#fafaf8',
          100: '#f5f5f0',
          200: '#e8e8e0',
        },
        neutral: {
          50: '#fafaf9',
          100: '#f3f2f0',
          200: '#e5e3df',
          300: '#d4d1cc',
          400: '#a19d97',
          500: '#726e68',
          600: '#56524d',
          700: '#413e3a',
          800: '#2a2724',
          900: '#1a1816',
        },
      },
      fontFamily: {
        sans: ['Sora', 'system-ui', 'sans-serif'],
        serif: ['DM Serif Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
