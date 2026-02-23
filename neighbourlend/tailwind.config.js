/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#B2F000",      // lime green
        dark:    "#0D0D0D",      // near black
        surface: "#F4F4F4",      // light grey
      },
      borderRadius: {
        pill: "999px",
      }
    },
  },
  plugins: [],
}

