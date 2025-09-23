/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Futuristic Neon Theme
        neon: {
          blue: '#00ffff',
          purple: '#8b5cf6',
          pink: '#f472b6',
          green: '#00ff00',
          orange: '#ff6600',
          red: '#ff0000',
          yellow: '#ffff00'
        },
        space: {
          dark: '#0f0f23',
          darker: '#0a0a1a',
          navy: '#1a1a2e',
          blue: '#16213e',
          purple: '#0f3460'
        },
        cyber: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e'
        }
      },
      fontFamily: {
        'cyber': ['Orbitron', 'monospace'],
        'space': ['Exo 2', 'sans-serif']
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-in',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 2s infinite'
      },
      keyframes: {
        glow: {
          '0%': { 
            boxShadow: '0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 15px #00ffff',
            textShadow: '0 0 5px #00ffff'
          },
          '100%': { 
            boxShadow: '0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff',
            textShadow: '0 0 10px #00ffff'
          }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'space-gradient': 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        'neon-gradient': 'linear-gradient(45deg, #00ffff 0%, #8b5cf6 50%, #f472b6 100%)'
      },
      backdropBlur: {
        xs: '2px'
      },
      boxShadow: {
        'neon': '0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 15px #00ffff',
        'neon-lg': '0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff',
        'neon-purple': '0 0 5px #8b5cf6, 0 0 10px #8b5cf6, 0 0 15px #8b5cf6',
        'neon-pink': '0 0 5px #f472b6, 0 0 10px #f472b6, 0 0 15px #f472b6',
        'cyber': '0 4px 14px 0 rgba(0, 255, 255, 0.39)',
        'cyber-lg': '0 10px 25px 0 rgba(0, 255, 255, 0.5)'
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem'
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem'
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class'
    })
  ]
}