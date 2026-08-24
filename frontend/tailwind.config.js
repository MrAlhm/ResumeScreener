/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          base: '#08090d',
          surface: '#0d0f17',
          card: '#121520',
          elevated: '#171b29',
          hover: '#1d2233',
          border: '#1e2433',
          borderSubtle: '#161a26',
          borderStrong: '#2c354a'
        },
        unthinkable: {
          accent: '#00f2c3',
          accentMuted: '#0d9488',
          accentGlow: 'rgba(0, 242, 195, 0.15)',
          slate: '#94a3b8',
          light: '#f8fafc',
          muted: '#64748b'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
