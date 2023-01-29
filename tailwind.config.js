const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    fontFamily: {
      mono: ['"Fira Mono"', ...defaultTheme.fontFamily.mono],
      fira: ['"Fira Sans"', ...defaultTheme.fontFamily.sans],
    },
    extend: {
      boxShadow: {
        'm': '0 4px 10px -4px rgb(0 0 0 / 0.5)',
        'l': '0 5px 20px -10px rgb(0 0 0 / 0.95)',
      },
      colors: {
        'spring': {
          400: '#bbdd77',
          600: '#88b544',
          700: '#759B3B',
        },
        'zinc': {
          750: '#313137',
          850: '#1F1F21'
        },
        'blade': {
          50: '#F9FAFA',
          100: '#F4F5F6',
          200: '#E6E7EA',
          300: '#D3D6D9',
          350: '#BBBEC3',
          400: '#A0A4AB',
          500: '#6F737B',
          600: '#50565E',
          700: '#3D434C',
          750: '#30343B',
          800: '#242A32',
          850: '#1E2229',
          900: '#161A22',
          950: '#0A0C0F',
        }
      },
      maxWidth: {
        '2xs': '16rem',
      },
      screens: {
        '2xs': '360px',
        'xs': '480px',
        '3xl': '1792px',
      },
      height: {
        '1/2v': '50vh',
      },
      strokeWidth: {
        '1.5': '1.5',
        '10': '10',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}
