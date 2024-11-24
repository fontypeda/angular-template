import type { Config } from 'tailwindcss';
import { primaryColors, themeColors } from './src/app/config/colors';

const config: Config = {
  content: [
    "./src/**/*.{html,ts}",  // Angular template and component files
    "./src/**/*.scss",       // SCSS style files
    "./src/**/*.css",        // CSS style files
    "./projects/**/*.{html,ts,scss,css}" // Files in other Angular projects
  ],
  darkMode: ['.dark'], // Match PrimeNG's dark mode selector
  theme: {
    extend: {
      colors: {
        primary: primaryColors,
        theme: {
          bg: {
            DEFAULT: themeColors.background.light,
            dark: themeColors.background.dark,
          },
          surface: {
            DEFAULT: themeColors.surface.light,
            dark: themeColors.surface.dark,
          },
          text: {
            DEFAULT: themeColors.text.light,
            dark: themeColors.text.dark,
          }
        }
      }
    },
  },
  plugins: [require('tailwindcss-primeui')],
};

export default config;
