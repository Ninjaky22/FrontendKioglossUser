module.exports = {
  content: ["./src/**/*.{jsx, js}"],

  theme: {
    // Corregido de "screen" a "screens" para que Tailwind lo detecte bien
    screens: {
      sm: "576px",
      md: "768px",
      lg: "992px",
      xl: "1200px",
      "2xl": "1536px", // Monitores de 24" y 27"
      "3xl": "1800px", // Monitores gigantes o ultra anchos
    },
    container: {
      center: true,
      padding: "1rem",
    },
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
        pacifico: ["Pacifico", "cursive"],
        swash: ['Berkshire Swash', 'serif'],
        surfer: ['Original Surfer', 'cursive'],
        winkySans: ['Winky Sans', 'sans-serif'],
      },
      colors: {
        primary: "#fd3d57",
        hoverFavorite: "#ff6f81",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
};