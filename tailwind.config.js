/** @type {import('tailwindcss').Config} */

// Neutral ink ramp: white (50) -> ink (900). The logo is black ink on white, so the
// whole UI is monochrome and the only hue is `presence`. See DESIGN.md.
const ink = {
  50: '#FFFFFF', // page
  100: '#F4F4F3', // surface
  200: '#E6E6E4', // line
  300: '#D0D0CD',
  400: '#9A9A96',
  500: '#6E6E6A', // secondary text, 5.1:1 on white
  600: '#52524F',
  700: '#3A3A38',
  800: '#232322',
  900: '#111111', // ink
  950: '#0A0A0A',
};

module.exports = {
  // Hover styles only on devices that hover, so taps don't leave buttons stuck gray.
  future: { hoverOnlyWhenSupported: true },
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        neutral: ink,
        // Kept as aliases so older pages keep compiling; they resolve to ink.
        accent: ink,
        primary: ink,
        // The single color: what is still alive (the result and its squares).
        presence: 'rgb(var(--presence) / <alpha-value>)',
        warm: {
          50: '#F4F4F3',
          100: '#F4F4F3',
          200: '#E6E6E4',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '6px',
        md: '6px',
        lg: '10px',
        xl: '10px',
        '2xl': '10px',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.2, 0, 0, 1)',
      },
    },
  },
  plugins: [],
};
