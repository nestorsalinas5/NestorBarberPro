/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./services/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-bg': '#121212', // Very dark gray, almost black
        'brand-surface': '#1E1E1E', // Lighter dark gray for cards/modals
        'brand-text': '#E0E0E0', // Main text color (off-white)
        'brand-text-secondary': '#A0A0A0', // Lighter text for secondary info
        'brand-primary': 'var(--color-primary, #D4AF37)', // Gold accent color (now a CSS variable)
        'brand-secondary': 'var(--color-secondary, #F0C44D)', // Lighter gold for hover effects (now a CSS variable)
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
