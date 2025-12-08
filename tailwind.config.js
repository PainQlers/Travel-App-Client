/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1da5c0",
          dark: "#12849a",
        },
      },
      boxShadow: {
        card: "0 15px 35px rgba(20, 102, 122, 0.08)",
      },
    },
  },
  plugins: [],
};

