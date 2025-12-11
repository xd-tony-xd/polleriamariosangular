// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{html,ts}',
    './node_modules/preline/dist/*.js',
  ],
  darkMode: 'class', // <-- Asegúrate de que esta línea exista y sea 'class'
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('preline/plugin'),
  ],
};
