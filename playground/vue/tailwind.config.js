const colors = require("tailwindcss/colors");

module.exports = {
  content: ["./public/index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        gray: colors.gray,
        cyan: colors.cyan,
        fuchsia: colors.fuchsia,
        sky: colors.sky,
        lime: colors.lime,
        rose: colors.rose,
        emerald: colors.emerald,
      },
    },
  },
  plugins: [],
};
