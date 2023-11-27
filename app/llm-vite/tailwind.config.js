/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("daisyui")
  ],
  daisyui: {
    themes: [
      { 'light' : {
        ...require('daisyui/src/theming/themes')['[data-theme=light]'],
        "--btn-text-case": "lowercase"
      }}, 
      { 'dark'  : {
        ...require('daisyui/src/theming/themes')['[data-theme=dark]'],
        "--btn-text-case": "lowercase"
      }}, "cupcake", "business", "corporate"],
  }
}
