/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: '#0f172a', // Slate 900
        'dark-paper': 'rgba(30, 41, 59, 0.4)', // Glass slate base
        primary: '#34d399', // Light emerald-400
        'primary-dark': '#10b981', // Emerald-500
        'primary-light': '#6ee7b7', // Emerald-300
        sky: '#35A7FF', // Cool Sky
        'sky-dark': '#1e8ee6', // Darker Cool Sky
        'sky-light': '#66beff', // Lighter Cool Sky
      },
      animation: {
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
