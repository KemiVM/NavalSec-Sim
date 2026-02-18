/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neon: {
          blue: '#00f3ff',
          pink: '#ff00ff',
          green: '#00ff9d',
          dark: '#0a0a12',
          surface: '#12121f'
        }
      },
      fontFamily: {
        cyber: ['"Orbitron"', 'sans-serif'],
        mono: ['"Share Tech Mono"', 'monospace']
      }
    },
  },
  plugins: [],
}
