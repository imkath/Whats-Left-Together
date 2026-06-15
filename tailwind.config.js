/** @type {import('tailwindcss').Config} */

// Warm ink ramp: paper (50) -> ink (950). Drives light surfaces and, by
// inversion, dark text. The brand is monochrome (the logo is ink on paper),
// so the decorative palettes collapse into this single warm-neutral system.
const ink = {
  50: '#F6F2EA', // paper
  100: '#ECE6DB', // tiza / warm surface
  200: '#E3DCCF', // line
  300: '#D2C8B8',
  400: '#A89E8E',
  500: '#7D7365',
  600: '#5E5648',
  700: '#423B31',
  800: '#2A241E',
  900: '#17130F', // pizarra / ink
  950: '#110E0B',
};

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
        neutral: ink,
        // Formerly gold/brown accents. Collapsed into the monochrome ink system:
        // emphasis comes from weight and ink, never from a decorative hue.
        accent: ink,
        primary: ink,
        // The single color of the system: crepúsculo. Reserved for "what is still
        // alive" (median encounters, the "both alive" series). Flips light/dark via
        // the --presence CSS variable defined in globals.css.
        presence: 'rgb(var(--presence) / <alpha-value>)',
        warm: {
          50: '#FAF7F1',
          100: '#F1ECE2',
          200: '#E3DCCF',
        },
      },
      fontFamily: {
        sans: ['Sora', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
