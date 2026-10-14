/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#F9F8F5',
          muted: '#F4F3EE',
          dark: '#121316',
          'dark-surface': '#1A1B1E',
        },
        ink: {
          DEFAULT: '#121316',
          secondary: '#6B6A66',
          muted: '#9A9993',
          inverted: '#F9F8F5',
        },
        hairline: {
          DEFAULT: '#E5E4DE',
          strong: '#D3D2CA',
          dark: '#26272B',
        },
        fable: {
          chartreuse: '#D4FF3A',
          cinnabar: '#FF4B26',
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        }
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'editorial': '2px 2px 0px 0px rgba(18, 19, 22, 0.06)',
        'editorial-lg': '4px 4px 0px 0px rgba(18, 19, 22, 0.08)',
        'editorial-lift': '4px 4px 0px 0px rgba(18, 19, 22, 0.12)',
      }
    },
  },
  plugins: [],
};
