/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0f172a', // Slate 900
          light: '#1e293b',   // Slate 800
        },
        secondary: {
          DEFAULT: '#f8fafc', // Slate 50
          dark: '#f1f5f9',    // Slate 100
        },
        accent: {
          DEFAULT: '#3b82f6', // Blue 500
          hover: '#2563eb',   // Blue 600
        }
      }
    },
  },
  plugins: [],
}
