module.exports = {
  content: ["./src/**/*.{jsx, js}"],

  theme: {
    screen: {
      sm: "576px",
      md: "768px",
      lg: "992px",
      xl: "1200px",
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
