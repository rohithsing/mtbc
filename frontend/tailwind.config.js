/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'book-brand': '#FF3366', // Vibrant pink-red for booking
        'book-surface': '#FFFFFF',
        'book-bg': '#FDFDFD',
        'cancel-brand': '#111827', // Dark slate for cancellation
        'cancel-danger': '#DC2626', // Red for cancellation warnings
        'cancel-surface': '#1F2937', 
        'cancel-bg': '#111827'
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
