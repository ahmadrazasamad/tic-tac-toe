/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./distribution/*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        "bouncy" : ["bouncy", "sans-serif"],
      },
    },
  },
  plugins: [],
}