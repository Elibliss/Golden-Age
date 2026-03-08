module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#FF7A1A',
          dark: '#E56700'
        },
        success: {
          DEFAULT: '#16A34A'
        }
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial']
      },
      borderRadius: {
        xl: '1rem'
      }
    }
  },
  plugins: [],
};
