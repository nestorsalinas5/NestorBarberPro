/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-bg': '#121212', // Very dark gray, almost black
        'brand-surface': '#1E1E1E', // Lighter dark gray for cards/modals
        'brand-text': '#E0E0E0', // Main text color (off-white)
        'brand-text-secondary': '#A0A0A0', // Lighter text for secondary info
        'brand-primary': '#D4AF37', // Gold accent color
        'brand-secondary': '#F0C44D', // Lighter gold for hover effects
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
}
