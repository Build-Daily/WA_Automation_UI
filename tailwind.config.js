/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", "sans-serif"],
        mono: ["'DM Mono'", "monospace"],
      },
      colors: {
        surface: {
          0: "#0D0F12",
          1: "#13161B",
          2: "#1A1E25",
          3: "#222730",
        },
        border: "#2A303C",
        accent: {
          green: "#25D366",
          "green-dim": "#1A9948",
          amber: "#F5A623",
          red: "#E53935",
          blue: "#4A9EFF",
        },
        text: {
          primary: "#F0F2F5",
          secondary: "#8A95A3",
          muted: "#4E5769",
        },
      },
    },
  },
  plugins: [],
};
