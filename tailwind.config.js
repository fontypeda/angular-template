/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",  // Angular template and component files
    "./src/**/*.scss",       // SCSS style files
    "./src/**/*.css",        // CSS style files
    "./projects/**/*.{html,ts,scss,css}" // Files in other Angular projects
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // You can add custom colors here that match your PrimeNG theme
        primary: {
          50: 'rgb(var(--primary-50))',
          100: 'rgb(var(--primary-100))',
          200: 'rgb(var(--primary-200))',
          300: 'rgb(var(--primary-300))',
          400: 'rgb(var(--primary-400))',
          500: 'rgb(var(--primary-500))',
          600: 'rgb(var(--primary-600))',
          700: 'rgb(var(--primary-700))',
          800: 'rgb(var(--primary-800))',
          900: 'rgb(var(--primary-900))'
        }
      }
    },
  },
  plugins: [require('tailwindcss-primeui')],
  important: true, // This ensures Tailwind classes take precedence over PrimeNG styles
  corePlugins: {
    preflight: false // Disable Tailwind's base styles to prevent conflicts with PrimeNG
  }
}
